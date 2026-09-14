import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_colors.dart';
import '../../../injection_container.dart';
import '../../cubit/passenger/passenger_cubit.dart';
import '../../cubit/passenger/passenger_state.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/error_display.dart';
import '../../widgets/common/loading_indicator.dart';
import '../../widgets/seats/bus_layout.dart';
import '../../../core/utils/formatters.dart';

class SeatSelectionPage extends StatelessWidget {
  final String tripId;
  final int busCapacity;

  const SeatSelectionPage({
    super.key,
    required this.tripId,
    this.busCapacity = 40,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      // Loads the trip and the live seat map from the backend.
      create: (_) => getIt<PassengerCubit>()..loadSeatMap(tripId),
      child: _SeatSelectionView(tripId: tripId),
    );
  }
}

class _SeatSelectionView extends StatefulWidget {
  final String tripId;
  const _SeatSelectionView({required this.tripId});

  @override
  State<_SeatSelectionView> createState() => _SeatSelectionViewState();
}

class _SeatSelectionViewState extends State<_SeatSelectionView> {
  int? _selectedSeat;

  void _confirmSeat(int seat, double fare) {
    Navigator.pushNamed(context, '/passenger/booking-review', arguments: {
      'tripId': widget.tripId,
      'seatNumber': seat,
      'fare': fare,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Select Your Seat')),
      body: BlocConsumer<PassengerCubit, PassengerState>(
        listener: (context, state) {
          if (state is PassengerError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message), backgroundColor: AppColors.error),
            );
          }
        },
        builder: (context, state) {
          if (state is SeatSelectionLoading) {
            return const LoadingIndicator(message: 'Loading seat map...');
          }
          if (state is PassengerError) {
            return ErrorDisplay(
              message: state.message,
              onRetry: () => context.read<PassengerCubit>().loadSeatMap(widget.tripId),
            );
          }
          if (state is SeatSelectionLoaded) {
            final fare = state.trip.fareAmount;
            return Column(
              children: [
                // Legend
                Container(
                  padding: const EdgeInsets.all(16),
                  color: AppColors.surface,
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _LegendItem(color: AppColors.seatAvailable, label: 'Available'),
                      _LegendItem(color: AppColors.seatSelected, label: 'Selected'),
                      _LegendItem(color: AppColors.seatOccupied, label: 'Occupied'),
                    ],
                  ),
                ),

                // Seat layout (real availability from backend)
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: BusLayout(
                      totalSeats: state.busCapacity,
                      occupiedSeats: state.takenSeats,
                      selectedSeat: _selectedSeat,
                      onSeatTap: (seat) => setState(() => _selectedSeat = seat),
                    ),
                  ),
                ),

                // Bottom bar
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: const BoxDecoration(
                    color: AppColors.surface,
                    boxShadow: [
                      BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, -2)),
                    ],
                  ),
                  child: SafeArea(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _selectedSeat != null
                              ? 'Seat $_selectedSeat selected - ${Formatters.formatCurrency(fare)}'
                              : 'Tap a green seat to select it',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: _selectedSeat != null ? AppColors.primary : AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 12),
                        AppButton(
                          label: 'Continue to Review',
                          onPressed: _selectedSeat != null ? () => _confirmSeat(_selectedSeat!, fare) : null,
                          icon: Icons.event_seat,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
      ],
    );
  }
}
