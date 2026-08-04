
-- =============== COMPANIES ===============
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS company_type text NOT NULL DEFAULT 'individual_landlord',
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS verified_by uuid,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS activation_status text NOT NULL DEFAULT 'pending_activation',
  ADD COLUMN IF NOT EXISTS auto_disbursement boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS kyc_status text NOT NULL DEFAULT 'incomplete',
  ADD COLUMN IF NOT EXISTS kyc_details jsonb NOT NULL DEFAULT '{}'::jsonb;

-- =============== PLATFORM SETTINGS ===============
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY platform_settings_read ON public.platform_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY platform_settings_write ON public.platform_settings FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
GRANT INSERT, UPDATE, DELETE ON public.platform_settings TO authenticated;
CREATE TRIGGER platform_settings_updated BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.platform_settings (key, value, label, category) VALUES
  ('activation_fee', '20'::jsonb, 'One-time activation fee (KES)', 'billing'),
  ('commission_percent', '5'::jsonb, 'Platform commission on rent (%)', 'billing'),
  ('verification_fee', '500'::jsonb, 'Property verification fee (KES)', 'billing'),
  ('licence_prefix', '"EST"'::jsonb, 'Licence code prefix', 'general')
ON CONFLICT (key) DO NOTHING;

-- =============== PRICING RULES ===============
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  bedrooms integer,
  price_per_unit numeric(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'residential',
  is_configurable boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_rules TO authenticated;
GRANT ALL ON public.pricing_rules TO service_role;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY pricing_rules_read ON public.pricing_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY pricing_rules_write ON public.pricing_rules FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER pricing_rules_updated BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.pricing_rules (slug, label, bedrooms, price_per_unit, category, is_configurable, sort_order) VALUES
  ('single_room','Single Room',0,50,'residential',false,1),
  ('bedsitter','Bedsitter / Studio',0,50,'residential',false,2),
  ('1br','1 Bedroom',1,100,'residential',false,3),
  ('2br','2 Bedroom',2,150,'residential',false,4),
  ('3br','3 Bedroom',3,200,'residential',false,5),
  ('4br','4 Bedroom',4,250,'residential',false,6),
  ('5br','5 Bedroom',5,300,'residential',false,7),
  ('commercial','Commercial',NULL,300,'commercial',true,8),
  ('office','Office',NULL,300,'commercial',true,9),
  ('warehouse','Warehouse',NULL,400,'commercial',true,10),
  ('shop','Shop',NULL,200,'commercial',true,11)
ON CONFLICT (slug) DO NOTHING;

-- =============== PROPERTY OWNERS ===============
CREATE TABLE IF NOT EXISTS public.property_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  national_id text,
  commission_percent numeric(5,2) NOT NULL DEFAULT 0,
  notes text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_owners TO authenticated;
GRANT ALL ON public.property_owners TO service_role;
ALTER TABLE public.property_owners ENABLE ROW LEVEL SECURITY;
CREATE POLICY property_owners_read ON public.property_owners FOR SELECT TO authenticated
  USING (company_id = public.current_company_id() OR public.is_super_admin(auth.uid()));
CREATE POLICY property_owners_write ON public.property_owners FOR ALL TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'property.edit')) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'property.edit')) OR public.is_super_admin(auth.uid()));
CREATE TRIGGER property_owners_updated BEFORE UPDATE ON public.property_owners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============== PROPERTIES ===============
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES public.property_owners(id) ON DELETE SET NULL,
  name text NOT NULL,
  property_type text NOT NULL DEFAULT 'residential',
  address text,
  city text,
  county text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  description text,
  status text NOT NULL DEFAULT 'inactive',
  verification_status text NOT NULL DEFAULT 'unverified',
  verified_at timestamptz,
  verified_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY properties_read ON public.properties FOR SELECT TO authenticated
  USING (company_id = public.current_company_id()
     OR public.is_super_admin(auth.uid())
     OR public.has_permission(auth.uid(),'verification.view'));
CREATE POLICY properties_insert ON public.properties FOR INSERT TO authenticated
  WITH CHECK ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'property.create')) OR public.is_super_admin(auth.uid()));
