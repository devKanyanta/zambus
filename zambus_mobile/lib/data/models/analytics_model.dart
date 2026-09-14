import 'package:equatable/equatable.dart';

class Analytics extends Equatable {
  final int totalUsers;
  final int totalOperators;
  final int totalActiveTrips;
  final int totalBookings;
  final double totalRevenue;
  final double commissionAmount;
  final double netPayout;

  const Analytics({
    required this.totalUsers,
    required this.totalOperators,
    required this.totalActiveTrips,
    required this.totalBookings,
    required this.totalRevenue,
    required this.commissionAmount,
    required this.netPayout,
  });

  factory Analytics.fromJson(Map<String, dynamic> json) {
    return Analytics(
      totalUsers: json['totalUsers'] as int,
      totalOperators: json['totalOperators'] as int,
      totalActiveTrips: json['totalActiveTrips'] as int,
      totalBookings: json['totalBookings'] as int,
      totalRevenue: (json['totalRevenue'] as num).toDouble(),
      commissionAmount: (json['commissionAmount'] as num).toDouble(),
      netPayout: (json['netPayout'] as num).toDouble(),
    );
  }

  @override
  List<Object?> get props => [totalUsers, totalOperators, totalActiveTrips, totalBookings, totalRevenue, commissionAmount, netPayout];
}
