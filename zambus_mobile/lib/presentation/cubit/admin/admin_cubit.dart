import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/utils/error_messages.dart';
import '../../../data/datasources/api_datasource.dart';
import 'admin_state.dart';

class AdminCubit extends Cubit<AdminState> {
  final ApiDatasource _datasource;
  AdminCubit(this._datasource) : super(AdminInitial());

  Future<void> loadPendingCompanies() async {
    try {
      emit(PendingCompaniesLoading());
      final companies = await _datasource.getPendingCompanies();
      emit(PendingCompaniesLoaded(companies));
    } catch (e) {
      emit(AdminError(ErrorMessages.from(e)));
    }
  }

  Future<void> approveCompany(String id) async {
    try {
      await _datasource.approveCompany(id);
      emit(CompanyApproved(id));
      await loadPendingCompanies();
    } catch (e) {
      emit(AdminError(ErrorMessages.from(e)));
    }
  }

  Future<void> rejectCompany(String id) async {
    try {
      await _datasource.rejectCompany(id);
      await loadPendingCompanies();
    } catch (e) {
      emit(AdminError(ErrorMessages.from(e)));
    }
  }

  Future<void> loadAllUsers({String? role, int page = 1, int limit = 50}) async {
    try {
      emit(AllUsersLoading());
      final users = await _datasource.getAllUsers(role: role, page: page, limit: limit);
      emit(AllUsersLoaded(users, users.length));
    } catch (e) {
      emit(AdminError(ErrorMessages.from(e)));
    }
  }

  Future<void> updateUserRole(String id, String role) async {
    try {
      await _datasource.updateUserRole(id, role);
      emit(UserRoleUpdated(id, role));
      await loadAllUsers();
    } catch (e) {
      emit(AdminError(ErrorMessages.from(e)));
    }
  }

  Future<void> loadAnalytics() async {
    try {
      emit(AnalyticsLoading());
      final analytics = await _datasource.getAnalytics();
      emit(AnalyticsLoaded(analytics));
    } catch (e) {
      emit(AdminError(ErrorMessages.from(e)));
    }
  }

  Future<void> updateCommission(double rate) async {
    try {
      emit(CommissionUpdating());
      await _datasource.updateCommission(rate);
      emit(CommissionUpdated(rate));
    } catch (e) {
      emit(AdminError(ErrorMessages.from(e)));
    }
  }

  Future<void> loadSettings() async {
    try {
      final settings = await _datasource.getSettings();
      emit(SettingsLoaded(settings));
    } catch (e) {
      emit(AdminError(ErrorMessages.from(e)));
    }
  }

  Future<void> updateSettings(Map<String, dynamic> updates) async {
    try {
      await _datasource.updateSettings(updates);
      emit(SettingsUpdated());
      await loadSettings();
    } catch (e) {
      emit(AdminError(ErrorMessages.from(e)));
    }
  }
}
