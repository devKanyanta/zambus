import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../../../injection_container.dart';
import '../../cubit/admin/admin_cubit.dart';
import '../../cubit/admin/admin_state.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_input.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<AdminCubit>(),
      child: const _SettingsView(),
    );
  }
}

class _SettingsView extends StatefulWidget {
  const _SettingsView();

  @override
  State<_SettingsView> createState() => _SettingsViewState();
}

class _SettingsViewState extends State<_SettingsView> {
  final _commissionController = TextEditingController(text: '0.10');
  final _currencyController = TextEditingController(text: 'ZMW');
  final _seatLockController = TextEditingController(text: '10');

  @override
  void initState() {
    super.initState();
    // Load settings from DB
    final cubit = context.read<AdminCubit>();
    cubit.loadSettings();
  }

  @override
  void dispose() {
    _commissionController.dispose();
    _currencyController.dispose();
    _seatLockController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AdminCubit, AdminState>(
      listener: (context, state) {
        if (state is CommissionUpdated) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Commission rate updated to ${(state.rate * 100).toStringAsFixed(1)}%'),
              backgroundColor: AppColors.success,
            ),
          );
        } else if (state is AdminError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message), backgroundColor: AppColors.error),
          );
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('System Settings')),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Platform Settings', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),

              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Commission Rate', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      const Text(
                        'Percentage of each confirmed booking that goes to the platform',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 16),
                      AppInput(
                        label: 'Rate (decimal)',
                        controller: _commissionController,
                        hint: '0.10 = 10%',
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      ),
                      const SizedBox(height: 16),
                      BlocBuilder<AdminCubit, AdminState>(
                        builder: (context, state) {
                          return AppButton(
                            label: 'Update Commission Rate',
                            onPressed: () {
                              final rate = double.tryParse(_commissionController.text);
                              if (rate == null || rate < 0 || rate > 1) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Enter a rate between 0 and 1 (e.g. 0.10 for 10%)'),
                                    backgroundColor: AppColors.error,
                                  ),
                                );
                                return;
                              }
                              context.read<AdminCubit>().updateCommission(rate);
                            },
                            isLoading: state is CommissionUpdating,
                            icon: Icons.save,
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Seat Lock Duration
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Seat Lock Duration', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      const Text(
                        'How long (in minutes) a seat is held during checkout before the booking expires',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 16),
                      BlocBuilder<AdminCubit, AdminState>(
                        builder: (context, state) {
                          if (state is SettingsLoaded) {
                            _seatLockController.text = '${state.settings['seatLockDurationMinutes'] ?? 10}';
                            _currencyController.text = state.settings['currency'] ?? 'ZMW';
                          }
                          return Column(
                            children: [
                              AppInput(
                                label: 'Lock Duration (minutes)',
                                controller: _seatLockController,
                                hint: '10',
                                keyboardType: TextInputType.number,
                              ),
                              const SizedBox(height: 12),
                              AppInput(
                                label: 'Currency',
                                controller: _currencyController,
                                hint: 'ZMW',
                              ),
                              const SizedBox(height: 16),
                              AppButton(
                                label: 'Save Settings',
                                onPressed: () {
                                  final lockDuration = int.tryParse(_seatLockController.text);
                                  context.read<AdminCubit>().updateSettings({
                                    'seatLockDurationMinutes': lockDuration ?? 10,
                                    'currency': _currencyController.text.trim(),
                                  });
                                },
                                icon: Icons.save,
                              ),
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // App info
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('About ZamBus', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      SizedBox(height: 12),
                      _InfoRow(label: 'Version', value: '1.0.0'),
                      _InfoRow(label: 'Phase', value: 'Phase 1 - Prototype'),
                      _InfoRow(label: 'Backend', value: 'Node.js + Express + PostgreSQL'),
                      _InfoRow(label: 'Mobile', value: 'Flutter'),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
