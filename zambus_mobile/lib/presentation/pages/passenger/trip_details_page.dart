import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../../../injection_container.dart';
import '../../cubit/passenger/passenger_cubit.dart';
import '../../cubit/passenger/passenger_state.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/loading_indicator.dart';
import '../../widgets/common/error_display.dart';
import '../../widgets/map/route_map_widget.dart';
import '../../../core/utils/formatters.dart';

class TripDetailsPage extends StatelessWidget {
  final String tripId;
  const TripDetailsPage({super.key, required this.tripId});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<PassengerCubit>()..getTripDetails(tripId),
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Trip Details')),
        body: BlocBuilder<PassengerCubit, PassengerState>(
          builder: (context, state) {
            if (state is TripDetailsLoading) {
              return const LoadingIndicator(message: 'Loading trip details...');
            }
            if (state is TripDetailsLoaded) {
              final trip = state.trip;
              return SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Route header
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Text(
                                      Formatters.formatDisplayTime(trip.departureTime),
                                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                                    ),
                                    Text(
                                      trip.origin ?? 'Origin',
                                      style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.8)),
                                    ),
                                  ],
                                ),
                              ),
                              Column(
                                children: [
                                  Icon(Icons.directions_bus, color: Colors.white.withValues(alpha: 0.8), size: 24),
                                  const SizedBox(height: 4),
                                  Text(
                                    trip.route?.routeName ?? 'Direct',
                                    style: TextStyle(fontSize: 11, color: Colors.white.withValues(alpha: 0.7)),
                                  ),
                                ],
                              ),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Text(
                                      Formatters.formatDisplayTime(trip.estimatedArrival),
                                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                                    ),
                                    Text(
                                      trip.destination ?? 'Destination',
                                      style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.8)),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Trip info
                    _InfoCard(
                      children: [
                        _InfoRow(icon: Icons.calendar_today, label: 'Date', value: Formatters.formatDisplayDate(trip.departureTime)),
                        const Divider(),
                        _InfoRow(icon: Icons.directions_bus, label: 'Bus', value: '${trip.bus?.model ?? "N/A"} (${trip.bus?.registrationNumber ?? "N/A"})'),
                        const Divider(),
                        _InfoRow(icon: Icons.event_seat, label: 'Capacity', value: '${trip.bus?.seatCapacity ?? 40} seats'),
                        const Divider(),
                        _InfoRow(icon: Icons.star_outline, label: 'Category', value: Formatters.formatBusCategory(trip.busCategory)),
                        const Divider(),
                        _InfoRow(icon: Icons.attach_money, label: 'Fare', value: Formatters.formatCurrency(trip.fareAmount)),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Route map (Zambian cities; falls back to placeholder
                    // when a city is not in the predefined coordinate set).
                    if (trip.origin != null && trip.destination != null)
                      RouteMapWidget(
                        origin: trip.origin,
                        destination: trip.destination,
                        intermediateStops: trip.route?.intermediateStops ?? const [],
                        height: 220,
                      ),
                    const SizedBox(height: 20),

                    // Status
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: trip.canBook ? AppColors.successLight : AppColors.warningLight,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            trip.canBook ? Icons.check_circle : Icons.warning,
                            color: trip.canBook ? AppColors.success : AppColors.warning,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            trip.canBook ? 'Booking is available' : 'Booking is not available (${Formatters.formatTripStatus(trip.status)})',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: trip.canBook ? AppColors.success : AppColors.warning,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Book button
                    if (trip.canBook)
                      AppButton(
                        label: 'Select Seat - ${Formatters.formatCurrency(trip.fareAmount)}',
                        onPressed: () {
                          Navigator.pushNamed(context, '/passenger/seat-selection', arguments: {
                            'tripId': trip.tripId,
                            'busCapacity': trip.bus?.seatCapacity ?? 40,
                          });
                        },
                        icon: Icons.event_seat,
                      ),
                  ],
                ),
              );
            }
            if (state is PassengerError) {
              return ErrorDisplay(message: state.message, onRetry: () {
                context.read<PassengerCubit>().getTripDetails(tripId);
              });
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final List<Widget> children;
  const _InfoCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: children),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(width: 12),
        Text(label, style: const TextStyle(color: AppColors.textSecondary)),
        const Spacer(),
        Flexible(
          child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600), textAlign: TextAlign.end),
        ),
      ],
    );
  }
}
