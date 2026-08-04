
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  national_id text,
  emergency_name text,
  emergency_phone text,
  kyc_status text NOT NULL DEFAULT 'incomplete',
  notes text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenants_read ON public.tenants FOR SELECT TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'tenant.view')) OR public.is_super_admin(auth.uid()));
CREATE POLICY tenants_insert ON public.tenants FOR INSERT TO authenticated
  WITH CHECK ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'tenant.create')) OR public.is_super_admin(auth.uid()));
CREATE POLICY tenants_update ON public.tenants FOR UPDATE TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'tenant.edit')) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'tenant.edit')) OR public.is_super_admin(auth.uid()));
CREATE POLICY tenants_delete ON public.tenants FOR DELETE TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'tenant.delete')) OR public.is_super_admin(auth.uid()));
CREATE TRIGGER tenants_updated BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  start_date date NOT NULL DEFAULT current_date,
  end_date date,
  rent numeric(12,2) NOT NULL DEFAULT 0,
  service_charge numeric(12,2) NOT NULL DEFAULT 0,
  deposit numeric(12,2) NOT NULL DEFAULT 0,
  billing_day integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active',
  terminated_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS leases_active_unit_uniq ON public.leases (unit_id) WHERE status = 'active';
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leases TO authenticated;
GRANT ALL ON public.leases TO service_role;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
CREATE POLICY leases_read ON public.leases FOR SELECT TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'tenant.view')) OR public.is_super_admin(auth.uid()));
CREATE POLICY leases_insert ON public.leases FOR INSERT TO authenticated
  WITH CHECK ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'tenant.create')) OR public.is_super_admin(auth.uid()));
CREATE POLICY leases_update ON public.leases FOR UPDATE TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'tenant.edit')) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'tenant.edit')) OR public.is_super_admin(auth.uid()));
CREATE POLICY leases_delete ON public.leases FOR DELETE TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'tenant.delete')) OR public.is_super_admin(auth.uid()));
CREATE TRIGGER leases_updated BEFORE UPDATE ON public.leases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.tg_sync_unit_occupancy() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.units SET status = 'vacant' WHERE id = OLD.unit_id
      AND NOT EXISTS (SELECT 1 FROM public.leases l WHERE l.unit_id = OLD.unit_id AND l.status = 'active' AND l.id <> OLD.id);
    RETURN OLD;
  END IF;

  IF NEW.status = 'active' THEN
    UPDATE public.units SET status = 'occupied' WHERE id = NEW.unit_id;
  ELSE
    UPDATE public.units SET status = 'vacant' WHERE id = NEW.unit_id
      AND NOT EXISTS (SELECT 1 FROM public.leases l WHERE l.unit_id = NEW.unit_id AND l.status = 'active' AND l.id <> NEW.id);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER leases_sync_occupancy AFTER INSERT OR UPDATE OR DELETE ON public.leases
  FOR EACH ROW EXECUTE FUNCTION public.tg_sync_unit_occupancy();

REVOKE EXECUTE ON FUNCTION public.tg_sync_unit_occupancy() FROM anon, public;
