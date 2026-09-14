import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/constants/app_colors.dart';
import '../../../injection_container.dart';
import '../../cubit/passenger/passenger_cubit.dart';
import '../../cubit/passenger/passenger_state.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/error_display.dart';
import '../../widgets/common/loading_indicator.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/models.dart';

class TicketPage extends StatelessWidget {
  final String bookingId;
  const TicketPage({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<PassengerCubit>()..getBookingDetails(bookingId),
      child: const _TicketView(),
    );
  }
}

class _TicketView extends StatelessWidget {
  const _TicketView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Your Ticket')),
      body: BlocConsumer<PassengerCubit, PassengerState>(
        listener: (context, state) {
          if (state is PassengerError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message), backgroundColor: AppColors.error),
            );
          }
        },
        builder: (context, state) {
          if (state is BookingDetailsLoading) {
            return const LoadingIndicator(message: 'Loading ticket...');
          }
          if (state is PassengerError) {
            return ErrorDisplay(
              message: state.message,
              onRetry: () => context.read<PassengerCubit>().refreshBooking(),
            );
          }
          if (state is BookingDetailsLoaded) {
            return _buildTicket(context, state.booking, state.passengerName);
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildTicket(BuildContext context, Booking booking, String? passengerName) {
    final trip = booking.trip;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                // Header
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                  ),
                  child: const Column(
                    children: [
                      Text(
                        'ZAMBUS',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 2,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'E-TICKET',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white70,
                          letterSpacing: 1,
                        ),
                      ),
                    ],
                  ),
                ),

                // Body
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      if (trip != null) ...[
                        _row('Route', trip.routeDisplay),
                        const Divider(height: 24),
                        _row('Departure', trip.departureTime != null ? Formatters.formatDisplayDateTime(trip.departureTime!) : 'N/A'),
                        const Divider(height: 24),
                        _row('Bus', [trip.busReg, trip.busModel].whereType<String>().join(' - ')),
                        const Divider(height: 24),
                      ],
                      _row('Passenger', passengerName ?? 'You'),
                      const Divider(height: 24),
                      _row('Seat', '${booking.seatNumber}'),
                      const Divider(height: 24),
                      if (trip?.fareAmount != null) ...[
                        _row('Fare', Formatters.formatCurrency(trip!.fareAmount!)),
                        const Divider(height: 24),
                      ],
                      const Divider(height: 24),
                      _row('Ticket ID', booking.bookingId.substring(0, 8).toUpperCase()),
                      const Divider(height: 24),
                      _row('Payment', Formatters.formatPaymentStatus(booking.paymentStatus)),
                      const Divider(height: 24),
                      _row('Status', Formatters.formatBoardingStatus(booking.boardingStatus)),
                      const SizedBox(height: 24),

                      // QR code - contains the exact ticket payload the
                      // conductor's scanner validates against the backend.
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: QrImageView(
                          data: booking.qrCodeData,
                          version: QrVersions.auto,
                          size: 180,
                          backgroundColor: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Show this ticket to the conductor for scanning',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Complete payment for a pending booking (e.g. after a failed or
          // abandoned checkout). Seat stays locked until payment confirms.
          if (booking.isPending)
            SizedBox(
              width: double.infinity,
              child: AppButton(
                label: 'Complete Payment',
                onPressed: () => context.read<PassengerCubit>().confirmBooking(booking.bookingId),
                icon: Icons.payment,
              ),
            ),

          const SizedBox(height: 8),

          // Cancel booking (if eligible)
          if (booking.canCancel)
            SizedBox(
              width: double.infinity,
              child: AppButton(
                label: 'Cancel Booking',
                variant: AppButtonVariant.outline,
                onPressed: () => _confirmCancel(context, booking.bookingId),
                icon: Icons.cancel_outlined,
              ),
            ),
        ],
      ),
    );
  }

  void _confirmCancel(BuildContext context, String bookingId) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Cancel Booking?'),
        content: const Text(
          'Your seat will be released and the fare refunded to your payment method. This cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Keep Ticket'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () {
              Navigator.pop(dialogContext);
              context.read<PassengerCubit>().cancelBooking(bookingId);
            },
            child: const Text('Cancel Booking'),
          ),
        ],
      ),
    );
  }

  Widget _row(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
        Flexible(
          child: Text(
            value,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
            textAlign: TextAlign.end,
          ),
        ),
      ],
    );
  }
}