CREATE POLICY properties_update ON public.properties FOR UPDATE TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'property.edit'))
     OR public.has_permission(auth.uid(),'verification.approve')
     OR public.is_super_admin(auth.uid()))
  WITH CHECK (true);
CREATE POLICY properties_delete ON public.properties FOR DELETE TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'property.delete')) OR public.is_super_admin(auth.uid()));
CREATE TRIGGER properties_updated BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============== UNIT TYPES ===============
CREATE TABLE IF NOT EXISTS public.unit_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  pricing_slug text NOT NULL REFERENCES public.pricing_rules(slug),
  label text NOT NULL,
  bedrooms integer NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  rent numeric(12,2) NOT NULL DEFAULT 0,
  service_charge numeric(12,2) NOT NULL DEFAULT 0,
  deposit numeric(12,2) NOT NULL DEFAULT 0,
  unit_prefix text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unit_types TO authenticated;
GRANT ALL ON public.unit_types TO service_role;
ALTER TABLE public.unit_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY unit_types_read ON public.unit_types FOR SELECT TO authenticated
  USING (company_id = public.current_company_id() OR public.is_super_admin(auth.uid()));
CREATE POLICY unit_types_write ON public.unit_types FOR ALL TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'unit.edit')) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'unit.edit')) OR public.is_super_admin(auth.uid()));
CREATE TRIGGER unit_types_updated BEFORE UPDATE ON public.unit_types
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============== UNITS ===============
CREATE TABLE IF NOT EXISTS public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_type_id uuid NOT NULL REFERENCES public.unit_types(id) ON DELETE CASCADE,
  unit_number text NOT NULL,
  status text NOT NULL DEFAULT 'vacant',
  rent numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, unit_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.units TO authenticated;
GRANT ALL ON public.units TO service_role;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY units_read ON public.units FOR SELECT TO authenticated
  USING (company_id = public.current_company_id() OR public.is_super_admin(auth.uid()));
CREATE POLICY units_write ON public.units FOR ALL TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'unit.edit')) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'unit.edit')) OR public.is_super_admin(auth.uid()));
CREATE TRIGGER units_updated BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============== LICENCES ===============
CREATE TABLE IF NOT EXISTS public.licences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  activation_fee numeric(12,2) NOT NULL DEFAULT 0,
  issued_by uuid,
  issued_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.licences TO authenticated;
GRANT ALL ON public.licences TO service_role;
ALTER TABLE public.licences ENABLE ROW LEVEL SECURITY;
CREATE POLICY licences_read ON public.licences FOR SELECT TO authenticated
  USING (company_id = public.current_company_id() OR public.is_super_admin(auth.uid()));
CREATE POLICY licences_insert ON public.licences FOR INSERT TO authenticated
  WITH CHECK (company_id = public.current_company_id() OR public.is_super_admin(auth.uid()));
CREATE POLICY licences_update ON public.licences FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER licences_updated BEFORE UPDATE ON public.licences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============== SUBSCRIPTION INVOICES ===============
CREATE TABLE IF NOT EXISTS public.subscription_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  billable_units integer NOT NULL DEFAULT 0,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  basis text NOT NULL DEFAULT 'registered_units',
  status text NOT NULL DEFAULT 'pending',
  settled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_invoices TO authenticated;
GRANT ALL ON public.subscription_invoices TO service_role;
ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscription_invoices_read ON public.subscription_invoices FOR SELECT TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'finance.view')) OR public.is_super_admin(auth.uid()));
CREATE POLICY subscription_invoices_write ON public.subscription_invoices FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER subscription_invoices_updated BEFORE UPDATE ON public.subscription_invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============== VERIFICATION REQUESTS ===============
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  target_type text NOT NULL DEFAULT 'property',
  status text NOT NULL DEFAULT 'pending',
  assigned_to uuid,
  latitude numeric(10,7),
  longitude numeric(10,7),
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  report text,
  decision_at timestamptz,
  decided_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.verification_requests TO authenticated;
GRANT ALL ON public.verification_requests TO service_role;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY verification_requests_read ON public.verification_requests FOR SELECT TO authenticated
  USING (company_id = public.current_company_id()
     OR public.has_permission(auth.uid(),'verification.view')
     OR public.is_super_admin(auth.uid()));
