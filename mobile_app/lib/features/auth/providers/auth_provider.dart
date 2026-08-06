import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:mobile_app/features/auth/data/auth_repository.dart';

// State to track if the current user is a tenant
final isTenantProvider = StateProvider<bool>((ref) => false);

final authControllerProvider = StateNotifierProvider<AuthController, AsyncValue<void>>((ref) {
  return AuthController(
    ref.read(authRepositoryProvider),
    ref,
  );
});

class AuthController extends StateNotifier<AsyncValue<void>> {
  final AuthRepository _authRepository;
  final Ref _ref;

  AuthController(this._authRepository, this._ref) : super(const AsyncValue.data(null));

  Future<bool> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final response = await _authRepository.signInWithEmailPassword(
        email: email,
        password: password,
      );
      
      if (response.user != null) {
        // Resolve role
        final isTenant = await _authRepository.isUserTenant(response.user!);
        _ref.read(isTenantProvider.notifier).state = isTenant;
        state = const AsyncValue.data(null);
        return true;
      }
      return false;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<void> logout() async {
    state = const AsyncValue.loading();
    try {
      await _authRepository.signOut();
      _ref.read(isTenantProvider.notifier).state = false;
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final authStateProvider = StreamProvider<AuthState>((ref) {
  return ref.read(authRepositoryProvider).authStateChanges;
});
