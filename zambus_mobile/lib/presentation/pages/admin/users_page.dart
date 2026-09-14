import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../../../injection_container.dart';
import '../../cubit/admin/admin_cubit.dart';
import '../../cubit/admin/admin_state.dart';
import '../../widgets/common/loading_indicator.dart';
import '../../widgets/common/empty_state.dart';

class UsersPage extends StatelessWidget {
  const UsersPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<AdminCubit>()..loadAllUsers(),
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('User Management')),
        body: BlocBuilder<AdminCubit, AdminState>(
          builder: (context, state) {
            if (state is AllUsersLoading) {
              return const LoadingIndicator(message: 'Loading users...');
            }
            if (state is AllUsersLoaded) {
              if (state.users.isEmpty) {
                return const EmptyState(
                  icon: Icons.people,
                  title: 'No users found',
                );
              }
              return RefreshIndicator(
                onRefresh: () async => context.read<AdminCubit>().loadAllUsers(),
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: state.users.length,
                  itemBuilder: (context, index) {
                    final user = state.users[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        leading: CircleAvatar(
                          backgroundColor: _getRoleColor(user.role).withValues(alpha: 0.1),
                          child: Text(
                            user.fullName[0].toUpperCase(),
                            style: TextStyle(color: _getRoleColor(user.role), fontWeight: FontWeight.bold),
                          ),
                        ),
                        title: Text(user.fullName, style: const TextStyle(fontWeight: FontWeight.w500)),
                        subtitle: Text(user.email, style: const TextStyle(fontSize: 13)),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getRoleColor(user.role).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            user.role,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: _getRoleColor(user.role),
                            ),
                          ),
                        ),
                        onTap: () => _showRoleDialog(context, user.userId, user.role),
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

  Color _getRoleColor(String role) {
    return switch (role) {
      'ADMIN' => AppColors.adminColor,
      'OPERATOR' => AppColors.operatorColor,
      'DRIVER' => AppColors.driverColor,
      _ => AppColors.passengerColor,
    };
  }

  void _showRoleDialog(BuildContext context, String userId, String currentRole) {
    final roles = ['PASSENGER', 'DRIVER', 'OPERATOR', 'ADMIN'];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Change User Role'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: roles.map((role) {
            return RadioListTile(
              title: Text(role),
              value: role,
              groupValue: currentRole,
              onChanged: (value) {
                if (value != null) {
                  context.read<AdminCubit>().updateUserRole(userId, value);
                  Navigator.pop(ctx);
                }
              },
            );
          }).toList(),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
        ],
      ),
    );
  }
}
