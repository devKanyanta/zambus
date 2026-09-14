import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../../cubit/driver/driver_cubit.dart';
import '../../cubit/driver/driver_state.dart';

/// Drop-off Alerts Page (DRV-013 / DRV-014)
///
/// Shows upcoming passengers to drop off at intermediate stops along the route.
/// This is a simplified MVP version that shows the manifest grouped by
/// passenger status, with a focus on those who need to be dropped off.
class DropoffAlertsPage extends StatefulWidget {
  final String tripId;

  const DropoffAlertsPage({super.key, required this.tripId});

  @override
  State<DropoffAlertsPage> createState() => _DropoffAlertsPageState();
}

class _DropoffAlertsPageState extends State<DropoffAlertsPage> {
  @override
  void initState() {
    super.initState();
    context.read<DriverCubit>().loadManifest(widget.tripId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Drop-off Alerts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<DriverCubit>().refreshManifest(),
          ),
        ],
      ),
      body: BlocBuilder<DriverCubit, DriverState>(
        builder: (context, state) {
          if (state is ManifestLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is ManifestLoaded) {
            final manifest = state.manifest;
            final boardedPassengers = manifest.passengers
                .where((p) => p.isBoarded)
                .toList();
            final droppedOffPassengers = manifest.passengers
                .where((p) => p.isDroppedOff)
                .toList();
            final pendingPassengers = manifest.passengers
                .where((p) => p.isNotBoarded)
                .toList();

            return RefreshIndicator(
              onRefresh: () async =>
                  context.read<DriverCubit>().refreshManifest(),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Trip info header
                  if (manifest.trip != null)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${manifest.trip!.origin ?? "—"} → ${manifest.trip!.destination ?? "—"}',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Bus: ${manifest.trip!.busReg ?? "—"}  |  Route: ${manifest.trip!.routeName ?? "—"}',
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  const SizedBox(height: 16),

                  // Stats summary
                  Row(
                    children: [
                      _StatChip(
                        label: 'Boarded',
                        count: boardedPassengers.length,
                        color: AppColors.success,
                      ),
                      const SizedBox(width: 8),
                      _StatChip(
                        label: 'To Drop',
                        count: droppedOffPassengers.length,
                        color: AppColors.warning,
                      ),
                      const SizedBox(width: 8),
                      _StatChip(
                        label: 'Not Boarded',
                        count: pendingPassengers.length,
                        color: AppColors.textHint,
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Passengers to drop off
                  if (droppedOffPassengers.isNotEmpty) ...[
                    const Text(
                      'Dropped Off',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.warning,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ...droppedOffPassengers.map(
                      (p) => _PassengerTile(
                        passenger: p,
                        icon: Icons.check_circle,
                        iconColor: AppColors.success,
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Boarded passengers (still on bus)
                  if (boardedPassengers.isNotEmpty) ...[
                    Text(
                      'Still on Bus (${boardedPassengers.length})',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ...boardedPassengers.map(
                      (p) => _PassengerTile(
                        passenger: p,
                        icon: Icons.directions_bus,
                        iconColor: AppColors.primary,
                      ),
                    ),
                  ],

                  if (boardedPassengers.isEmpty &&
                      droppedOffPassengers.isEmpty &&
                      pendingPassengers.isEmpty)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(40),
                        child: Column(
                          children: [
                            Icon(Icons.people_outline,
                                size: 64, color: AppColors.textHint),
                            SizedBox(height: 16),
                            Text(
                              'No passengers booked for this trip yet',
                              style: TextStyle(
                                fontSize: 16,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            );
          }

          if (state is DriverError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: AppColors.error),
                  const SizedBox(height: 16),
                  Text(state.message, textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () =>
                        context.read<DriverCubit>().refreshManifest(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final int count;
  final Color color;

  const _StatChip({
    required this.label,
    required this.count,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Text(
              '$count',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: color,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PassengerTile extends StatelessWidget {
  final dynamic passenger;
  final IconData icon;
  final Color iconColor;

  const _PassengerTile({
    required this.passenger,
    required this.icon,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: iconColor.withValues(alpha: 0.1),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        title: Text(
          passenger.passengerName,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          'Seat ${passenger.seatNumber}  •  ${passenger.passengerPhone.isNotEmpty ? passenger.passengerPhone : "No phone"}',
          style: const TextStyle(fontSize: 13),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            passenger.isBoarded
                ? 'ON BUS'
                : passenger.isDroppedOff
                    ? 'DROPPED'
                    : 'PENDING',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: iconColor,
            ),
          ),
        ),
      ),
    );
  }
}
