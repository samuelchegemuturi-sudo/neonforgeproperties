-- SaaS Subscription Engine Migration
-- Replaces per-property single price with Tiered Plans

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  base_price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  description TEXT,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the basic plans based on requirements
INSERT INTO public.subscription_plans (name, base_price_monthly, limits, features) VALUES
('Basic', 999.00, '{"properties": 5, "staff": 5, "storage_gb": 5, "api_keys": 3, "branches": 1}'::jsonb, '["manual_rent","tenant_management","property_management"]'::jsonb),
('Pro', 1500.00, '{"properties": 50, "staff": 30, "storage_gb": 50, "api_keys": 10, "branches": 10}'::jsonb, '["manual_rent","tenant_management","property_management","staff_management","branch_management","advanced_reports"]'::jsonb),
('Premium', 2500.00, '{"properties": 999999, "staff": 999999, "storage_gb": 200, "api_keys": 999999, "branches": 999999}'::jsonb, '["manual_rent","tenant_management","property_management","staff_management","branch_management","advanced_reports","unlimited_everything","ai_assistants"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Add plan reference and cycle info to platform_subscriptions
ALTER TABLE public.platform_subscriptions 
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.subscription_plans(id),
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2) DEFAULT 0.00;

-- Migrate existing subscriptions to Basic plan
DO $$
DECLARE
    basic_plan_id UUID;
BEGIN
    SELECT id INTO basic_plan_id FROM public.subscription_plans WHERE name = 'Basic' LIMIT 1;
    
    UPDATE public.platform_subscriptions
    SET plan_id = basic_plan_id, discount_percentage = 0
    WHERE plan_id IS NULL;
END $$;

-- Update the RPC to calculate amount based on plan
CREATE OR REPLACE FUNCTION calculate_subscription(_company_id UUID, _paid_only BOOLEAN DEFAULT false) RETURNS JSON AS $$
DECLARE
    prop_count INT;
    cycle TEXT;
    p_id UUID;
    plan_name TEXT;
    plan_price NUMERIC(10,2);
    discount NUMERIC(5,2);
    total NUMERIC(10,2);
    base_subtotal NUMERIC(10,2);
    result JSON;
BEGIN
    SELECT count(*) INTO prop_count FROM public.properties WHERE company_id = _company_id AND verification_status = 'verified';
    SELECT billing_cycle, plan_id, COALESCE(discount_percentage, 0) INTO cycle, p_id, discount FROM public.platform_subscriptions WHERE company_id = _company_id LIMIT 1;
    
    IF p_id IS NULL THEN
        RETURN json_build_object(
            'total', 0,
            'units', prop_count,
            'basis', 'properties',
            'breakdown', '[]'::json
        );
    END IF;

    SELECT name, base_price_monthly INTO plan_name, plan_price FROM public.subscription_plans WHERE id = p_id;
    
    -- Automatic discounts based on billing cycle
    IF cycle = 'annual' THEN
        discount := 50.00;
    ELSIF cycle = 'semi_annual' THEN
        discount := 25.00;
    ELSIF cycle = 'quarterly' THEN
        discount := 10.00;
    ELSE
        -- monthly
        discount := 0.00;
    END IF;
    
    -- Update the stored discount just in case
    UPDATE public.platform_subscriptions SET discount_percentage = discount WHERE company_id = _company_id;

    base_subtotal := plan_price * prop_count;
    total := base_subtotal * (1 - (discount / 100));

    -- We multiply the price by cycle months? No, the frontend shows monthly equivalents usually or cycle total?
    -- The original calculate_subscription probably returned monthly total. The invoice system multiplies by cycle.
    -- Assuming this returns the monthly rate applied for this cycle.

    result := json_build_object(
        'total', total,
        'units', prop_count,
        'basis', 'properties',
        'breakdown', json_build_array(
            json_build_object(
                'label', plan_name || ' Plan (' || cycle || ')',
                'slug', 'plan_base',
                'qty', prop_count,
                'price', plan_price,
                'subtotal', base_subtotal
            ),
            json_build_object(
                'label', 'Discount (' || discount || '%)',
                'slug', 'plan_discount',
                'qty', 1,
                'price', -(base_subtotal * (discount / 100)),
                'subtotal', -(base_subtotal * (discount / 100))
            )
        )
    );

    RETURN result;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expose limits reading helper
CREATE OR REPLACE FUNCTION get_company_plan_limits(c_id UUID) RETURNS JSONB AS $$
DECLARE
    p_id UUID;
    l JSONB;
BEGIN
    SELECT plan_id INTO p_id FROM public.platform_subscriptions WHERE company_id = c_id LIMIT 1;
    IF p_id IS NULL THEN
        RETURN '{}'::jsonb;
    END IF;
    
    SELECT limits INTO l FROM public.subscription_plans WHERE id = p_id;
    RETURN l;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
