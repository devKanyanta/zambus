import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../injection_container.dart';
import '../../../cubit/operator/operator_cubit.dart';
import '../../../cubit/operator/operator_state.dart';
import '../../../widgets/common/loading_indicator.dart';
import '../../../widgets/common/empty_state.dart';
import '../../../../core/utils/formatters.dart';

class BusesListPage extends StatelessWidget {
  const BusesListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<OperatorCubit>()..loadBuses(),
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Fleet Management')),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () => Navigator.pushNamed(context, '/operator/bus-form'),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          icon: const Icon(Icons.add),
          label: const Text('Add Bus'),
        ),
        body: BlocBuilder<OperatorCubit, OperatorState>(
          builder: (context, state) {
            if (state is BusesLoading) {
              return const LoadingIndicator(message: 'Loading buses...');
            }
            if (state is BusesLoaded) {
              if (state.buses.isEmpty) {
                return const EmptyState(
                  icon: Icons.directions_bus,
                  title: 'No buses registered',
                  subtitle: 'Add your first bus to get started',
                );
              }
              return RefreshIndicator(
                onRefresh: () async => context.read<OperatorCubit>().loadBuses(),
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: state.buses.length,
                  itemBuilder: (context, index) {
                    final bus = state.buses[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: bus.isOperational ? AppColors.successLight : AppColors.warningLight,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    bus.maintenanceStatus,
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: bus.isOperational ? AppColors.success : AppColors.warning,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              bus.registrationNumber,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            Text(bus.model, style: const TextStyle(color: AppColors.textSecondary)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.event_seat, size: 16, color: AppColors.textSecondary),
                                const SizedBox(width: 4),
                                Text('${bus.seatCapacity} seats', style: const TextStyle(color: AppColors.textSecondary)),
                                const SizedBox(width: 16),
                                if (bus.amenities.isNotEmpty) ...[
                                  const Icon(Icons.check_circle_outline, size: 16, color: AppColors.textSecondary),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      bus.amenities.take(3).join(', '),
                                      style: const TextStyle(color: AppColors.textSecondary),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
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
