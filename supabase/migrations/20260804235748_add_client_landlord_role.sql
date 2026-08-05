-- 1. Update the seed function to include the Client Landlord role for new companies
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
    {"slug":"maintenance_technician","name":"Maintenance Technician","desc":"Handles work orders","prefix":["dashboard","maintenance"]},
    {"slug":"client_landlord","name":"Client Landlord","desc":"External property owner view","prefix":["dashboard","reports","finance","maintenance"]}
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

-- 2. Backfill the role for all existing companies
DO $$
DECLARE
  comp record;
  new_role uuid;
BEGIN
  FOR comp IN SELECT id FROM public.companies LOOP
    -- Insert the Client Landlord role if it doesn't exist
    INSERT INTO public.roles (company_id, name, slug, description, is_system)
    VALUES (comp.id, 'Client Landlord', 'client_landlord', 'External property owner view', true)
    ON CONFLICT (company_id, slug) DO NOTHING
    RETURNING id INTO new_role;
    
    IF new_role IS NULL THEN
      SELECT id INTO new_role FROM public.roles WHERE company_id = comp.id AND slug = 'client_landlord';
    END IF;

    -- Give them basic view access to dashboard, reports, finance, maintenance
    INSERT INTO public.role_permissions (role_id, permission_key)
    SELECT new_role, p.key FROM public.permissions p
    WHERE split_part(p.key, '.', 1) IN ('dashboard', 'reports', 'finance', 'maintenance')
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;
