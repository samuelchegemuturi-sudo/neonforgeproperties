CREATE TABLE public.demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  estimated_units TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on demo_requests" ON public.demo_requests 
FOR ALL TO authenticated 
USING (
  (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Public can insert demo_requests" ON public.demo_requests 
FOR INSERT TO anon, authenticated 
WITH CHECK (true);
