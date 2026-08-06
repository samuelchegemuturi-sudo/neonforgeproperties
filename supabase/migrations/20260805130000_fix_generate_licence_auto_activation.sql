-- Fix generate_licence to NOT automatically activate the company or insert subscriptions
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

  -- Removed the automatic subscription insertion and activation_status updates
  -- This forces the user to complete the activation flow via Paystack and activateTrialSubscriptionFn.

  RETURN new_code;
END; $$;
