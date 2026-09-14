import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../../../injection_container.dart';
import '../../cubit/auth/auth_cubit.dart';
import '../../cubit/auth/auth_state.dart';
import '../../cubit/operator/operator_cubit.dart';
import '../../cubit/operator/operator_state.dart';
import '../../widgets/common/auth_listener.dart';

class OperatorHome extends StatefulWidget {
  const OperatorHome({super.key});

  @override
  State<OperatorHome> createState() => _OperatorHomeState();
}

class _OperatorHomeState extends State<OperatorHome> {
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<OperatorCubit>()..loadCompany(),
      child: AuthListener(
        child: Scaffold(
          backgroundColor: AppColors.background,
          appBar: AppBar(
            title: const Text('Operator Dashboard'),
            actions: [
              IconButton(
                icon: const Icon(Icons.logout),
                onPressed: () => context.read<AuthCubit>().logout(),
              ),
            ],
          ),
          body: BlocBuilder<AuthCubit, AuthState>(
            builder: (context, authState) {
              return SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Welcome
                    if (authState is AuthAuthenticated)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppColors.operatorColor,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Welcome, ${authState.user.fullName}',
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Operator Dashboard',
                              style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.8)),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 24),

                    // Company status banner
                    BlocBuilder<OperatorCubit, OperatorState>(
                      builder: (context, state) {
                        if (state is CompanyLoaded && state.company == null) {
                          return Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(16),
                            margin: const EdgeInsets.only(bottom: 24),
                            decoration: BoxDecoration(
                              color: AppColors.warning.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: AppColors.warning.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.warning_amber, color: AppColors.warning),
                                const SizedBox(width: 12),
                                const Expanded(
                                  child: Text(
                                    'No bus company registered. You need to register a company before publishing trips.',
                                    style: TextStyle(fontSize: 13),
                                  ),
                                ),
                                TextButton(
                                  onPressed: () => Navigator.pushNamed(
                                    context,
                                    '/operator/register-company',
                                  ).then((_) {
                                    context.read<OperatorCubit>().loadCompany();
                                  }),
                                  child: const Text('Register'),
                                ),
                              ],
                            ),
                          );
                        }
                        if (state is CompanyLoaded && state.company != null) {
                          final isApproved = state.company['isApproved'] == true;
                          if (!isApproved) {
                            return Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(16),
                              margin: const EdgeInsets.only(bottom: 24),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: AppColors.primary.withValues(alpha: 0.3),
                                ),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.hourglass_top, color: AppColors.primary),
                                  SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      'Your company is pending admin approval. You can manage fleet and routes, but trips will be available to passengers once approved.',
                                      style: TextStyle(fontSize: 13),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }
                        }
                        return const SizedBox.shrink();
                      },
                    ),

                    const Text('Management', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),

                    // Fleet Management
                    _DashboardCard(
                      icon: Icons.directions_bus,
                      title: 'Fleet Management',
                      subtitle: 'Manage buses and maintenance',
                      color: AppColors.primary,
                      onTap: () => Navigator.pushNamed(context, '/operator/buses'),
                    ),
                    const SizedBox(height: 12),

                    // Route Management
                    _DashboardCard(
                      icon: Icons.route,
                      title: 'Route Management',
                      subtitle: 'Create and manage routes',
                      color: AppColors.secondary,
                      onTap: () => Navigator.pushNamed(context, '/operator/routes'),
                    ),
                    const SizedBox(height: 12),

                    // Trip Management
                    _DashboardCard(
                      icon: Icons.schedule,
                      title: 'Trip Schedules',
                      subtitle: 'Schedule and control trips',
                      color: AppColors.driverColor,
                      onTap: () => Navigator.pushNamed(context, '/operator/trips'),
                    ),
                    const SizedBox(height: 24),

                    const Text('Insights', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),

                    // Analytics
                    _DashboardCard(
                      icon: Icons.analytics,
                      title: 'Revenue Dashboard',
                      subtitle: 'View revenue, commissions, analytics',
                      color: AppColors.success,
                      onTap: () => Navigator.pushNamed(context, '/operator/analytics'),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class _DashboardCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _DashboardCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: color, size: 26),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text(subtitle, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.textHint),
            ],
          ),
        ),
      ),
    );
  }
}
