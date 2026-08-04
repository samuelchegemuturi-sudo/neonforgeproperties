-- Seed basic platform settings for the Integration Marketplace

INSERT INTO public.platform_settings (key, label, category, value) VALUES
-- Payment Gateways
('pg_paystack_enabled', 'Paystack Enabled', 'Payment Gateways', 'false'),
('pg_paystack_public_key', 'Paystack Public Key', 'Payment Gateways', 'pk_test_placeholder'),
('pg_paystack_secret_key', 'Paystack Secret Key', 'Payment Gateways', 'sk_test_placeholder'),
('pg_mpesa_enabled', 'M-Pesa Enabled', 'Payment Gateways', 'false'),
('pg_mpesa_consumer_key', 'M-Pesa Consumer Key', 'Payment Gateways', 'placeholder_key'),
('pg_mpesa_consumer_secret', 'M-Pesa Consumer Secret', 'Payment Gateways', 'placeholder_secret'),
('pg_mpesa_shortcode', 'M-Pesa Shortcode', 'Payment Gateways', '174379'),
('pg_mpesa_passkey', 'M-Pesa Passkey', 'Payment Gateways', 'placeholder_passkey'),

-- Smart Meters
('sm_water_api_url', 'Smart Water API URL', 'Smart Meters', 'https://api.waterprovider.com/v1'),
('sm_water_api_key', 'Smart Water API Key', 'Smart Meters', 'placeholder_key'),
('sm_electricity_api_url', 'Smart Electricity API URL', 'Smart Meters', 'https://api.electricprovider.com/v1'),
('sm_electricity_api_key', 'Smart Electricity API Key', 'Smart Meters', 'placeholder_key'),

-- SMS Providers
('sms_provider', 'Default SMS Provider', 'SMS Providers', 'twilio'),
('sms_twilio_sid', 'Twilio Account SID', 'SMS Providers', 'AC_placeholder'),
('sms_twilio_token', 'Twilio Auth Token', 'SMS Providers', 'placeholder_token'),
('sms_africastalking_username', 'AfricasTalking Username', 'SMS Providers', 'sandbox'),
('sms_africastalking_key', 'AfricasTalking API Key', 'SMS Providers', 'placeholder_key'),

-- Email Providers
('email_provider', 'Default Email Provider', 'Email Providers', 'resend'),
('email_resend_key', 'Resend API Key', 'Email Providers', 're_placeholder'),

-- Maps
('map_google_api_key', 'Google Maps API Key', 'Maps', 'AIza_placeholder'),
('map_mapbox_token', 'Mapbox Access Token', 'Maps', 'pk_placeholder'),

-- Storage
('storage_provider', 'Default Storage Provider', 'Storage', 'supabase'),
('storage_gdrive_credentials', 'Google Drive Service Account (JSON)', 'Storage', '{}'),

-- WhatsApp
('whatsapp_api_url', 'WhatsApp API Base URL', 'WhatsApp', 'https://graph.facebook.com/v17.0'),
('whatsapp_access_token', 'WhatsApp Access Token', 'WhatsApp', 'placeholder_token'),
('whatsapp_phone_id', 'WhatsApp Phone Number ID', 'WhatsApp', 'placeholder_id')
ON CONFLICT (key) DO UPDATE SET 
  label = EXCLUDED.label,
  category = EXCLUDED.category,
  value = EXCLUDED.value;
