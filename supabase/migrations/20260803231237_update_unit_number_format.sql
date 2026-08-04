-- 1. Add company_seq to companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS company_seq SERIAL;

-- 2. Add property_seq to properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS property_seq INTEGER;

-- 3. Populate existing properties with sequential numbers per company
WITH numbered AS (
  SELECT id, row_number() OVER (PARTITION BY company_id ORDER BY created_at) as seq
  FROM public.properties
)
UPDATE public.properties p
SET property_seq = n.seq
FROM numbered n
WHERE p.id = n.id AND p.property_seq IS NULL;

-- 4. Create trigger to auto-increment property_seq for new properties
CREATE OR REPLACE FUNCTION public.set_property_seq()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT COALESCE(MAX(property_seq), 0) + 1 INTO NEW.property_seq
  FROM public.properties
  WHERE company_id = NEW.company_id;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'properties_seq_trigger') THEN
    CREATE TRIGGER properties_seq_trigger
    BEFORE INSERT ON public.properties
    FOR EACH ROW EXECUTE FUNCTION public.set_property_seq();
  END IF;
END $$;

-- 5. Update generate_units_for_type function
CREATE OR REPLACE FUNCTION public.generate_units_for_type(_unit_type_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ut record;
  p_seq integer;
  c_seq integer;
  type_existing integer;
  existing integer;
  i integer;
  created integer := 0;
  base_prefix text;
BEGIN
  SELECT * INTO ut FROM public.unit_types WHERE id = _unit_type_id;
  IF ut IS NULL THEN RETURN 0; END IF;

  SELECT property_seq INTO p_seq FROM public.properties WHERE id = ut.property_id;
  SELECT company_seq INTO c_seq FROM public.companies WHERE id = ut.company_id;

  SELECT count(*) INTO type_existing FROM public.units WHERE unit_type_id = _unit_type_id;
  SELECT count(*) INTO existing FROM public.units WHERE property_id = ut.property_id;
  
  -- Format: property_seq (2) + company_seq (5)
  base_prefix := LPAD(p_seq::text, 2, '0') || LPAD(c_seq::text, 5, '0');

  i := existing + 1;
  WHILE created < GREATEST(ut.quantity - type_existing, 0) LOOP
    BEGIN
      INSERT INTO public.units (company_id, property_id, unit_type_id, unit_number, rent)
      VALUES (ut.company_id, ut.property_id, ut.id, base_prefix || LPAD(i::text, 3, '0'), ut.rent);
      created := created + 1;
    EXCEPTION WHEN unique_violation THEN
      NULL; -- skip and let loop continue
    END;
    i := i + 1;
  END LOOP;

  RETURN created;
END; $$;

-- 6. Update existing units to the new format
WITH ranked_units AS (
  SELECT 
    u.id,
    p.property_seq,
    c.company_seq,
    row_number() OVER (PARTITION BY u.property_id ORDER BY u.created_at, u.unit_number) as unit_seq
  FROM public.units u
  JOIN public.properties p ON u.property_id = p.id
  JOIN public.companies c ON u.company_id = c.id
)
UPDATE public.units u
SET unit_number = LPAD(r.property_seq::text, 2, '0') || LPAD(r.company_seq::text, 5, '0') || LPAD(r.unit_seq::text, 3, '0')
FROM ranked_units r
WHERE u.id = r.id;

NOTIFY pgrst, 'reload schema';
