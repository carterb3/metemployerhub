-- =============================================================================
-- SECURITY FIXES
-- =============================================================================

-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- The "WITH CHECK (true)" policies are intentional for public intake forms:
-- - job_seeker_intakes: Anyone can submit intake (public form, no auth required)
-- - employer_inquiries: Anyone can submit inquiry (public form, no auth required)  
-- - employers: Anyone can register as employer (public registration)
-- - resumes storage: Anyone can upload resume with their intake

-- These are designed for unauthenticated public access as per MVP requirements.
-- The security is maintained because:
-- 1. SELECT policies restrict viewing to staff only
-- 2. UPDATE/DELETE policies restrict to staff only
-- 3. No sensitive data is exposed on INSERT