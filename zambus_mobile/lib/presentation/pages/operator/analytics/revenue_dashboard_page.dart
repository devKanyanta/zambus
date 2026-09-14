import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../injection_container.dart';
import '../../../cubit/operator/operator_cubit.dart';
import '../../../cubit/operator/operator_state.dart';
import '../../../widgets/common/loading_indicator.dart';
import '../../../widgets/common/error_display.dart';
import '../../../../core/utils/formatters.dart';

class RevenueDashboardPage extends StatelessWidget {
  const RevenueDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<OperatorCubit>()..loadAnalytics(),
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Revenue Dashboard')),
        body: BlocBuilder<OperatorCubit, OperatorState>(
          builder: (context, state) {
            if (state is AnalyticsLoading) {
              return const LoadingIndicator(message: 'Loading analytics...');
            }
            if (state is AnalyticsLoaded) {
              final a = state.analytics;
              return RefreshIndicator(
                onRefresh: () async => context.read<OperatorCubit>().loadAnalytics(),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Revenue Overview', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 20),

                      // Revenue cards
                      Row(
                        children: [
                          Expanded(child: _RevenueCard(title: 'Total Revenue', value: Formatters.formatCurrency(a.totalRevenue), color: AppColors.primary)),
                          const SizedBox(width: 12),
                          Expanded(child: _RevenueCard(title: 'Commission', value: Formatters.formatCurrency(a.commissionAmount), color: AppColors.warning)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _RevenueCard(title: 'Net Payout', value: Formatters.formatCurrency(a.netPayout), color: AppColors.success, fullWidth: true),
                      const SizedBox(height: 24),

                      const Text('System Metrics', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),

                      Row(
                        children: [
                          Expanded(child: _MetricCard(title: 'Users', value: '${a.totalUsers}', icon: Icons.people)),
                          const SizedBox(width: 12),
                          Expanded(child: _MetricCard(title: 'Operators', value: '${a.totalOperators}', icon: Icons.business)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(child: _MetricCard(title: 'Active Trips', value: '${a.totalActiveTrips}', icon: Icons.directions_bus)),
                          const SizedBox(width: 12),
                          Expanded(child: _MetricCard(title: 'Bookings', value: '${a.totalBookings}', icon: Icons.confirmation_num)),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }
            if (state is OperatorError) {
              return ErrorDisplay(message: state.message, onRetry: () => context.read<OperatorCubit>().loadAnalytics());
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }
}

class _RevenueCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;
  final bool fullWidth;

  const _RevenueCard({required this.title, required this.value, required this.color, this.fullWidth = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: fullWidth ? double.infinity : null,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(fontSize: 13, color: color)),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;

  const _MetricCard({required this.title, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 24),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              Text(title, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            ],
          ),
        ],
      ),
    );
  }
}
