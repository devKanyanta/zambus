import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../../../injection_container.dart';
import '../../cubit/auth/auth_cubit.dart';
import '../../cubit/auth/auth_state.dart';
import '../../cubit/passenger/passenger_cubit.dart';
import '../../cubit/passenger/passenger_state.dart';
import '../../widgets/common/app_button.dart';
import '../../../data/models/trip_model.dart';
import '../../../core/utils/formatters.dart';

class PassengerHome extends StatelessWidget {
  const PassengerHome({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<PassengerCubit>(),
      child: const _PassengerHomeView(),
    );
  }
}

class _PassengerHomeView extends StatefulWidget {
  const _PassengerHomeView();

  @override
  State<_PassengerHomeView> createState() => _PassengerHomeViewState();
}

class _PassengerHomeViewState extends State<_PassengerHomeView> {
  final _originController = TextEditingController();
  final _destinationController = TextEditingController();
  int _selectedIndex = 0;
  DateTime? _travelDate;
  String? _filter;

  static const _filters = <String?, String>{
    null: 'Any',
    'lowestPrice': 'Cheapest',
    'earliestDeparture': 'Earliest',
    'luxury': 'Luxury',
    'semiLuxury': 'Semi-Luxury',
    'standard': 'Standard',
  };

  @override
  void dispose() {
    _originController.dispose();
    _destinationController.dispose();
    super.dispose();
  }

  void _searchTrips() {
    FocusScope.of(context).unfocus();
    context.read<PassengerCubit>().searchTrips(
      origin: _originController.text.trim().isNotEmpty ? _originController.text.trim() : null,
      destination: _destinationController.text.trim().isNotEmpty ? _destinationController.text.trim() : null,
      travelDate: _travelDate != null ? Formatters.formatDate(_travelDate!) : null,
      filter: _filter,
    );
  }

