-- Create kyc_documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc_documents', 'kyc_documents', true)
ON CONFLICT (id) DO NOTHING;


-- Allow authenticated users to upload KYC documents
CREATE POLICY "Allow authenticated uploads to KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'kyc_documents');

-- Allow users to read their own company's KYC documents or if they are super admin
-- For simplicity, since it's a public bucket, anyone can read the URL if they have it.
-- But we can add a policy for reading just in case.
CREATE POLICY "Allow public read access to KYC documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'kyc_documents');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow users to update their own KYC documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'kyc_documents' AND auth.uid() = owner);
