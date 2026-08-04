-- Tenant Data Retention Cron Job

CREATE OR REPLACE FUNCTION public.delete_old_tenants() RETURNS VOID AS $$
BEGIN
    -- Delete tenants whose leases have ALL ended/terminated more than 3 days ago
    DELETE FROM public.tenants
    WHERE id IN (
        SELECT t.id
        FROM public.tenants t
        JOIN public.leases l ON t.id = l.tenant_id
        GROUP BY t.id
        HAVING 
            bool_and(l.status IN ('ended', 'past', 'terminated')) AND
            max(l.end_date) < now() - interval '3 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule data retention engine (requires pg_cron extension)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule('daily_data_retention', '0 1 * * *', $$
  SELECT public.delete_old_tenants();
$$);

-- Seed Google Drive Token
INSERT INTO public.platform_settings (key, label, category, value)
VALUES ('google_drive_token', 'Google Drive OAuth/Service Token', 'Storage', '""')
ON CONFLICT (key) DO NOTHING;