  Future<void> _pickTravelDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _travelDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) => Theme(data: Theme.of(context), child: child!),
    );
    if (picked != null) {
      setState(() => _travelDate = picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          _buildSearchTab(),
          const MyBookingsTab(),
          _buildProfileTab(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) => setState(() => _selectedIndex = index),
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.primary.withValues(alpha: 0.1),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.search), selectedIcon: Icon(Icons.search, color: AppColors.primary), label: 'Search'),
          NavigationDestination(icon: Icon(Icons.confirmation_num_outlined), selectedIcon: Icon(Icons.confirmation_num, color: AppColors.primary), label: 'Bookings'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person, color: AppColors.primary), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildSearchTab() {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Container(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
            decoration: const BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(24)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Where are you going?',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 4),
                Text(
                  'Search and book your next trip',
                  style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.8)),
                ),
                const SizedBox(height: 20),
                _buildSearchField('From', _originController, Icons.circle_outlined),
                const SizedBox(height: 12),
                _buildSearchField('To', _destinationController, Icons.location_on_outlined),
                const SizedBox(height: 12),
                _buildDateField(),
                const SizedBox(height: 16),
                BlocBuilder<PassengerCubit, PassengerState>(
                  builder: (context, state) {
                    return AppButton(
                      label: 'Search Trips',
                      onPressed: _searchTrips,
                      isLoading: state is TripsLoading,
                      icon: Icons.search,
                    );
                  },
                ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: _buildFilterChips(),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: BlocBuilder<PassengerCubit, PassengerState>(
              builder: (context, state) {
                if (state is TripsLoaded) {                  if (state.trips.isEmpty) {
                    return const _SearchMessage(
                      icon: Icons.search_off,
                      title: 'No trips found',
                      subtitle: 'Try a different route or date.',
                    );
                  }
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Available Trips (${state.trips.length})', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      ...state.trips.map((trip) => _TripCard(trip: trip)),
                    ],
                  );
                }
                if (state is TripsLoading) {
                  return const Padding(
                    padding: EdgeInsets.all(40),
                    child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
                  );
                }
                if (state is PassengerError) {
                  return _SearchMessage(
                    icon: Icons.wifi_off,
                    title: 'Search failed',
                    subtitle: state.message,
                    actionLabel: 'Retry',
                    onAction: _searchTrips,
                  );
                }
                // Initial state - show featured routes
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Popular Routes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    _QuickRoute(from: 'Lusaka', to: 'Livingstone', onTap: () => _searchRoute('Lusaka', 'Livingstone')),
                    _QuickRoute(from: 'Lusaka', to: 'Ndola', onTap: () => _searchRoute('Lusaka', 'Ndola')),
                    _QuickRoute(from: 'Lusaka', to: 'Kitwe', onTap: () => _searchRoute('Lusaka', 'Kitwe')),
                    _QuickRoute(from: 'Lusaka', to: 'Mongu', onTap: () => _searchRoute('Lusaka', 'Mongu')),
                  ],
                );
              },
            ),
          ),
        ),
      ],
    );
  }

  void _searchRoute(String from, String to) {
    _originController.text = from;
    _destinationController.text = to;
    _searchTrips();
  }

  Widget _buildFilterChips() {
    return SizedBox(
      height: 48,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        children: _filters.entries.map((entry) {
          final selected = _filter == entry.key;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(entry.value),
              selected: selected,
              selectedColor: AppColors.primary,
              labelStyle: TextStyle(
                fontSize: 13,
                color: selected ? Colors.white : AppColors.textSecondary,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
              ),
              showCheckmark: false,
              onSelected: (_) => setState(() => _filter = entry.key),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildDateField() {
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: _pickTravelDate,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(Icons.calendar_today, color: Colors.white.withValues(alpha: 0.8), size: 20),
            const SizedBox(width: 12),
            Text(
              _travelDate != null ? Formatters.formatDisplayDate(_travelDate!) : 'Any date',
              style: TextStyle(color: Colors.white.withValues(alpha: _travelDate != null ? 1 : 0.6), fontSize: 15),
            ),
            const Spacer(),
            if (_travelDate != null)
              GestureDetector(
                onTap: () => setState(() => _travelDate = null),
                child: Icon(Icons.close, color: Colors.white.withValues(alpha: 0.7), size: 18),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchField(String label, TextEditingController controller, IconData icon) {
    return TextField(
      controller: controller,
      textInputAction: TextInputAction.search,
      onSubmitted: (_) => _searchTrips(),
      style: const TextStyle(color: Colors.white, fontSize: 15),
      decoration: InputDecoration(
        hintText: label,
        hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.6)),
        prefixIcon: Icon(icon, color: Colors.white.withValues(alpha: 0.8), size: 20),
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.15),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _buildProfileTab() {
    return BlocBuilder<AuthCubit, AuthState>(
      builder: (context, state) {
        final user = state is AuthAuthenticated ? state.user : null;
        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const SizedBox(height: 20),
            Center(
              child: CircleAvatar(
                radius: 40,
                backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                child: Text(
                  (user?.fullName ?? 'U')[0].toUpperCase(),
                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Center(
              child: Text(user?.fullName ?? 'User', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ),
            Center(
              child: Text(user?.email ?? '', style: const TextStyle(color: AppColors.textSecondary)),
            ),
            const SizedBox(height: 32),
            _ProfileTile(icon: Icons.person_outline, title: 'Edit Profile', onTap: _showEditProfileDialog),
            _ProfileTile(icon: Icons.confirmation_num_outlined, title: 'My Bookings', onTap: () => setState(() => _selectedIndex = 1)),
            _ProfileTile(icon: Icons.help_outline, title: 'Help & Support', onTap: _showSupportDialog),
            _ProfileTile(icon: Icons.info_outline, title: 'About ZamBus', onTap: _showAboutDialog),
            const SizedBox(height: 24),
            AppButton(
              label: 'Sign Out',
              onPressed: () => context.read<AuthCubit>().logout(),
              variant: AppButtonVariant.outline,
              icon: Icons.logout,
            ),
          ],
        );
      },
    );
  }

  void _showEditProfileDialog() {
    final authCubit = context.read<AuthCubit>();
    final state = authCubit.state;
    final user = state is AuthAuthenticated ? state.user : null;
    final nameController = TextEditingController(text: user?.fullName ?? '');
    final phoneController = TextEditingController(text: user?.phoneNumber ?? '');

    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Edit Profile'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Full Name'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneController,
                decoration: const InputDecoration(labelText: 'Phone Number'),
                keyboardType: TextInputType.phone,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                final navigator = Navigator.of(dialogContext);
                await authCubit.updateProfile(
                  fullName: nameController.text.trim(),
                  phoneNumber: phoneController.text.trim(),
                );
                if (!mounted) return;
                navigator.pop();
                final isError = authCubit.state is AuthError;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(isError ? 'Could not update profile' : 'Profile updated'),
                    backgroundColor: isError ? AppColors.error : AppColors.success,
                  ),
                );
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }

  void _showSupportDialog() {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Help & Support'),
        content: const Text(
          'Need help with a booking or trip?\n\n'
          'Email: support@zambus.app\n'
          'Phone: +260 800 000 000\n\n'
          'Our support team is available daily from 06:00 to 22:00.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog() {
    showAboutDialog(
      context: context,
      applicationName: 'ZamBus',
      applicationVersion: '1.0.0',
      applicationIcon: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.directions_bus, color: Colors.white),
      ),
      children: const [
        Text('ZamBus - Smart Digital Intercity Bus Management System for Zambia.'),
      ],
    );
  }
}

class _TripCard extends StatelessWidget {
  final Trip trip;
  const _TripCard({required this.trip});

  @override
  Widget build(BuildContext context) {
    final soldOut = trip.remainingSeats != null && trip.remainingSeats! <= 0;
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: trip.canBook && !soldOut
            ? () => Navigator.pushNamed(context, '/passenger/trip-details', arguments: trip.tripId)
            : null,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      trip.routeDisplay,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: trip.status == 'BOARDING' ? AppColors.successLight : AppColors.infoLight,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      Formatters.formatTripStatus(trip.status),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: trip.status == 'BOARDING' ? AppColors.success : AppColors.info,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.calendar_today, size: 14, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    Formatters.formatDisplayDate(trip.departureTime),
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                  const SizedBox(width: 12),
                  const Icon(Icons.schedule, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    '${Formatters.formatDisplayTime(trip.departureTime)} - ${Formatters.formatDisplayTime(trip.estimatedArrival)}',
                    style: const TextStyle(color: AppColors.textSecondary),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(
                    Formatters.formatCurrency(trip.fareAmount),
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      Formatters.formatBusCategory(trip.busCategory),
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                    ),
                  ),
                  const Spacer(),
                  if (trip.remainingSeats != null)
                    Text(
                      soldOut ? 'Sold Out' : '${trip.remainingSeats} seats left',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: soldOut ? AppColors.error : AppColors.success,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickRoute extends StatelessWidget {
  final String from;
  final String to;
  final VoidCallback onTap;
  const _QuickRoute({required this.from, required this.to, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: const CircleAvatar(
          backgroundColor: AppColors.primaryLight,
          child: Icon(Icons.directions_bus, color: Colors.white, size: 20),
        ),
        title: Text('$from - $to'),
        subtitle: const Text('Tap to search trips'),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
        onTap: onTap,
      ),
    );
  }
}

class _SearchMessage extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  const _SearchMessage({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
        child: Column(
          children: [
            Icon(icon, size: 56, color: AppColors.textHint),
            const SizedBox(height: 16),
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.textSecondary),
            ),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: onAction,
                icon: const Icon(Icons.refresh),
                label: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _ProfileTile({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(title),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
        onTap: onTap,
      ),
    );
  }
}

class MyBookingsTab extends StatelessWidget {
  const MyBookingsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<PassengerCubit>()..getMyBookings(),
      child: Builder(
        builder: (context) {
          return BlocBuilder<PassengerCubit, PassengerState>(
            builder: (context, state) {
              if (state is MyBookingsLoading) {
                return const Center(child: CircularProgressIndicator(color: AppColors.primary));
              }
              if (state is MyBookingsLoaded) {
                if (state.bookings.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.confirmation_num_outlined, size: 64, color: AppColors.textHint),
                        const SizedBox(height: 16),
                        const Text('No bookings yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        const Text('Your bookings will appear here', style: TextStyle(color: AppColors.textSecondary)),
                        const SizedBox(height: 16),
                        OutlinedButton.icon(
                          onPressed: () => context.read<PassengerCubit>().getMyBookings(),
                          icon: const Icon(Icons.refresh),
                          label: const Text('Refresh'),
                        ),
                      ],
                    ),
                  );
                }
                return RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () => context.read<PassengerCubit>().getMyBookings(),
                  child: ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    itemCount: state.bookings.length,
                    itemBuilder: (context, index) {
                      final booking = state.bookings[index];
                      final trip = booking.trip;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(12),
                          onTap: () => Navigator.pushNamed(context, '/passenger/ticket', arguments: booking.bookingId),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Center(
                                    child: Text(
                                      '${booking.seatNumber}',
                                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        trip?.routeDisplay ?? 'Seat ${booking.seatNumber}',
                                        style: const TextStyle(fontWeight: FontWeight.w600),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        trip?.departureTime != null
                                            ? Formatters.formatDisplayDateTime(trip!.departureTime!)
                                            : Formatters.formatBoardingStatus(booking.boardingStatus),
                                        style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                      ),
                                      if (trip?.fareAmount != null) ...[
                                        const SizedBox(height: 2),
                                        Text(
                                          Formatters.formatCurrency(trip!.fareAmount!),
                                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: booking.isConfirmed ? AppColors.successLight : AppColors.warningLight,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    Formatters.formatPaymentStatus(booking.paymentStatus),
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: booking.isConfirmed ? AppColors.success : AppColors.warning,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                );
              }
              if (state is PassengerError) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.wifi_off, size: 56, color: AppColors.textHint),
                      const SizedBox(height: 16),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32),
                        child: Text(state.message, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary)),
                      ),
                      const SizedBox(height: 16),
                      OutlinedButton.icon(
                        onPressed: () => context.read<PassengerCubit>().getMyBookings(),
                        icon: const Icon(Icons.refresh),
                        label: const Text('Retry'),
                      ),
                    ],
                  ),
                );
              }
              return const Center(child: Text('Pull down to refresh'));
            },
          );
        },
      ),
    );
  }
}
