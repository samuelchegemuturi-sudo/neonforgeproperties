import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_app/features/dashboard/data/dashboard_repository.dart';

final activeLeasesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final repository = ref.read(dashboardRepositoryProvider);
  return repository.fetchActiveLeases();
});
