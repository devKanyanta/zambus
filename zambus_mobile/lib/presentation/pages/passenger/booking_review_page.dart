import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../../../injection_container.dart';
import '../../cubit/passenger/passenger_cubit.dart';
import '../../cubit/passenger/passenger_state.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/loading_indicator.dart';
import '../../widgets/common/error_display.dart';
import '../../../core/utils/formatters.dart';

class BookingReviewPage extends StatelessWidget {
  final String tripId;
  final int seatNumber;
  const BookingReviewPage({super.key, required this.tripId, required this.seatNumber});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<PassengerCubit>()..getTripDetails(tripId),
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Review Booking')),
        body: BlocConsumer<PassengerCubit, PassengerState>(
          listener: (context, state) {
            if (state is BookingConfirmed) {
              // Booking is CONFIRMED with final QR data - go to the ticket.
              Navigator.pushReplacementNamed(context, '/passenger/ticket', arguments: state.booking.bookingId);
            } else if (state is PassengerError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message), backgroundColor: AppColors.error),
              );
            }
          },
          builder: (context, state) {
            if (state is TripDetailsLoading) {
              return const LoadingIndicator(message: 'Loading trip...');
            }
            if (state is BookingCreating) {
              return const LoadingIndicator(message: 'Processing payment...');
            }
            if (state is PassengerError) {
              // Booking/payment failed (e.g. seat taken while reviewing).
              // The listener already showed a snackbar; give the user a way
              // out instead of a blank screen.
              return ErrorDisplay(
                message: state.message,
                onRetry: () {
                  Navigator.of(context).pop();
                },
                retryLabel: 'Go Back & Re-select Seat',
              );
            }
            if (state is TripDetailsLoaded) {
              final trip = state.trip;
              return SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Booking summary card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Booking Summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 20),
                          _SummaryRow(label: 'Route', value: '${trip.origin} to ${trip.destination}'),
                          const Divider(),
                          _SummaryRow(label: 'Date', value: Formatters.formatDisplayDate(trip.departureTime)),
                          const Divider(),
                          _SummaryRow(label: 'Departure', value: Formatters.formatDisplayTime(trip.departureTime)),
                          const Divider(),
                          _SummaryRow(label: 'Bus', value: trip.bus?.model ?? 'N/A'),
                          const Divider(),
                          _SummaryRow(label: 'Registration', value: trip.bus?.registrationNumber ?? 'N/A'),
                          const Divider(),
                          _SummaryRow(label: 'Seat Number', value: '$seatNumber'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Price card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total Fare', style: TextStyle(fontSize: 16, color: AppColors.textSecondary)),
                          Text(
                            Formatters.formatCurrency(trip.fareAmount),
                            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.primary),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Payment notice
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.infoLight,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.info_outline, color: AppColors.info, size: 20),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Mock payment for Phase 1. No real payment will be processed.',
                              style: TextStyle(fontSize: 13, color: AppColors.info),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Confirm button
                    AppButton(
                      label: 'Confirm Payment - ${Formatters.formatCurrency(trip.fareAmount)}',
                      onPressed: () {
                        // Creates the booking (locks the seat) then confirms
                        // payment, producing the final QR ticket.
                        context.read<PassengerCubit>().bookAndPay(tripId, seatNumber);
                      },
                      icon: Icons.payment,
                    ),
                  ],
                ),
              );
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  const _SummaryRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary)),
          Flexible(
            child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600), textAlign: TextAlign.end),
          ),
        ],
      ),
    );
  }
}
