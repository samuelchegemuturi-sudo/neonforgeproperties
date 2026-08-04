CREATE OR REPLACE FUNCTION public.calculate_subscription(_company_id uuid, _paid_only boolean DEFAULT false)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH props AS (
    SELECT count(id)::int AS qty
    FROM public.properties
    WHERE company_id = _company_id AND verification_status = 'verified'
  )
  SELECT jsonb_build_object(
    'total', COALESCE((SELECT sum(qty * 500) FROM props), 0),
    'units', COALESCE((SELECT sum(qty) FROM props), 0),
    'basis', 'properties',
    'breakdown', COALESCE((SELECT 
      jsonb_agg(jsonb_build_object('label','Properties','slug','property','qty',qty,'price',500,'subtotal',qty*500)) 
      FROM props), '[]'::jsonb)
  );
$$;

NOTIFY pgrst, 'reload schema';

CREATE OR REPLACE FUNCTION calculate_subscription_amount(c_id UUID) RETURNS NUMERIC AS $$
DECLARE
    prop_count INT;
    cycle TEXT;
    months INT;
    discount NUMERIC;
    total NUMERIC;
BEGIN
    SELECT count(*) INTO prop_count FROM public.properties WHERE company_id = c_id AND verification_status = 'verified';
    SELECT billing_cycle INTO cycle FROM public.platform_subscriptions WHERE company_id = c_id;
    
    IF cycle = 'annual' THEN
        months := 12;
        discount := 0.50;
    ELSIF cycle = 'semi_annual' THEN
        months := 6;
        discount := 0.25;
    ELSIF cycle = 'quarterly' THEN
        months := 3;
        discount := 0.10;
    ELSE
        months := 1;
        discount := 0.00;
    END IF;
    
    total := (prop_count * 500) * months * (1 - discount);
    RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
