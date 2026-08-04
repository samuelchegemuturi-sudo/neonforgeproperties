-- ===== COMPANIES =====
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  country text DEFAULT 'Kenya',
  currency text NOT NULL DEFAULT 'KES',
  logo_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  full_name text,
  email text,
  phone text,
  national_id text,
  position text,
  avatar_url text,
  is_super_admin boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ===== ROLES =====
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, slug)
);

-- ===== PERMISSIONS CATALOGUE =====
CREATE TABLE public.permissions (
  key text PRIMARY KEY,
  module text NOT NULL,
  action text NOT NULL,
  label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE public.role_permissions (
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_key text NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_key)
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id)
);

CREATE TABLE public.theme_preferences (
  user_id uuid PRIMARY KEY,
  mode text NOT NULL DEFAULT 'light',
  accent text NOT NULL DEFAULT 'indigo',
  radius text NOT NULL DEFAULT 'medium',
  font text NOT NULL DEFAULT 'inter',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ===== GRANTS =====
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.theme_preferences TO authenticated;
GRANT ALL ON public.theme_preferences TO service_role;

-- ===== SECURITY DEFINER HELPERS =====
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND is_super_admin);
$$;

CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin(_user_id) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    WHERE ur.user_id = _user_id AND rp.permission_key = _key
  );
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER companies_updated BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER roles_updated BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== RLS =====
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_read" ON public.companies FOR SELECT TO authenticated
  USING (id = public.current_company_id() OR public.is_super_admin(auth.uid()));
CREATE POLICY "companies_update" ON public.companies FOR UPDATE TO authenticated
  USING ((id = public.current_company_id() AND public.has_permission(auth.uid(), 'settings.edit')) OR public.is_super_admin(auth.uid()));
CREATE POLICY "companies_insert" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "profiles_read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR company_id = public.current_company_id() OR public.is_super_admin(auth.uid()));
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_super_admin(auth.uid()))
  WITH CHECK (id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "profiles_update_staff" ON public.profiles FOR UPDATE TO authenticated
  USING (company_id = public.current_company_id() AND public.has_permission(auth.uid(), 'employees.edit'))
  WITH CHECK (company_id = public.current_company_id());
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "roles_read" ON public.roles FOR SELECT TO authenticated
  USING (company_id = public.current_company_id() OR company_id IS NULL OR public.is_super_admin(auth.uid()));
CREATE POLICY "roles_write" ON public.roles FOR INSERT TO authenticated
  WITH CHECK (company_id = public.current_company_id() AND public.has_permission(auth.uid(), 'roles.create'));
CREATE POLICY "roles_edit" ON public.roles FOR UPDATE TO authenticated
  USING (company_id = public.current_company_id() AND public.has_permission(auth.uid(), 'roles.edit'));
CREATE POLICY "roles_delete" ON public.roles FOR DELETE TO authenticated
  USING (company_id = public.current_company_id() AND NOT is_system AND public.has_permission(auth.uid(), 'roles.delete'));

CREATE POLICY "permissions_read" ON public.permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "role_permissions_read" ON public.role_permissions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_id AND (r.company_id = public.current_company_id() OR public.is_super_admin(auth.uid()))));
CREATE POLICY "role_permissions_insert" ON public.role_permissions FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'roles.edit') AND EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_id AND r.company_id = public.current_company_id()));
CREATE POLICY "role_permissions_delete" ON public.role_permissions FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'roles.edit') AND EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_id AND r.company_id = public.current_company_id()));

CREATE POLICY "user_roles_read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR company_id = public.current_company_id() OR public.is_super_admin(auth.uid()));
CREATE POLICY "user_roles_manage" ON public.user_roles FOR ALL TO authenticated
  USING (company_id = public.current_company_id() AND public.has_permission(auth.uid(), 'employees.edit'))
  WITH CHECK (company_id = public.current_company_id() AND public.has_permission(auth.uid(), 'employees.edit'));

