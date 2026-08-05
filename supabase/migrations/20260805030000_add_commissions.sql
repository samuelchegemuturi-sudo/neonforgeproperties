-- Add owner_id to properties so agencies can track who actually owns the property
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id);

-- Create a commissions table to track splits between agencies and landlords/agents
CREATE TABLE IF NOT EXISTS public.commissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    company_id uuid NOT NULL REFERENCES public.companies(id), -- The agency
    owner_id uuid REFERENCES public.profiles(id), -- The landlord (optional)
    amount_total numeric NOT NULL,
    agency_amount numeric NOT NULL,
    owner_amount numeric NOT NULL,
    commission_rate numeric NOT NULL DEFAULT 10.0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for commissions
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY commissions_company_policy ON public.commissions
    FOR ALL TO authenticated
    USING (company_id IN (
        SELECT company_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY commissions_owner_policy ON public.commissions
    FOR SELECT TO authenticated
    USING (owner_id = auth.uid());

-- Trigger to auto-calculate commission when a transaction is completed (paid)
CREATE OR REPLACE FUNCTION public.calculate_transaction_commission()
RETURNS trigger AS $$
DECLARE
    v_company_type text;
    v_owner_id uuid;
    v_commission_rate numeric := 10.0; -- Default 10%
    v_agency_amount numeric;
    v_owner_amount numeric;
BEGIN
    -- Only calculate for 'payment' types that are 'completed' or 'paid'
    -- (Assuming 'type' = 'payment' and 'status' = 'completed' or 'paid')
    IF NEW.type = 'payment' AND (NEW.status = 'completed' OR NEW.status = 'paid') THEN
        
        -- Check if the company is an agency
        SELECT company_type INTO v_company_type FROM public.companies WHERE id = NEW.company_id;
        
        IF v_company_type = 'property_management_agency' OR v_company_type = 'real_estate_company' THEN
            -- Get the owner of the property
            SELECT p.owner_id INTO v_owner_id
            FROM public.leases l
            JOIN public.units u ON u.id = l.unit_id
            JOIN public.properties p ON p.id = u.property_id
            WHERE l.id = NEW.lease_id;
            
            IF v_owner_id IS NOT NULL THEN
                -- Calculate splits
                v_agency_amount := NEW.amount * (v_commission_rate / 100.0);
                v_owner_amount := NEW.amount - v_agency_amount;
                
                -- Insert commission record
                INSERT INTO public.commissions (transaction_id, company_id, owner_id, amount_total, agency_amount, owner_amount, commission_rate)
                VALUES (NEW.id, NEW.company_id, v_owner_id, NEW.amount, v_agency_amount, v_owner_amount, v_commission_rate);
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_calculate_commission ON public.transactions;
CREATE TRIGGER tr_calculate_commission
    AFTER INSERT OR UPDATE OF status
    ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_transaction_commission();
