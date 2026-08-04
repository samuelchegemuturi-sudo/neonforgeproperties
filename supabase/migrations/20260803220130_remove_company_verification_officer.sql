-- Remove verification_officer from seed_company_roles template
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

      IF item->>'slug' = 'landlord' AND new_role IS NOT NULL THEN
        landlord_role := new_role;
      END IF;

      IF new_role IS NOT NULL THEN
        FOR r IN SELECT key FROM public.permissions 
                 WHERE module = ANY(ARRAY(SELECT jsonb_array_elements_text(item->'prefix'))) LOOP
          INSERT INTO public.role_permissions (role_id, permission_key)
          VALUES (new_role, r.key) ON CONFLICT DO NOTHING;
        END LOOP;
      END IF;
    END LOOP;
    
    -- Ensure landlord_role is returned if it existed before
    IF landlord_role IS NULL THEN
      SELECT id INTO landlord_role FROM public.roles WHERE company_id = _company_id AND slug = 'landlord';
    END IF;

    RETURN landlord_role;
  END;
$$;

-- Delete any existing verification_officer roles that were attached to specific companies
-- Note: Platform-level officers (created via adminCreateOfficer) have company_id = NULL
-- and role slug 'platform_verification_officer' / 'platform_support_officer' so they are safe.
DELETE FROM public.roles 
WHERE slug = 'verification_officer' 
AND company_id IS NOT NULL;

NOTIFY pgrst, 'reload schema';