CREATE POLICY "theme_own" ON public.theme_preferences FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ===== PERMISSION CATALOGUE DATA =====
INSERT INTO public.permissions (key, module, action, label, sort_order) VALUES
('dashboard.view','Dashboard','view','View dashboard',1),
('property.view','Property','view','View properties',10),
('property.create','Property','create','Create properties',11),
('property.edit','Property','edit','Edit properties',12),
('property.delete','Property','delete','Delete properties',13),
('property.export','Property','export','Export properties',14),
('unit.view','Units','view','View units',20),
('unit.create','Units','create','Create units',21),
('unit.edit','Units','edit','Edit units',22),
('unit.delete','Units','delete','Delete units',23),
('tenant.view','Tenant','view','View tenants',30),
('tenant.create','Tenant','create','Add tenants',31),
('tenant.edit','Tenant','edit','Update tenants',32),
('tenant.delete','Tenant','delete','Delete tenants',33),
('finance.view','Finance','view','View finance',40),
('finance.approve','Finance','approve','Approve payouts',41),
('finance.refund','Finance','refund','Process refunds',42),
('finance.export','Finance','export','Export finance',43),
('maintenance.view','Maintenance','view','View maintenance',50),
('maintenance.assign','Maintenance','assign','Assign work orders',51),
('maintenance.close','Maintenance','close','Close work orders',52),
('employees.view','Employees','view','View employees',60),
('employees.create','Employees','create','Add employees',61),
('employees.edit','Employees','edit','Edit employees',62),
('employees.delete','Employees','delete','Remove employees',63),
('roles.view','Roles','view','View roles',70),
('roles.create','Roles','create','Create roles',71),
('roles.edit','Roles','edit','Edit roles & permissions',72),
('roles.delete','Roles','delete','Delete roles',73),
('verification.view','Verification','view','View verifications',80),
('verification.upload','Verification','upload','Upload verification photos',81),
('verification.approve','Verification','approve','Approve / reject verification',82),
('listing.view','Listings','view','View listings',90),
('listing.publish','Listings','publish','Publish listings',91),
('reports.view','Reports','view','View reports',100),
('reports.export','Reports','export','Export reports',101),
('settings.view','Settings','view','View settings',110),
('settings.edit','Settings','edit','Edit settings',111),
('audit.view','Audit','view','View audit logs',120);

-- ===== DEFAULT ROLE TEMPLATES + SIGNUP HANDLER =====
CREATE OR REPLACE FUNCTION public.seed_company_roles(_company_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  landlord_role uuid;
  r record;
  tmpl jsonb := '[
    {"slug":"landlord","name":"Landlord","desc":"Company owner with full access","prefix":["dashboard","property","unit","tenant","finance","maintenance","employees","roles","verification","listing","reports","settings","audit"]},
    {"slug":"property_manager","name":"Property Manager","desc":"Runs day to day operations","prefix":["dashboard","property","unit","tenant","maintenance","listing","reports"]},
    {"slug":"accountant","name":"Accountant","desc":"Finance and reporting","prefix":["dashboard","finance","reports","tenant"]},
    {"slug":"caretaker","name":"Caretaker","desc":"On-site property caretaker","prefix":["dashboard","maintenance","unit"]},
    {"slug":"receptionist","name":"Receptionist","desc":"Front desk and viewings","prefix":["dashboard","tenant","listing"]},
    {"slug":"verification_officer","name":"Verification Officer","desc":"Verifies properties on the ground","prefix":["dashboard","verification","property"]},
    {"slug":"maintenance_technician","name":"Maintenance Technician","desc":"Handles work orders","prefix":["dashboard","maintenance"]}
  ]'::jsonb;
  item jsonb;
  new_role uuid;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(tmpl) LOOP
    INSERT INTO public.roles (company_id, name, slug, description, is_system)
    VALUES (_company_id, item->>'name', item->>'slug', item->>'desc', true)
    ON CONFLICT (company_id, slug) DO NOTHING
    RETURNING id INTO new_role;

    IF new_role IS NULL THEN
      SELECT id INTO new_role FROM public.roles WHERE company_id = _company_id AND slug = item->>'slug';
    END IF;

    INSERT INTO public.role_permissions (role_id, permission_key)
    SELECT new_role, p.key FROM public.permissions p
    WHERE split_part(p.key, '.', 1) IN (
      SELECT jsonb_array_elements_text(item->'prefix')
    )
    AND NOT (item->>'slug' <> 'landlord' AND p.key IN ('roles.delete','settings.edit'))
    ON CONFLICT DO NOTHING;

    IF item->>'slug' = 'landlord' THEN landlord_role := new_role; END IF;
  END LOOP;

  RETURN landlord_role;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_company uuid;
  landlord_role uuid;
  company_name text := NULLIF(NEW.raw_user_meta_data->>'company_name', '');
BEGIN
  IF company_name IS NOT NULL THEN
    INSERT INTO public.companies (name, email) VALUES (company_name, NEW.email) RETURNING id INTO new_company;
  END IF;

  INSERT INTO public.profiles (id, company_id, full_name, email, phone)
  VALUES (NEW.id, new_company, NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.raw_user_meta_data->>'phone');

  INSERT INTO public.theme_preferences (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;

  IF new_company IS NOT NULL THEN
    landlord_role := public.seed_company_roles(new_company);
    IF landlord_role IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role_id, company_id) VALUES (NEW.id, landlord_role, new_company)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();