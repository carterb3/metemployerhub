-- =============================================================================
-- MET RECRUITMENT HUB DATABASE SCHEMA
-- =============================================================================

-- 1. ENUMS
-- =============================================================================

-- Role types for staff access control
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

-- Intake status tracking
CREATE TYPE public.intake_status AS ENUM (
  'new', 
  'contacted', 
  'engaged', 
  'referred', 
  'placed', 
  'closed'
);

-- Job posting status
CREATE TYPE public.job_status AS ENUM ('draft', 'pending', 'active', 'expired', 'closed');

-- Employment types
CREATE TYPE public.employment_type AS ENUM (
  'full_time', 
  'part_time', 
  'contract', 
  'seasonal', 
  'internship',
  'remote'
);

-- Job categories
CREATE TYPE public.job_category AS ENUM (
  'administration',
  'construction_trades',
  'education',
  'healthcare',
  'hospitality',
  'information_technology',
  'manufacturing',
  'natural_resources',
  'retail_sales',
  'transportation',
  'other'
);

-- Manitoba regions
CREATE TYPE public.manitoba_region AS ENUM (
  'winnipeg',
  'southeast',
  'interlake',
  'parklands',
  'northwest',
  'the_pas',
  'thompson',
  'swan_river'
);

-- Inquiry types for employers
CREATE TYPE public.inquiry_type AS ENUM (
  'job_posting',
  'candidate_request',
  'partnership',
  'general'
);

-- Inquiry status
CREATE TYPE public.inquiry_status AS ENUM ('new', 'in_progress', 'resolved', 'closed');

-- Contact preference
CREATE TYPE public.contact_preference AS ENUM ('email', 'phone', 'text', 'any');

-- =============================================================================
-- 2. USER ROLES TABLE (separate from profiles for security)
-- =============================================================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. SECURITY HELPER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'staff')
  )
$$;

-- =============================================================================
-- 4. PROFILES TABLE
-- =============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Default role assignment
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 5. EMPLOYERS TABLE
-- =============================================================================

CREATE TABLE public.employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  industry TEXT,
  is_partner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. JOBS TABLE
-- =============================================================================

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES public.employers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  pay_range TEXT,
  region manitoba_region NOT NULL,
  city TEXT,
  is_remote BOOLEAN DEFAULT false,
  category job_category NOT NULL,
  employment_type employment_type NOT NULL,
  status job_status NOT NULL DEFAULT 'pending',
  posted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  apply_url TEXT,
  apply_through_met BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 7. JOB SEEKER INTAKES TABLE
-- =============================================================================

CREATE TABLE public.job_seeker_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Contact info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  contact_preference contact_preference NOT NULL DEFAULT 'any',
  
  -- Location
  postal_code TEXT,
  region manitoba_region NOT NULL,
  city TEXT,
  
  -- Employment info
  employment_status TEXT,
  employment_goals TEXT,
  
  -- Skills & interests
  skills TEXT[],
  interests TEXT[],
  skills_other TEXT,
  
  -- Optional support needs (clearly optional)
  has_barriers BOOLEAN DEFAULT false,
  barriers_description TEXT,
  
  -- Youth flag for routing
  is_youth BOOLEAN DEFAULT false,
  
  -- Resume
  resume_url TEXT,
  resume_filename TEXT,
  
  -- Consent
  consent_data_collection BOOLEAN NOT NULL DEFAULT false,
  consent_contact BOOLEAN NOT NULL DEFAULT false,
  
  -- Self-identification (optional)
  self_identifies_metis BOOLEAN,
  mmf_citizenship_number TEXT,
  
  -- Routing & status
  status intake_status NOT NULL DEFAULT 'new',
  is_urgent BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_seeker_intakes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 8. INTAKE NOTES TABLE (for staff)
-- =============================================================================