CREATE POLICY verification_requests_insert ON public.verification_requests FOR INSERT TO authenticated
  WITH CHECK (company_id = public.current_company_id() OR public.is_super_admin(auth.uid()));
CREATE POLICY verification_requests_update ON public.verification_requests FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(),'verification.approve') OR public.is_super_admin(auth.uid()))
  WITH CHECK (true);
CREATE TRIGGER verification_requests_updated BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============== AUDIT LOGS ===============
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid,
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_read ON public.audit_logs FOR SELECT TO authenticated
  USING ((company_id = public.current_company_id() AND public.has_permission(auth.uid(),'audit.view')) OR public.is_super_admin(auth.uid()));
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- =============== SUPPORT TICKETS ===============
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by uuid,
  subject text NOT NULL,
  body text,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  assigned_to uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY support_tickets_read ON public.support_tickets FOR SELECT TO authenticated
  USING (company_id = public.current_company_id() OR public.has_permission(auth.uid(),'support.view') OR public.is_super_admin(auth.uid()));
CREATE POLICY support_tickets_insert ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY support_tickets_update ON public.support_tickets FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(),'support.reply') OR public.is_super_admin(auth.uid())) WITH CHECK (true);
CREATE TRIGGER support_tickets_updated BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============== ANNOUNCEMENTS ===============
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL DEFAULT 'all',
  published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY announcements_read ON public.announcements FOR SELECT TO authenticated USING (published OR public.is_super_admin(auth.uid()));
CREATE POLICY announcements_write ON public.announcements FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER announcements_updated BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============== NEW PERMISSIONS ===============
INSERT INTO public.permissions (key, module, action, label, sort_order) VALUES
  ('companies.view','companies','view','View all companies',100),
  ('companies.create','companies','create','Register companies',101),
  ('companies.edit','companies','edit','Edit any company',102),
  ('companies.suspend','companies','suspend','Suspend companies',103),
  ('companies.delete','companies','delete','Delete companies',104),
  ('companies.verify','companies','verify','Verify companies',105),
  ('companies.impersonate','companies','impersonate','Impersonate company users',106),
  ('licence.view','licence','view','View licences',110),
  ('licence.generate','licence','generate','Generate licences',111),
  ('licence.revoke','licence','revoke','Revoke licences',112),
  ('pricing.view','pricing','view','View pricing rules',120),
  ('pricing.edit','pricing','edit','Edit pricing rules',121),
  ('subscriptions.view','subscriptions','view','View subscriptions',130),
  ('subscriptions.manage','subscriptions','manage','Manage subscription billing',131),
  ('support.view','support','view','View support tickets',140),
  ('support.reply','support','reply','Reply to support tickets',141),
  ('support.reset_password','support','reset_password','Trigger password resets',142),
  ('system.settings','system','settings','Manage system settings',150),
  ('system.logs','system','logs','View system logs',151),
  ('system.announce','system','announce','Broadcast announcements',152),
  ('verification.assign','verification','assign','Assign verification jobs',160),
  ('verification.approve','verification','approve','Approve or reject verifications',161),
  ('verification.report','verification','report','Generate verification reports',162)
ON CONFLICT (key) DO NOTHING;

-- =============== PLATFORM ROLES (no company) ===============
CREATE UNIQUE INDEX IF NOT EXISTS roles_platform_slug_uniq ON public.roles (slug) WHERE company_id IS NULL;

INSERT INTO public.roles (company_id, name, slug, description, is_system)
VALUES
  (NULL,'Verification Officer','platform_verification_officer','Platform field verification officer',true),
  (NULL,'Support Officer','platform_support_officer','Platform customer support officer',true)
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_key)
SELECT r.id, p.key FROM public.roles r, public.permissions p
WHERE r.company_id IS NULL AND r.slug = 'platform_verification_officer'
  AND p.key IN ('dashboard.view','verification.view','verification.assign','verification.approve','verification.report','property.view')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_key)
SELECT r.id, p.key FROM public.roles r, public.permissions p
WHERE r.company_id IS NULL AND r.slug = 'platform_support_officer'
  AND p.key IN ('dashboard.view','support.view','support.reply','support.reset_password','companies.view')
