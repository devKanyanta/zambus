import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../../../injection_container.dart';
import '../../cubit/driver/driver_cubit.dart';
import '../../cubit/driver/driver_state.dart';
import '../../widgets/common/loading_indicator.dart';
import '../../widgets/common/empty_state.dart';
import '../../widgets/common/app_input.dart';
import '../../../core/utils/formatters.dart';

class ManifestPage extends StatefulWidget {
  final String? tripId;
  const ManifestPage({super.key, this.tripId});

  @override
  State<ManifestPage> createState() => _ManifestPageState();
}

class _ManifestPageState extends State<ManifestPage> {
  final _tripIdController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.tripId != null) {
      _tripIdController.text = widget.tripId!;
      context.read<DriverCubit>().loadManifest(widget.tripId!);
    }
  }

  @override
  void dispose() {
    _tripIdController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Passenger Manifest')),
      body: Column(
        children: [
          // Trip ID input
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.surface,
            child: Row(
              children: [
                Expanded(
                  child: AppInput(
                    label: 'Trip ID',
                    controller: _tripIdController,
                    hint: 'Enter trip ID',
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: () {
                    final tripId = _tripIdController.text.trim();
                    if (tripId.isNotEmpty) {
                      context.read<DriverCubit>().loadManifest(tripId);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(60, 48),
                  ),
                  child: const Icon(Icons.search),
                ),
              ],
            ),
          ),

          // Offline cache notice (DRV-006: manifest is loaded once and can be
          // used offline; re-enter the trip ID to refresh when back online).
          BlocListener<DriverCubit, DriverState>(
            listener: (context, state) {
              if (state is BoardingMarked) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Passenger status updated'), backgroundColor: AppColors.success),
                );
              }
            },
            child: const SizedBox.shrink(),
          ),

          // Manifest
          Expanded(
            child: BlocBuilder<DriverCubit, DriverState>(
              builder: (context, state) {
                if (state is ManifestLoading) {
                  return const LoadingIndicator(message: 'Loading manifest...');
                }
                if (state is ManifestLoaded) {
                  final manifest = state.manifest;
                  return Column(
                    children: [
                      // Trip info header
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        color: AppColors.primary.withValues(alpha: 0.05),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${manifest.trip.origin ?? "Origin"} to ${manifest.trip.destination ?? "Destination"}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Bus: ${manifest.trip.busReg ?? "N/A"} | Departure: ${Formatters.formatDisplayDateTime(manifest.trip.departureTime)}',
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                            ),
                          ],
                        ),
                      ),

                      // Stats
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        child: Row(
                          children: [
                            _StatChip(label: 'Total', value: '${manifest.totals.totalPassengers}', color: AppColors.primary),
                            const SizedBox(width: 8),
                            _StatChip(label: 'Boarded', value: '${manifest.totals.boarded}', color: AppColors.success),
                            const SizedBox(width: 8),
                            _StatChip(label: 'Pending', value: '${manifest.totals.notBoarded}', color: AppColors.warning),
                            const SizedBox(width: 8),
                            _StatChip(label: 'Dropped', value: '${manifest.totals.droppedOff}', color: AppColors.info),
                          ],
                        ),
                      ),

                      // Passenger list
                      Expanded(
                        child: manifest.passengers.isEmpty
                            ? const EmptyState(
                                icon: Icons.people_outline,
                                title: 'No passengers',
                                subtitle: 'No bookings for this trip yet',
                              )
                            : ListView.builder(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                itemCount: manifest.passengers.length,
                                itemBuilder: (context, index) {
                                  final p = manifest.passengers[index];
                                  return Card(
                                    margin: const EdgeInsets.only(bottom: 8),
                                    child: ListTile(
                                      leading: CircleAvatar(
                                        backgroundColor: p.isBoarded
                                            ? AppColors.successLight
                                            : AppColors.surfaceVariant,
                                        child: Text(
                                          '${p.seatNumber}',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: p.isBoarded ? AppColors.success : AppColors.textSecondary,
                                          ),
                                        ),
                                      ),
                                      title: Text(p.passengerName, style: const TextStyle(fontWeight: FontWeight.w500)),
                                      subtitle: Text('Seat ${p.seatNumber}'),
                                      trailing: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: _getStatusColor(p.boardingStatus).withValues(alpha: 0.1),
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: Text(
                                              Formatters.formatBoardingStatus(p.boardingStatus),
                                              style: TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.w600,
                                                color: _getStatusColor(p.boardingStatus),
                                              ),
                                            ),
                                          ),
                                          // Drop-off action for boarded passengers
                                          if (p.isBoarded)
                                            IconButton(
                                              icon: const Icon(Icons.flag, size: 20, color: AppColors.info),
                                              tooltip: 'Mark dropped off',
                                              onPressed: () {
                                                context.read<DriverCubit>().markAsDroppedOff(p.bookingId);
                                              },
                                            ),
                                          // Board action for pending passengers
                                          if (p.isNotBoarded && p.paymentStatus == 'CONFIRMED')
                                            IconButton(
                                              icon: const Icon(Icons.check_circle_outline, size: 20, color: AppColors.success),
                                              tooltip: 'Mark boarded',
                                              onPressed: () {
                                                context.read<DriverCubit>().markAsBoarded(p.bookingId);
                                              },
                                            ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                      ),
                    ],
                  );
                }
                if (state is DriverError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: AppColors.error),
                        const SizedBox(height: 16),
                        Text(state.message, textAlign: TextAlign.center),
                      ],
                    ),
                  );
                }
                return const EmptyState(
                  icon: Icons.list_alt,
                  title: 'Enter a Trip ID',
                  subtitle: 'Enter a trip ID above to view the passenger manifest',
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    return switch (status) {
      'BOARDED' => AppColors.success,
      'DROPPED_OFF' => AppColors.info,
      _ => AppColors.warning,
    };
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _StatChip({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
            Text(label, style: TextStyle(fontSize: 11, color: color)),
          ],
        ),
      ),
    );
  }
}
