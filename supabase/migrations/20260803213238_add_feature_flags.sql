-- Add Super Admin feature toggles to platform_settings
INSERT INTO public.platform_settings (key, label, category, value) VALUES
('feature_properties', 'Properties Module', 'Features & Modules', 'true'),
('feature_finance', 'Finance Module', 'Features & Modules', 'true'),
('feature_users', 'Users Module', 'Features & Modules', 'true'),
('feature_operations', 'Operations Module', 'Features & Modules', 'true'),
('feature_analytics', 'Analytics Dashboard', 'Features & Modules', 'false'),
('feature_listings', 'Public Listings', 'Features & Modules', 'false'),
('feature_map', 'Property Map View', 'Features & Modules', 'false')
ON CONFLICT (key) DO UPDATE SET 
  label = EXCLUDED.label,
  category = EXCLUDED.category;
