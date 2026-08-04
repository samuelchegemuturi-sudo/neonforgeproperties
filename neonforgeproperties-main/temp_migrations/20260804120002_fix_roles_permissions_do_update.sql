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
    ON CONFLICT (company_id, slug) DO UPDATE SET description = EXCLUDED.description
    RETURNING id INTO new_role;

    IF item->>'slug' = 'landlord' AND new_role IS NOT NULL THEN
      landlord_role := new_role;
    END IF;

    IF new_role IS NOT NULL THEN
      INSERT INTO public.role_permissions (role_id, permission_key)
      SELECT new_role, p.key FROM public.permissions p
      WHERE split_part(p.key, '.', 1) IN (
        SELECT jsonb_array_elements_text(item->'prefix')
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  RETURN landlord_role;
END; $$;
