GRANT EXECUTE ON FUNCTION public.current_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_units_for_type(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_subscription(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_licence(uuid) TO authenticated;
