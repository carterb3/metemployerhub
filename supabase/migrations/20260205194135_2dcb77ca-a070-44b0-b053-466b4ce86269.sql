
-- Create a function that admins can call to set up demo accounts
-- This is a one-time setup function for demo purposes
CREATE OR REPLACE FUNCTION public.setup_demo_employer(
  p_email text,
  p_company_name text DEFAULT 'Demo Employer Inc.',
  p_contact_name text DEFAULT 'Demo User'
)
RETURNS TABLE(employer_id uuid, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employer_id uuid;
BEGIN
  -- Check if caller is admin
  IF NOT is_staff_or_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can create demo accounts';
  END IF;

  -- Check if employer already exists with this email
  SELECT id INTO v_employer_id
  FROM employers
  WHERE contact_email = p_email;

  IF v_employer_id IS NOT NULL THEN
    RETURN QUERY SELECT v_employer_id, 'Demo employer already exists'::text;
    RETURN;
  END IF;

  -- Create employer record
  INSERT INTO employers (
    company_name,
    contact_name,
    contact_email,
    status,
    industry,
    is_partner
  ) VALUES (
    p_company_name,
    p_contact_name,
    p_email,
    'active',
    'Technology',
    true
  )
  RETURNING id INTO v_employer_id;

  RETURN QUERY SELECT v_employer_id, 'Demo employer created - user account must be created separately'::text;
END;
$$;
