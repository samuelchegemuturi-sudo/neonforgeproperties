-- Billing Engine RPCs

CREATE OR REPLACE FUNCTION calculate_subscription_amount(c_id UUID) RETURNS NUMERIC AS $$
DECLARE
    prop_count INT;
    cycle TEXT;
    months INT;
    discount NUMERIC;
    total NUMERIC;
BEGIN
    SELECT count(*) INTO prop_count FROM public.properties WHERE company_id = c_id;
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

CREATE OR REPLACE FUNCTION process_billing() RETURNS VOID AS $$
DECLARE
    sub RECORD;
    amt NUMERIC;
    due TIMESTAMP WITH TIME ZONE;
BEGIN
    FOR sub IN 
        SELECT * FROM public.platform_subscriptions 
        WHERE status IN ('active', 'trialing') 
        AND (current_period_end IS NULL OR current_period_end <= now())
    LOOP
        -- Calculate amount
        amt := calculate_subscription_amount(sub.company_id);
        
        -- Set due date to 7 days from now
        due := now() + interval '7 days';
        
        -- Create invoice if there are properties to bill
        IF amt > 0 THEN
            INSERT INTO public.platform_invoices (company_id, subscription_id, amount, status, due_date)
            VALUES (sub.company_id, sub.id, amt, 'open', due);
            
            -- Update subscription period
            UPDATE public.platform_subscriptions 
            SET current_period_start = now(),
                current_period_end = CASE 
                    WHEN billing_cycle = 'annual' THEN now() + interval '1 year'
                    WHEN billing_cycle = 'semi_annual' THEN now() + interval '6 months'
                    WHEN billing_cycle = 'quarterly' THEN now() + interval '3 months'
                    ELSE now() + interval '1 month'
                END,
                amount = amt,
                status = 'active'
            WHERE id = sub.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION lock_overdue_accounts() RETURNS VOID AS $$
BEGIN
    -- Update company activation_status to suspended if they have overdue invoices
    UPDATE public.companies 
    SET activation_status = 'suspended'
    WHERE id IN (
        SELECT company_id 
        FROM public.platform_invoices 
        WHERE status = 'open' AND due_date < now()
    ) AND activation_status = 'active';
    
    -- Update subscription status
    UPDATE public.platform_subscriptions
    SET status = 'past_due'
    WHERE company_id IN (
        SELECT company_id 
        FROM public.platform_invoices 
        WHERE status = 'open' AND due_date < now()
    ) AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule billing engine (requires pg_cron extension)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule('daily_billing_engine', '0 0 * * *', $$
  SELECT public.process_billing();
  SELECT public.lock_overdue_accounts();
$$);

-- Seed Brevo API Key
INSERT INTO public.platform_settings (key, label, category, value)
VALUES ('brevo_api_key', 'Brevo API Key (v3)', 'Email Providers', '""')
ON CONFLICT (key) DO NOTHING;
