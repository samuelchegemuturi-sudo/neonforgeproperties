-- Create maintenance_requests table
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
    unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
    reported_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text NOT NULL,
    status text NOT NULL DEFAULT 'open',
    priority text NOT NULL DEFAULT 'medium',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_requests TO authenticated;
GRANT ALL ON public.maintenance_requests TO service_role;

-- Basic RLS Policies for maintenance requests
CREATE POLICY maintenance_requests_company_isolation 
    ON public.maintenance_requests
    FOR ALL
    TO authenticated
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) 
        OR 
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
    );

-- Create transactions table (for revenue reports)
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    lease_id uuid REFERENCES public.leases(id) ON DELETE SET NULL,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
    amount numeric(12,2) NOT NULL,
    type text NOT NULL, -- e.g. 'rent_payment', 'late_fee', 'maintenance_charge'
    status text NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    payment_method text,
    description text,
    transaction_date timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

-- Basic RLS Policies for transactions
CREATE POLICY transactions_company_isolation 
    ON public.transactions
    FOR ALL
    TO authenticated
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) 
        OR 
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
    );
