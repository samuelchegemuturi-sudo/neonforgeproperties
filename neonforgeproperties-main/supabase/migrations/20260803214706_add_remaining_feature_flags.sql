-- Add remaining Super Admin feature toggles to platform_settings
INSERT INTO public.platform_settings (key, label, category, value) VALUES
('feature_dashboard', 'Dashboard Module', 'Features & Modules', 'true'),
('feature_activation', 'Activation Module', 'Features & Modules', 'true'),
('feature_activity', 'Live Activity Log', 'Features & Modules', 'true'),
('feature_business', 'Business Module (Companies, Licences)', 'Features & Modules', 'true'),
('feature_verification', 'Verification Queue', 'Features & Modules', 'true'),
('feature_audit', 'Audit Logs', 'Features & Modules', 'true'),
('feature_system', 'System & Integrations', 'Features & Modules', 'true')
ON CONFLICT (key) DO UPDATE SET 
  label = EXCLUDED.label,
  category = EXCLUDED.category;
