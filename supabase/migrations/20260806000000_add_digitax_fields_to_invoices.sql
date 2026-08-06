-- ============================================================
-- MAKAO: DigiTax / eTIMS fields for compliant tax invoicing
-- + Manual payment reconciliation (M-Pesa / bank reference)
-- ============================================================

-- 1. Extend tenant_invoices with DigiTax and reconciliation fields
ALTER TABLE public.tenant_invoices
  ADD COLUMN IF NOT EXISTS buyer_pin            TEXT,           -- Tenant KRA PIN for eTIMS
  ADD COLUMN IF NOT EXISTS tax_rate             NUMERIC(5,2)    NOT NULL DEFAULT 16.0,
  ADD COLUMN IF NOT EXISTS tax_amount           NUMERIC(12,2),  -- Computed VAT amount
  ADD COLUMN IF NOT EXISTS line_items           JSONB           NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS invoice_number       TEXT,           -- e.g. INV-2026-00001
  ADD COLUMN IF NOT EXISTS notes                TEXT,           -- Internal notes
  ADD COLUMN IF NOT EXISTS payment_reference    TEXT,           -- M-Pesa code or bank ref
  ADD COLUMN IF NOT EXISTS paid_at              TIMESTAMPTZ,    -- When payment was logged
  ADD COLUMN IF NOT EXISTS digitax_control_number TEXT,         -- KRA eTIMS Control Number (CU Serial)
  ADD COLUMN IF NOT EXISTS digitax_qr_code_url    TEXT,         -- eTIMS verifiable QR code URL
  ADD COLUMN IF NOT EXISTS digitax_invoice_number TEXT,         -- DigiTax-assigned invoice ref
  ADD COLUMN IF NOT EXISTS digitax_fiscalized_at  TIMESTAMPTZ, -- Timestamp of successful fiscalization
  ADD COLUMN IF NOT EXISTS digitax_status         TEXT         NOT NULL DEFAULT 'pending'
    CHECK (digitax_status IN ('pending', 'submitted', 'fiscalized', 'failed'));

-- 2. Add unique constraint on invoice_number (ignore if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tenant_invoices_invoice_number_key'
  ) THEN
    ALTER TABLE public.tenant_invoices ADD CONSTRAINT tenant_invoices_invoice_number_key UNIQUE (invoice_number);
  END IF;
END $$;

-- 3. Sequence for auto-generating invoice numbers
CREATE SEQUENCE IF NOT EXISTS public.tenant_invoice_seq START 1;

-- 4. Function to set invoice_number on insert
CREATE OR REPLACE FUNCTION public.set_tenant_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                          LPAD(nextval('public.tenant_invoice_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_set_tenant_invoice_number ON public.tenant_invoices;
CREATE TRIGGER tr_set_tenant_invoice_number
  BEFORE INSERT ON public.tenant_invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_invoice_number();

-- 5. Grant sequence usage to authenticated users
GRANT USAGE ON SEQUENCE public.tenant_invoice_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.tenant_invoice_seq TO service_role;

-- 6. Seed DigiTax config keys into platform_settings (safe – ON CONFLICT DO NOTHING)
INSERT INTO public.platform_settings (key, value, label, category, description)
VALUES
  ('digitax_api_url',    '""', 'DigiTax API URL',    'Tax Services', 'Base URL for the DigiTax / eTIMS API endpoint (e.g. https://api.digitax.co.ke/v1)'),
  ('digitax_api_key',    '""', 'DigiTax API Key',    'Tax Services', 'Secret API key for DigiTax / eTIMS authentication'),
  ('digitax_seller_pin', '""', 'Seller KRA PIN',     'Tax Services', 'Your company KRA PIN registered with eTIMS for invoice fiscalization')
ON CONFLICT (key) DO NOTHING;

-- 7. Seed Paystack plan code keys per billing tier (Tax Services → Payment Gateways)
INSERT INTO public.platform_settings (key, value, label, category, description)
VALUES
  ('paystack_plan_agency',    '""', 'Paystack Plan — Agency (KES 2,500/mo)',    'Payment Gateways', 'Paystack recurring plan code for Agency billing tier'),
  ('paystack_plan_landlord',  '""', 'Paystack Plan — Landlord (KES 500/mo)',    'Payment Gateways', 'Paystack recurring plan code for Landlord billing tier'),
  ('paystack_plan_bnb_host',  '""', 'Paystack Plan — BnB Host (KES 1,200/mo)', 'Payment Gateways', 'Paystack recurring plan code for BnB Host billing tier'),
  ('paystack_plan_agent',     '""', 'Paystack Plan — Agent (KES 1,500/mo)',     'Payment Gateways', 'Paystack recurring plan code for Agent billing tier'),
  ('paystack_plan_developer', '""', 'Paystack Plan — Developer (KES 10,000/mo)','Payment Gateways', 'Paystack recurring plan code for Developer billing tier')
ON CONFLICT (key) DO NOTHING;