ON CONFLICT DO NOTHING;

-- =============== UNIT GENERATION ===============
CREATE OR REPLACE FUNCTION public.generate_units_for_type(_unit_type_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ut record;
  existing integer;
  i integer;
  created integer := 0;
  prefix text;
BEGIN
  SELECT * INTO ut FROM public.unit_types WHERE id = _unit_type_id;
  IF ut IS NULL THEN RETURN 0; END IF;

  SELECT count(*) INTO existing FROM public.units WHERE unit_type_id = _unit_type_id;
  prefix := COALESCE(NULLIF(ut.unit_prefix,''), upper(left(regexp_replace(ut.label,'[^a-zA-Z0-9]','','g'),3)));

  i := existing + 1;
  WHILE created < GREATEST(ut.quantity - existing, 0) LOOP
    BEGIN
      INSERT INTO public.units (company_id, property_id, unit_type_id, unit_number, rent)
      VALUES (ut.company_id, ut.property_id, ut.id, prefix || '-' || lpad(i::text, 3, '0'), ut.rent);
      created := created + 1;
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
    i := i + 1;
  END LOOP;

  RETURN created;
END; $$;

CREATE OR REPLACE FUNCTION public.tg_generate_units() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.generate_units_for_type(NEW.id);
  RETURN NEW;
END; $$;

CREATE TRIGGER unit_types_generate AFTER INSERT OR UPDATE OF quantity ON public.unit_types
  FOR EACH ROW EXECUTE FUNCTION public.tg_generate_units();

-- =============== SUBSCRIPTION CALCULATOR ===============
CREATE OR REPLACE FUNCTION public.calculate_subscription(_company_id uuid, _paid_only boolean DEFAULT false)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH rows AS (
    SELECT pr.label,
           pr.slug,
           pr.price_per_unit,
           count(u.id)::int AS qty
    FROM public.units u
    JOIN public.unit_types ut ON ut.id = u.unit_type_id
    JOIN public.pricing_rules pr ON pr.slug = ut.pricing_slug
    WHERE u.company_id = _company_id
      AND (NOT _paid_only OR u.status = 'occupied')
    GROUP BY pr.label, pr.slug, pr.price_per_unit
  )
  SELECT jsonb_build_object(
    'total', COALESCE((SELECT sum(qty * price_per_unit) FROM rows), 0),
    'units', COALESCE((SELECT sum(qty) FROM rows), 0),
    'basis', CASE WHEN _paid_only THEN 'paying_units' ELSE 'registered_units' END,
    'breakdown', COALESCE((SELECT jsonb_agg(jsonb_build_object('label',label,'slug',slug,'qty',qty,'price',price_per_unit,'subtotal',qty*price_per_unit) ORDER BY label) FROM rows), '[]'::jsonb)
  );
$$;

-- =============== LICENCE GENERATION ===============
CREATE OR REPLACE FUNCTION public.generate_licence(_company_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing text;
  new_code text;
  fee numeric;
  prefix text;
BEGIN
  IF NOT (public.is_super_admin(auth.uid()) OR _company_id = public.current_company_id()) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  SELECT code INTO existing FROM public.licences WHERE company_id = _company_id;
  IF existing IS NOT NULL THEN RETURN existing; END IF;

  SELECT trim(both '"' from value::text) INTO prefix FROM public.platform_settings WHERE key = 'licence_prefix';
  SELECT (value::text)::numeric INTO fee FROM public.platform_settings WHERE key = 'activation_fee';

  LOOP
    new_code := COALESCE(prefix,'EST') || '-' || to_char(now(),'YYYY') || '-' ||
                upper(substr(md5(gen_random_uuid()::text), 1, 7));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.licences WHERE code = new_code);
  END LOOP;

  INSERT INTO public.licences (company_id, code, activation_fee, issued_by)
  VALUES (_company_id, new_code, COALESCE(fee,0), auth.uid());

  UPDATE public.companies SET activation_status = 'active', status = 'active' WHERE id = _company_id;
  UPDATE public.properties SET status = 'active' WHERE company_id = _company_id AND status = 'inactive';

  RETURN new_code;
END; $$;
