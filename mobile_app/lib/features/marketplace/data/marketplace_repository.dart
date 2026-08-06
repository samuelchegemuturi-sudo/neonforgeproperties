import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final marketplaceRepositoryProvider = Provider<MarketplaceRepository>((ref) {
  return MarketplaceRepository(Supabase.instance.client);
});

class MarketplaceRepository {
  final SupabaseClient _client;

  MarketplaceRepository(this._client);

  /// Fetches published, active properties with vacant units.
  Future<List<Map<String, dynamic>>> fetchAvailableProperties() async {
    try {
      final response = await _client
          .from('properties')
          .select('''
            id,
            name,
            description,
            address,
            city,
            status,
            verification_status,
            companies (
              name
            ),
            unit_types (
              id,
              label,
              rent,
              units (
                id,
                status
              )
            )
          ''');

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      print('Error fetching properties: $e');
      return [];
    }
  }
}
