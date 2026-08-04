-- Update generate_licence to also insert a 30-day trialing subscription
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

  -- Create a 30-day trial subscription
  INSERT INTO public.platform_subscriptions (company_id, status, billing_cycle, current_period_start, current_period_end)
  VALUES (_company_id, 'trialing', 'monthly', now(), now() + interval '30 days')
  ON CONFLICT DO NOTHING;

  UPDATE public.companies SET activation_status = 'active', status = 'active' WHERE id = _company_id;
  UPDATE public.properties SET status = 'active' WHERE company_id = _company_id AND status = 'inactive';

  RETURN new_code;
END; $$;
