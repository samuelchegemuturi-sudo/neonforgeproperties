-- Create tenant_invoices table for rent, service charge, etc.
CREATE TABLE IF NOT EXISTS public.tenant_invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
    unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
    lease_id uuid REFERENCES public.leases(id) ON DELETE CASCADE,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    amount numeric(12,2) NOT NULL,
    description text NOT NULL,
    due_date date NOT NULL,
    status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'void')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add invoice_id to existing transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES public.tenant_invoices(id) ON DELETE SET NULL;

-- Create commissions table
CREATE TABLE IF NOT EXISTS public.commissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
    transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE,
    amount numeric(12,2) NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create disbursements table (payouts to landlords)
CREATE TABLE IF NOT EXISTS public.disbursements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
    amount numeric(12,2) NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tenant_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disbursements ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_invoices TO authenticated;
GRANT ALL ON public.tenant_invoices TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.commissions TO authenticated;
GRANT ALL ON public.commissions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.disbursements TO authenticated;
GRANT ALL ON public.disbursements TO service_role;

-- RLS Policies for tenant_invoices
CREATE POLICY tenant_invoices_company_isolation 
    ON public.tenant_invoices
    FOR ALL
    TO authenticated
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) 
        OR 
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
        OR
        -- Allow tenants to view their own invoices in the future
        tenant_id IN (SELECT id FROM public.tenants WHERE email = (auth.jwt() ->> 'email'))
    );

-- RLS Policies for commissions
CREATE POLICY commissions_company_isolation 
    ON public.commissions
    FOR ALL
    TO authenticated
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) 
        OR 
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
    );

-- RLS Policies for disbursements
CREATE POLICY disbursements_company_isolation 
    ON public.disbursements
    FOR ALL
    TO authenticated
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) 
        OR 
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
    );

-- Allow tenants to view their own transactions
CREATE POLICY transactions_tenant_isolation 
    ON public.transactions
    FOR SELECT
    TO authenticated
    USING (
        tenant_id IN (SELECT id FROM public.tenants WHERE email = (auth.jwt() ->> 'email'))
    );
