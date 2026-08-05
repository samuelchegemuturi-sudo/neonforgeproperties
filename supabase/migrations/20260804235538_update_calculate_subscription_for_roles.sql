CREATE OR REPLACE FUNCTION public.calculate_subscription(_company_id uuid, _paid_only boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_company_type text;
  v_rate numeric;
  v_units_count int;
  v_result jsonb;
BEGIN
  -- 1. Get the company type
  SELECT company_type INTO v_company_type 
  FROM public.companies 
  WHERE id = _company_id;

  -- 2. Determine rate based on company type
  v_rate := CASE v_company_type
    WHEN 'individual_landlord' THEN 500
    WHEN 'property_management_agency' THEN 1500
    WHEN 'developer' THEN 2500
    WHEN 'corporate_housing' THEN 2000
    WHEN 'sacco' THEN 2000
    ELSE 0 -- airbnb_host, real_estate_company might be strictly commission based
  END;

  -- 3. Count units in verified properties
  SELECT count(u.id) INTO v_units_count
  FROM public.units u
  JOIN public.properties p ON p.id = u.property_id
  WHERE u.company_id = _company_id 
    AND p.verification_status = 'verified';

  IF v_units_count IS NULL THEN
    v_units_count := 0;
  END IF;

  -- 4. Build the JSON quote matching SubscriptionQuote type
  v_result := jsonb_build_object(
    'total', v_units_count * v_rate,
    'units', v_units_count,
    'basis', 'units',
    'breakdown', CASE WHEN v_units_count > 0 AND v_rate > 0 THEN
      jsonb_build_array(
        jsonb_build_object(
          'label', 'Platform Units',
          'slug', 'unit',
          'qty', v_units_count,
          'price', v_rate,
          'subtotal', v_units_count * v_rate
        )
      )
    ELSE '[]'::jsonb END
  );

  RETURN v_result;
END;
$function$;
