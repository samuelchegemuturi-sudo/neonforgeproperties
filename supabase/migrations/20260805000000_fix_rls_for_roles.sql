-- Drop old policies
DROP POLICY IF EXISTS maintenance_requests_company_isolation ON public.maintenance_requests;
DROP POLICY IF EXISTS transactions_company_isolation ON public.transactions;
DROP POLICY IF EXISTS tenant_invoices_company_isolation ON public.tenant_invoices;
DROP POLICY IF EXISTS commissions_company_isolation ON public.commissions;
DROP POLICY IF EXISTS disbursements_company_isolation ON public.disbursements;

-- Create new policies incorporating user_roles
CREATE POLICY maintenance_requests_company_isolation 
    ON public.maintenance_requests
    FOR ALL
    TO authenticated
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) 
        OR 
        company_id IN (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid())
        OR 
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
    );

CREATE POLICY transactions_company_isolation 
    ON public.transactions
    FOR ALL
    TO authenticated
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) 
        OR 
        company_id IN (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid())
        OR 
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
    );

CREATE POLICY tenant_invoices_company_isolation 
    ON public.tenant_invoices
    FOR ALL
    TO authenticated
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) 
        OR 
        company_id IN (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid())
        OR 
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
        OR
        tenant_id IN (SELECT id FROM public.tenants WHERE email = (auth.jwt() ->> 'email'))
    );

CREATE POLICY commissions_company_isolation 
    ON public.commissions
    FOR ALL
    TO authenticated
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) 
        OR 
        company_id IN (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid())
        OR 
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
    );

CREATE POLICY disbursements_company_isolation 
    ON public.disbursements
    FOR ALL
    TO authenticated
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) 
        OR 
        company_id IN (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid())
        OR 
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
    );
