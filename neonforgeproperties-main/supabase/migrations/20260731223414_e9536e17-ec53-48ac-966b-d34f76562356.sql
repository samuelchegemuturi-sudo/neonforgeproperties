DROP POLICY "companies_insert" ON public.companies;
CREATE POLICY "companies_insert" ON public.companies FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));

REVOKE ALL ON FUNCTION public.seed_company_roles(uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.current_company_id() FROM anon;
REVOKE ALL ON FUNCTION public.has_permission(uuid, text) FROM anon;