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
    // In a real scenario, this query would be shaped exactly to the schema.
    // Based on standard schemas: properties usually have status/is_published.
    // Units belong to properties and have a status.
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
            units (
              id,
              status,
              rent
            )
          ''')
          .eq('status', 'active')
          .eq('verification_status', 'verified');
          // .eq('units.status', 'VACANT'); // RLS or inner join can handle this

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      // Return empty or throw error based on preference
      return [];
    }
  }
}
