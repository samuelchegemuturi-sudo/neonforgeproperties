-- Add KYC fields to companies
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS kra_pin text,
ADD COLUMN IF NOT EXISTS id_document_url text,
ADD COLUMN IF NOT EXISTS profile_picture_url text;

INSERT INTO public.platform_settings (key, label, category, value) VALUES
('feature_analytics', 'Analytics Dashboard', 'Feature Flags', 'false'),
('feature_listings', 'Property Listings', 'Feature Flags', 'false'),
('feature_map', 'Map View', 'Feature Flags', 'false')
ON CONFLICT (key) DO NOTHING;

-- Create Storage Bucket for KYC
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc_documents', 'kyc_documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Super admins can access all KYC documents" ON storage.objects
FOR ALL USING (bucket_id = 'kyc_documents' AND public.is_super_admin(auth.uid()));

CREATE POLICY "Users can upload their own KYC documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'kyc_documents');

CREATE POLICY "Users can read their own KYC documents" ON storage.objects
FOR SELECT USING (bucket_id = 'kyc_documents' AND (storage.foldername(name))[1] = auth.uid()::text);
