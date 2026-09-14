import 'package:equatable/equatable.dart';

class Bus extends Equatable {
  final String busId;
  final String? companyId;
  final String registrationNumber;
  final String model;
  final int seatCapacity;
  final List<String> amenities;
  final String maintenanceStatus;
  final DateTime? createdAt;

  const Bus({
    required this.busId,
    this.companyId,
    required this.registrationNumber,
    required this.model,
    required this.seatCapacity,
    this.amenities = const [],
    this.maintenanceStatus = 'OPERATIONAL',
    this.createdAt,
  });

  factory Bus.fromJson(Map<String, dynamic> json) {
    return Bus(
      busId: json['busId'] as String,
      companyId: json['companyId'] as String?,
      registrationNumber: json['registrationNumber'] as String? ?? '',
      model: json['model'] as String? ?? '',
      seatCapacity: (json['seatCapacity'] as num?)?.toInt() ?? 40,
      amenities: (json['amenities'] as List<dynamic>?)?.whereType<String>().toList() ?? [],
      maintenanceStatus: json['maintenanceStatus'] as String? ?? 'OPERATIONAL',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'busId': busId,
      'companyId': companyId,
      'registrationNumber': registrationNumber,
      'model': model,
      'seatCapacity': seatCapacity,
      'amenities': amenities,
      'maintenanceStatus': maintenanceStatus,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  bool get isOperational => maintenanceStatus == 'OPERATIONAL';
  bool get isInMaintenance => maintenanceStatus == 'MAINTENANCE';
  bool get isOutOfService => maintenanceStatus == 'OUT_OF_SERVICE';

  @override
  List<Object?> get props => [busId, registrationNumber, model, seatCapacity, amenities, maintenanceStatus];
}
