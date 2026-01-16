-- =============================================================================
-- SECURITY FIX: Explicitly deny anonymous access to sensitive tables
-- =============================================================================

-- Deny anonymous SELECT on profiles table
CREATE POLICY "Deny anonymous access to profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (false);

-- Deny anonymous SELECT on job_seeker_intakes table  
CREATE POLICY "Deny anonymous access to job_seeker_intakes"
  ON public.job_seeker_intakes FOR SELECT
  TO anon
  USING (false);

-- Deny anonymous SELECT on employer_inquiries table
CREATE POLICY "Deny anonymous access to employer_inquiries"
  ON public.employer_inquiries FOR SELECT
  TO anon
  USING (false);

-- Deny anonymous SELECT on employers table
CREATE POLICY "Deny anonymous access to employers"
  ON public.employers FOR SELECT
  TO anon
  USING (false);

-- Deny anonymous SELECT on intake_notes table
CREATE POLICY "Deny anonymous access to intake_notes"
  ON public.intake_notes FOR SELECT
  TO anon
  USING (false);

-- Deny anonymous SELECT on assignment_log table
CREATE POLICY "Deny anonymous access to assignment_log"
  ON public.assignment_log FOR SELECT
  TO anon
  USING (false);

-- Deny anonymous SELECT on user_roles table
CREATE POLICY "Deny anonymous access to user_roles"
  ON public.user_roles FOR SELECT
  TO anon
  USING (false);