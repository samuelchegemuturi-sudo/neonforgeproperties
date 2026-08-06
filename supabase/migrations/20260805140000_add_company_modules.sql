-- Add enabled_modules to companies to track which modules they have access to
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS enabled_modules jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Backfill default modules for existing companies based on their company_type
UPDATE public.companies
SET enabled_modules = 
  CASE 
    WHEN company_type = 'individual_landlord' THEN '["properties", "tenants", "maintenance"]'::jsonb
    WHEN company_type = 'property_management_agency' THEN '["properties", "tenants", "maintenance", "accounting", "sales", "crm", "airbnb"]'::jsonb
    WHEN company_type = 'developer' THEN '["properties", "construction", "sales", "accounting"]'::jsonb
    WHEN company_type = 'sacco' THEN '["properties", "sales", "members", "accounting"]'::jsonb
    WHEN company_type = 'bnb_host' THEN '["properties", "airbnb", "maintenance", "accounting"]'::jsonb
    ELSE '["properties", "tenants", "accounting"]'::jsonb
  END
WHERE enabled_modules = '[]'::jsonb;
