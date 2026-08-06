-- Fix: Remove verification_officer from company-level seed_company_roles.
-- Verification Officers and Support Officers are MAKAO PLATFORM staff only.
-- They should never appear in a regular company's role list.

CREATE OR REPLACE FUNCTION public.seed_company_roles(_company_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  landlord_role uuid;
  r record;
  -- Company-level roles: these are the staff a landlord/agency actually employs.
  -- Verification Officer is intentionally ABSENT -- it's a platform staff role.
  tmpl jsonb := '[
    {"slug":"landlord",              "name":"Landlord",              "desc":"Company owner with full access",          "prefix":["dashboard","property","unit","tenant","finance","maintenance","employees","roles","verification","listing","reports","settings","audit"]},
    {"slug":"property_manager",      "name":"Property Manager",      "desc":"Runs day to day operations",             "prefix":["dashboard","property","unit","tenant","maintenance","listing","reports"]},
    {"slug":"accountant",            "name":"Accountant",            "desc":"Finance and reporting",                  "prefix":["dashboard","finance","reports","tenant"]},
    {"slug":"caretaker",             "name":"Caretaker",             "desc":"On-site property caretaker",             "prefix":["dashboard","maintenance","unit"]},
    {"slug":"receptionist",          "name":"Receptionist",          "desc":"Front desk and viewings",                "prefix":["dashboard","tenant","listing"]},
    {"slug":"maintenance_technician","name":"Maintenance Technician","desc":"Handles maintenance work orders",        "prefix":["dashboard","maintenance"]},
    {"slug":"client_landlord",       "name":"Client Landlord",       "desc":"External property owner read-only view","prefix":["dashboard","reports","finance","maintenance"]}
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

    IF item->>'slug' = 'landlord' THEN
      landlord_role := new_role;
    END IF;
  END LOOP;
  RETURN landlord_role;
END;
$$;

-- Ensure platform-level roles exist (company_id IS NULL).
-- These are MAKAO staff roles -- NOT company roles.
DO $$
DECLARE
  verif_role uuid;
  support_role uuid;
BEGIN
  -- Verification Officer
  INSERT INTO public.roles (company_id, name, slug, description, is_system)
  VALUES (null, 'Verification Officer', 'verification_officer', 'MAKAO platform: verifies properties on the ground', true)
  ON CONFLICT (slug) WHERE company_id IS NULL DO NOTHING
  RETURNING id INTO verif_role;

  IF verif_role IS NULL THEN
    SELECT id INTO verif_role FROM public.roles WHERE company_id IS NULL AND slug = 'verification_officer';
  END IF;

  IF verif_role IS NOT NULL THEN
    INSERT INTO public.role_permissions (role_id, permission_key)
    SELECT verif_role, p.key FROM public.permissions p
    WHERE split_part(p.key, '.', 1) IN ('dashboard', 'verification', 'property')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Support Officer
  INSERT INTO public.roles (company_id, name, slug, description, is_system)
  VALUES (null, 'Support Officer', 'support_officer', 'MAKAO platform: handles support tickets and customer success', true)
  ON CONFLICT (slug) WHERE company_id IS NULL DO NOTHING
  RETURNING id INTO support_role;

  IF support_role IS NULL THEN
    SELECT id INTO support_role FROM public.roles WHERE company_id IS NULL AND slug = 'support_officer';
  END IF;

  IF support_role IS NOT NULL THEN
    INSERT INTO public.role_permissions (role_id, permission_key)
    SELECT support_role, p.key FROM public.permissions p
    WHERE split_part(p.key, '.', 1) IN ('dashboard', 'support', 'companies')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Remove verification_officer from all EXISTING companies where it was incorrectly seeded.
-- Users assigned to this role at company level are unaffected (their user_roles rows stay)
-- but the role is removed from the company's role catalog so it no longer appears in dropdowns.
DELETE FROM public.roles
WHERE slug = 'verification_officer'
  AND company_id IS NOT NULL;
