import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_app/features/marketplace/data/marketplace_repository.dart';

final availablePropertiesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final repository = ref.read(marketplaceRepositoryProvider);
  return repository.fetchAvailableProperties();
});