CREATE TABLE public.intake_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES public.job_seeker_intakes(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.intake_notes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 9. EMPLOYER INQUIRIES TABLE
-- =============================================================================

CREATE TABLE public.employer_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Company info
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  
  -- Inquiry details
  inquiry_type inquiry_type NOT NULL,
  message TEXT NOT NULL,
  
  -- For job posting inquiries
  job_title TEXT,
  job_description TEXT,
  positions_count INTEGER,
  region manitoba_region,
  employment_type employment_type,
  
  -- Status tracking
  status inquiry_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employer_inquiries ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 10. STAFF ASSIGNMENT LOG (audit trail)
-- =============================================================================

CREATE TABLE public.assignment_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES public.job_seeker_intakes(id) ON DELETE CASCADE NOT NULL,
  assigned_from UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assignment_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 11. UPDATED_AT TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employers_updated_at
  BEFORE UPDATE ON public.employers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intakes_updated_at
  BEFORE UPDATE ON public.job_seeker_intakes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON public.employer_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 12. RLS POLICIES
-- =============================================================================

-- USER ROLES policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_staff_or_admin(auth.uid()));

-- PROFILES policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_staff_or_admin(auth.uid()));

-- EMPLOYERS policies
CREATE POLICY "Anyone can create employer"
  ON public.employers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view all employers"
  ON public.employers FOR SELECT
  USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update employers"
  ON public.employers FOR UPDATE
  USING (public.is_staff_or_admin(auth.uid()));

-- JOBS policies
CREATE POLICY "Anyone can view active jobs"
  ON public.jobs FOR SELECT
  USING (status = 'active' AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Staff can view all jobs"
  ON public.jobs FOR SELECT
  USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update jobs"
  ON public.jobs FOR UPDATE
  USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can delete jobs"
  ON public.jobs FOR DELETE
  USING (public.is_staff_or_admin(auth.uid()));

-- JOB SEEKER INTAKES policies
CREATE POLICY "Anyone can submit intake"
  ON public.job_seeker_intakes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view all intakes"
  ON public.job_seeker_intakes FOR SELECT
  USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update intakes"
  ON public.job_seeker_intakes FOR UPDATE
  USING (public.is_staff_or_admin(auth.uid()));

-- INTAKE NOTES policies
CREATE POLICY "Staff can view all notes"
  ON public.intake_notes FOR SELECT
  USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can create notes"
  ON public.intake_notes FOR INSERT
  WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update own notes"
  ON public.intake_notes FOR UPDATE
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- EMPLOYER INQUIRIES policies
CREATE POLICY "Anyone can submit inquiry"
  ON public.employer_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view all inquiries"
  ON public.employer_inquiries FOR SELECT
  USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update inquiries"
  ON public.employer_inquiries FOR UPDATE
  USING (public.is_staff_or_admin(auth.uid()));

-- ASSIGNMENT LOG policies
CREATE POLICY "Staff can view assignment log"
  ON public.assignment_log FOR SELECT
  USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can create assignment log"
  ON public.assignment_log FOR INSERT
  WITH CHECK (public.is_staff_or_admin(auth.uid()));

-- =============================================================================
-- 13. STORAGE BUCKET FOR RESUMES
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes', 
  'resumes', 
  false, 
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
);

-- Storage policies
CREATE POLICY "Anyone can upload resume"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Staff can view all resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes' AND public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can delete resumes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resumes' AND public.is_staff_or_admin(auth.uid()));

-- =============================================================================
-- 14. INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_region ON public.jobs(region);
CREATE INDEX idx_jobs_category ON public.jobs(category);
CREATE INDEX idx_jobs_expires_at ON public.jobs(expires_at);
CREATE INDEX idx_intakes_status ON public.job_seeker_intakes(status);
CREATE INDEX idx_intakes_region ON public.job_seeker_intakes(region);
CREATE INDEX idx_intakes_assigned_to ON public.job_seeker_intakes(assigned_to);
CREATE INDEX idx_intakes_created_at ON public.job_seeker_intakes(created_at);
CREATE INDEX idx_inquiries_status ON public.employer_inquiries(status);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);