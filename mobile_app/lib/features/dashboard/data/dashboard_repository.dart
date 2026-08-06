import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository(Supabase.instance.client);
});

class DashboardRepository {
  final SupabaseClient _client;

  DashboardRepository(this._client);

  Future<List<Map<String, dynamic>>> fetchActiveLeases() async {
    // Because of our RLS policies, this will only return leases for the current user's email.
    try {
      final response = await _client
          .from('leases')
          .select('''
            id,
            start_date,
            end_date,
            rent,
            status,
            units (
              unit_number,
              properties (
                name,
                address
              )
            )
          ''')
          .eq('status', 'active');
          
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      return [];
    }
  }
}
