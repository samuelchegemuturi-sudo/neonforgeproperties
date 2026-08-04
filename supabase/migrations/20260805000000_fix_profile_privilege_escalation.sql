-- Security Remediation: Prevent IDOR / Privilege Escalation on Profiles
-- A malicious user could previously execute an UPDATE on their own profile
-- to set is_super_admin = true, bypassing all platform RLS policies.

CREATE OR REPLACE FUNCTION public.prevent_profile_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow super admins to do anything (or the service role which bypasses RLS/triggers via bypassing session, but just in case, we check is_super_admin)
    IF auth.role() = 'service_role' THEN
        RETURN NEW;
    END IF;

    -- If the user making the change is NOT a super admin
    IF NOT public.is_super_admin(auth.uid()) THEN
        
        -- Prevent modification of is_super_admin
        IF NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: Unauthorized attempt to modify is_super_admin';
        END IF;

        -- Prevent modification of company_id (users cannot move themselves to another company)
        IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: Unauthorized attempt to modify company_id';
        END IF;

        -- Prevent modification of status (only admins/system can suspend or activate users)
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: Unauthorized attempt to modify status';
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the profiles table
DROP TRIGGER IF EXISTS enforce_profile_security ON public.profiles;
CREATE TRIGGER enforce_profile_security
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_profile_escalation();
