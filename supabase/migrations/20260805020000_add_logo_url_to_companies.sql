ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url text;

-- Change super admin to the specified email
UPDATE public.profiles
SET is_super_admin = true
WHERE email = 'samuelchegemuturi@gmail.com';
