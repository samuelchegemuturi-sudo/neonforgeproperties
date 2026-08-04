INSERT INTO storage.buckets (id, name, public) 
VALUES ('company_logos', 'company_logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to logos
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'company_logos');

-- Allow authenticated users to upload their own company logos
CREATE POLICY "Authenticated users can upload logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'company_logos' 
  );

-- Allow authenticated users to update their own company logos
CREATE POLICY "Authenticated users can update logos" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'company_logos'
  );
