import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_app/core/theme/app_theme.dart';
import 'package:mobile_app/features/marketplace/providers/marketplace_provider.dart';

class MarketplaceScreen extends ConsumerWidget {
  const MarketplaceScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final propertiesAsync = ref.watch(availablePropertiesProvider);

    return Scaffold(
      body: propertiesAsync.when(
        data: (properties) {
          if (properties.isEmpty) {
            return const Center(
              child: Text('No properties available at the moment.'),
            );
          }
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: ListView.builder(
              itemCount: properties.length,
              itemBuilder: (context, index) {
                final prop = properties[index];
                return Column(
                  children: [
                    if (index == 0) ...[
                      const SizedBox(height: 40),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Explore Properties',
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.darkPurpleText,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.login, color: AppTheme.primaryPurple),
                            onPressed: () => context.go('/login'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                    ],
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(16),
                      decoration: AppTheme.cardDecoration(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            height: 150,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: const Color(0xFFF3F4F6),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Center(
                              child: Icon(Icons.home, size: 64, color: AppTheme.primaryPurple),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            prop['name'] ?? 'Unnamed Property',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.darkPurpleText,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            prop['address'] ?? 'No address provided',
                            style: const TextStyle(color: Color(0xFF6B7280)),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {},
                            child: const Text('View Details'),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Text('Error loading properties: $err'),
        ),
      ),
    );
  }
}
