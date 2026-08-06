import 'package:go_router/go_router.dart';
import 'package:mobile_app/features/marketplace/presentation/screens/marketplace_screen.dart';
import 'package:mobile_app/features/auth/presentation/screens/login_screen.dart';
import 'package:mobile_app/features/dashboard/presentation/screens/tenant_dashboard_screen.dart';
import 'package:mobile_app/features/maintenance/presentation/screens/maintenance_request_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const MarketplaceScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const TenantDashboardScreen(),
    ),
    GoRoute(
      path: '/maintenance_request',
      builder: (context, state) => const MaintenanceRequestScreen(),
    ),
  ],
);
