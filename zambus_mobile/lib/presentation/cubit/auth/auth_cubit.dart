import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/network/api_client.dart';
import '../../../data/datasources/api_datasource.dart';
import '../../../data/models/user_model.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  final ApiDatasource _datasource;
  final ApiClient _apiClient;
  AuthCubit(this._datasource, this._apiClient) : super(AuthInitial());

  Future<void> checkAuth() async {
    try {
      emit(AuthLoading());
      final token = await _apiClient.getToken();
      if (token == null) {
        emit(AuthUnauthenticated());
        return;
      }
      final userData = await _datasource.getMe();
      emit(AuthAuthenticated(user: userData, token: token));
    } catch (e) {
      await _apiClient.clearToken();
      emit(AuthUnauthenticated());
    }
  }

  Future<void> register({
    required String fullName,
    required String email,
    required String phoneNumber,
    required String password,
    String? role,
  }) async {
    try {
      emit(AuthLoading());
      final result = await _datasource.register(
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
        password: password,
        role: role,
      );
      final user = User.fromJson(result['user'] as Map<String, dynamic>);
      final token = result['token'] as String;
      await _apiClient.setToken(token);
      emit(AuthAuthenticated(user: user, token: token));
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    try {
      emit(AuthLoading());
      final result = await _datasource.login(email: email, password: password);
      final user = User.fromJson(result['user'] as Map<String, dynamic>);
      final token = result['token'] as String;
      await _apiClient.setToken(token);
      emit(AuthAuthenticated(user: user, token: token));
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> logout() async {
    await _apiClient.clearToken();
    emit(AuthUnauthenticated());
  }

  Future<void> updateProfile({String? fullName, String? phoneNumber}) async {
    try {
      final user = await _datasource.updateProfile(
        fullName: fullName,
        phoneNumber: phoneNumber,
      );
      final currentState = state;
      if (currentState is AuthAuthenticated) {
        emit(AuthAuthenticated(user: user, token: currentState.token));
      }
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }
}
