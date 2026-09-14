import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:dio/dio.dart';
import '../../../data/datasources/api_datasource.dart';
import '../../../data/models/models.dart';
import 'passenger_state.dart';

class PassengerCubit extends Cubit<PassengerState> {
  final ApiDatasource _datasource;
  PassengerCubit(this._datasource) : super(PassengerInitial());

  /// Converts Dio/network errors into user-friendly messages.
  String _message(Object e) {
    if (e is DioException) {
      final data = e.response?.data;
      if (data is Map<String, dynamic> && data['message'] != null) {
        return data['message'] as String;
      }
      switch (e.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.receiveTimeout:
          return 'Connection timed out. Check your network and try again.';
        case DioExceptionType.connectionError:
          return 'Cannot reach the ZamBus server. Check that the backend is running.';
        default:
          return e.message ?? 'Network error';
      }
    }
    return e.toString();
  }

  Future<void> searchTrips({
    String? origin,
    String? destination,
    String? travelDate,
    String? filter,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      emit(TripsLoading());
      final trips = await _datasource.searchTrips(
        origin: origin,
        destination: destination,
        travelDate: travelDate,
        filter: filter,
        page: page,
        limit: limit,
      );
      emit(TripsLoaded(
        trips: trips,
        total: trips.length,
        page: page,
        limit: limit,
        origin: origin,
        destination: destination,
        travelDate: travelDate,
      ));
    } catch (e) {
      emit(PassengerError(_message(e)));
    }
  }

  Future<void> getTripDetails(String tripId) async {
    try {
      emit(TripDetailsLoading());
      final trip = await _datasource.getTripById(tripId);
      emit(TripDetailsLoaded(trip));
    } catch (e) {
      emit(PassengerError(_message(e)));
    }
  }

  /// Loads the trip plus its live seat map from the backend.
  Future<void> loadSeatMap(String tripId) async {
    try {
      emit(SeatSelectionLoading());
      final results = await Future.wait([
        _datasource.getTripById(tripId),
        _datasource.getTripSeats(tripId),
      ]);
      final trip = results[0] as Trip;
      final seatMap = results[1] as SeatMap;
      emit(SeatSelectionLoaded(
        trip: trip,
        availableSeats: seatMap.availableSeats,
        busCapacity: seatMap.busCapacity,
      ));
    } catch (e) {
      emit(PassengerError(_message(e)));
    }
  }

  /// Backwards-compatible wrapper used by older screens.
  Future<void> selectSeat(String tripId, int seatNumber) => loadSeatMap(tripId);

  Future<void> createBooking(String tripId, int seatNumber) async {
    try {
      emit(BookingCreating());
      final booking = await _datasource.createBooking(
        tripId: tripId,
        seatNumber: seatNumber,
      );
      emit(BookingCreated(booking));
    } catch (e) {
      emit(PassengerError(_message(e)));
    }
  }

  /// Creates the booking AND confirms payment in one flow (mock payment).
  Future<void> bookAndPay(String tripId, int seatNumber) async {
    try {
      emit(BookingCreating());
      final booking = await _datasource.createAndConfirmBooking(
        tripId: tripId,
        seatNumber: seatNumber,
      );
      emit(BookingConfirmed(booking));
    } catch (e) {
      emit(PassengerError(_message(e)));
    }
  }

  Future<void> confirmBooking(String bookingId) async {
    try {
      emit(BookingConfirming());
      final booking = await _datasource.confirmBooking(bookingId);
      emit(BookingConfirmed(booking));
    } catch (e) {
      emit(PassengerError(_message(e)));
    }
  }

  String? _lastBookingId;

  /// Fetches a single booking (with trip details) for the ticket screen.
  Future<void> getBookingDetails(String bookingId) async {
    try {
      _lastBookingId = bookingId;
      emit(BookingDetailsLoading());
      final booking = await _datasource.getBookingById(bookingId);
      emit(BookingDetailsLoaded(booking, passengerName: booking.passengerName));
    } catch (e) {
      emit(PassengerError(_message(e)));
    }
  }

  /// Reloads the last requested booking (used by the retry button).
  Future<void> refreshBooking() async {
    if (_lastBookingId != null) {
      await getBookingDetails(_lastBookingId!);
    }
  }

  Future<void> getMyBookings() async {
    try {
      emit(MyBookingsLoading());
      final bookings = await _datasource.getMyBookings();
      emit(MyBookingsLoaded(bookings));
    } catch (e) {
      emit(PassengerError(_message(e)));
    }
  }

  Future<void> cancelBooking(String bookingId) async {
    try {
      await _datasource.cancelBooking(bookingId);
      // Re-fetch the booking so whichever screen is open (ticket details or
      // bookings list) reflects the refunded/cancelled state.
      if (_lastBookingId != null) {
        await getBookingDetails(_lastBookingId!);
      } else {
        await getMyBookings();
      }
    } catch (e) {
      emit(PassengerError(_message(e)));
    }
  }
}
