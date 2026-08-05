-- Add cost column to maintenance_requests to track repair expenses
ALTER TABLE public.maintenance_requests
ADD COLUMN IF NOT EXISTS cost numeric(12,2) DEFAULT 0.00;
