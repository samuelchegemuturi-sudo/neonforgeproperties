ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS requires_password_change boolean NOT NULL DEFAULT false;
