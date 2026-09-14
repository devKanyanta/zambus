import 'package:equatable/equatable.dart';
import '../../../data/models/models.dart';

abstract class AdminState extends Equatable {
  const AdminState();
  
  @override
  List<Object?> get props => [];
}

class AdminInitial extends AdminState {}

class PendingCompaniesLoading extends AdminState {}

class PendingCompaniesLoaded extends AdminState {
  final List<dynamic> companies;

  const PendingCompaniesLoaded(this.companies);

  @override
  List<Object?> get props => [companies];
}

class AllUsersLoading extends AdminState {}

class AllUsersLoaded extends AdminState {
  final List<User> users;
  final int total;

  const AllUsersLoaded(this.users, this.total);

  @override
  List<Object?> get props => [users, total];
}

class AnalyticsLoading extends AdminState {}

class AnalyticsLoaded extends AdminState {
  final Analytics analytics;

  const AnalyticsLoaded(this.analytics);

  @override
  List<Object?> get props => [analytics];
}

class AdminError extends AdminState {
  final String message;

  const AdminError(this.message);

  @override
  List<Object?> get props => [message];
}

class CompanyApproved extends AdminState {
  final String companyId;

  const CompanyApproved(this.companyId);

  @override
  List<Object?> get props => [companyId];
}

class UserRoleUpdated extends AdminState {
  final String userId;
  final String role;

  const UserRoleUpdated(this.userId, this.role);

  @override
  List<Object?> get props => [userId, role];
}

class CommissionUpdating extends AdminState {}

class CommissionUpdated extends AdminState {
  final double rate;

  const CommissionUpdated(this.rate);

  @override
  List<Object?> get props => [rate];
}

class SettingsLoaded extends AdminState {
  final Map<String, dynamic> settings;

  const SettingsLoaded(this.settings);

  @override
  List<Object?> get props => [settings];
}

class SettingsUpdated extends AdminState {}
