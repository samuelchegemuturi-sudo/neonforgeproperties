UPDATE public.profiles
SET is_super_admin = true,
    status = 'active',
    updated_at = now()
WHERE email = 'admin@neonforgecreation.co.ke';
