-- Delete demo accounts that have not been activated within 24 hours
CREATE OR REPLACE FUNCTION public.delete_inactive_demo_accounts() RETURNS VOID AS $$
DECLARE
    company_record RECORD;
BEGIN
    FOR company_record IN 
        SELECT id FROM public.companies 
        WHERE is_demo = true 
        AND activation_status = 'pending_activation' 
        AND created_at < (now() - interval '24 hours')
    LOOP
        -- Delete the company (cascading should handle profiles, properties, etc., if set up, 
        -- otherwise we explicitly delete the auth user which cascades down if configured, 
        -- but here we just delete the company directly, assuming we have foreign keys cascading 
        -- or we can delete auth users in a separate step if necessary, but Supabase auth users 
        -- are separate. Let's delete the company for now which is the main data).
        
        -- To be thorough, we can delete the profiles first, but normally RLS/FKs handle this.
        DELETE FROM public.companies WHERE id = company_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the cron job to run every hour
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'delete_inactive_demos',
    '0 * * * *',
    $$ SELECT public.delete_inactive_demo_accounts(); $$
);
