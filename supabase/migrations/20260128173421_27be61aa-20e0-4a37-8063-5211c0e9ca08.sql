-- Create a function to check if user is an employer
CREATE OR REPLACE FUNCTION public.is_employer(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'employer'
  )
$$;

-- Create a function to get employer profile for a user
CREATE OR REPLACE FUNCTION public.get_employer_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.employers WHERE user_id = _user_id LIMIT 1
$$;

-- RLS policy for employers to view their own profile
CREATE POLICY "Employers can view own profile"
ON public.employers
FOR SELECT
USING (user_id = auth.uid());

-- RLS policy for employers to update their own profile
CREATE POLICY "Employers can update own profile"
ON public.employers
FOR UPDATE
USING (user_id = auth.uid());

-- Allow employers to view their own jobs
CREATE POLICY "Employers can view own jobs"
ON public.jobs
FOR SELECT
USING (
  employer_id IS NOT NULL AND 
  employer_id IN (
    SELECT id FROM public.employers WHERE user_id = auth.uid()
  )
);

-- Allow employers to create jobs linked to their employer profile
CREATE POLICY "Employers can create own jobs"
ON public.jobs
FOR INSERT
WITH CHECK (
  employer_id IS NOT NULL AND 
  employer_id IN (
    SELECT id FROM public.employers WHERE user_id = auth.uid()
  )
);

-- Allow employers to update their own jobs (only draft/pending, not active)
CREATE POLICY "Employers can update own jobs"
ON public.jobs
FOR UPDATE
USING (
  employer_id IS NOT NULL AND 
  employer_id IN (
    SELECT id FROM public.employers WHERE user_id = auth.uid()
  ) AND
  status IN ('draft', 'pending')
);