
DROP POLICY IF EXISTS properties_update ON public.properties;
CREATE POLICY properties_update ON public.properties FOR UPDATE TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'property.edit'))
     OR public.has_permission(auth.uid(),'verification.approve')
     OR public.is_super_admin(auth.uid()))
  WITH CHECK ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'property.edit'))
     OR public.has_permission(auth.uid(),'verification.approve')
     OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS verification_requests_update ON public.verification_requests;
CREATE POLICY verification_requests_update ON public.verification_requests FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(),'verification.approve') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_permission(auth.uid(),'verification.approve') OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS support_tickets_update ON public.support_tickets;
CREATE POLICY support_tickets_update ON public.support_tickets FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(),'support.reply') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_permission(auth.uid(),'support.reply') OR public.is_super_admin(auth.uid()));

REVOKE EXECUTE ON FUNCTION public.current_company_id() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.seed_company_roles(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.generate_units_for_type(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.calculate_subscription(uuid, boolean) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.generate_licence(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.tg_generate_units() FROM anon, public;

GRANT EXECUTE ON FUNCTION public.current_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_units_for_type(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_subscription(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_licence(uuid) TO authenticated;
