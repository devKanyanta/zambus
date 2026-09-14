import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../injection_container.dart';
import '../../../cubit/operator/operator_cubit.dart';
import '../../../cubit/operator/operator_state.dart';
import '../../../widgets/common/loading_indicator.dart';
import '../../../widgets/common/empty_state.dart';

class RoutesListPage extends StatelessWidget {
  const RoutesListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<OperatorCubit>()..loadRoutes(),
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Route Management')),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () => Navigator.pushNamed(context, '/operator/route-form'),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          icon: const Icon(Icons.add),
          label: const Text('Add Route'),
        ),
        body: BlocBuilder<OperatorCubit, OperatorState>(
          builder: (context, state) {
            if (state is RoutesLoading) {
              return const LoadingIndicator(message: 'Loading routes...');
            }
            if (state is RoutesLoaded) {
              if (state.routes.isEmpty) {
                return const EmptyState(
                  icon: Icons.route,
                  title: 'No routes created',
                  subtitle: 'Create your first route to start scheduling trips',
                );
              }
              return RefreshIndicator(
                onRefresh: () async => context.read<OperatorCubit>().loadRoutes(),
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: state.routes.length,
                  itemBuilder: (context, index) {
                    final route = state.routes[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        leading: Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: AppColors.secondary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.route, color: AppColors.secondary),
                        ),
                        title: Text(route.routeName, style: const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text(route.displayName),
                        trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
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
