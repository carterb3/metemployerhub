-- =============================================================
-- FIX RLS ON NEW TABLES
-- =============================================================

-- Tags RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
CREATE POLICY "Anyone can view tags" ON public.tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can insert tags" ON public.tags;
CREATE POLICY "Staff can insert tags" ON public.tags
  FOR INSERT WITH CHECK (public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can update tags" ON public.tags;
CREATE POLICY "Staff can update tags" ON public.tags
  FOR UPDATE USING (public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can delete tags" ON public.tags;
CREATE POLICY "Staff can delete tags" ON public.tags
  FOR DELETE USING (public.is_staff_or_admin(auth.uid()));

-- Job Tags RLS
ALTER TABLE public.job_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view job tags" ON public.job_tags;
CREATE POLICY "Anyone can view job tags" ON public.job_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can insert job tags" ON public.job_tags;
CREATE POLICY "Staff can insert job tags" ON public.job_tags
  FOR INSERT WITH CHECK (public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can delete job tags" ON public.job_tags;
CREATE POLICY "Staff can delete job tags" ON public.job_tags
  FOR DELETE USING (public.is_staff_or_admin(auth.uid()));

-- Activity Log RLS
ALTER TABLE public.job_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny anonymous access to job_activity_log" ON public.job_activity_log;
CREATE POLICY "Deny anonymous access to job_activity_log" ON public.job_activity_log
  AS RESTRICTIVE FOR SELECT USING (false);

DROP POLICY IF EXISTS "Staff can view activity log" ON public.job_activity_log;
CREATE POLICY "Staff can view activity log" ON public.job_activity_log
  FOR SELECT USING (public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can create activity log" ON public.job_activity_log;
CREATE POLICY "Staff can create activity log" ON public.job_activity_log
  FOR INSERT WITH CHECK (public.is_staff_or_admin(auth.uid()));

-- Attachments RLS
ALTER TABLE public.job_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny anonymous access to attachments" ON public.job_attachments;
CREATE POLICY "Deny anonymous access to attachments" ON public.job_attachments
  AS RESTRICTIVE FOR SELECT USING (false);

DROP POLICY IF EXISTS "Public can view public attachments of active jobs" ON public.job_attachments;
CREATE POLICY "Public can view public attachments of active jobs" ON public.job_attachments
  FOR SELECT USING (
    is_public = true 
    AND EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_attachments.job_id 
      AND jobs.status = 'active'
      AND jobs.archived_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Staff can view all attachments" ON public.job_attachments;
CREATE POLICY "Staff can view all attachments" ON public.job_attachments
  FOR SELECT USING (public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can insert attachments" ON public.job_attachments;
CREATE POLICY "Staff can insert attachments" ON public.job_attachments
  FOR INSERT WITH CHECK (public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can update attachments" ON public.job_attachments;
CREATE POLICY "Staff can update attachments" ON public.job_attachments
  FOR UPDATE USING (public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can delete attachments" ON public.job_attachments;
CREATE POLICY "Staff can delete attachments" ON public.job_attachments
  FOR DELETE USING (public.is_staff_or_admin(auth.uid()));

-- Storage policies for job-attachments bucket
DROP POLICY IF EXISTS "Staff can upload job attachments" ON storage.objects;
CREATE POLICY "Staff can upload job attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'job-attachments' 
    AND public.is_staff_or_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Staff can update job attachments" ON storage.objects;
CREATE POLICY "Staff can update job attachments" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'job-attachments' 
    AND public.is_staff_or_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Staff can delete job attachments" ON storage.objects;
CREATE POLICY "Staff can delete job attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'job-attachments' 
    AND public.is_staff_or_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Staff can view all job attachments" ON storage.objects;
CREATE POLICY "Staff can view all job attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'job-attachments' 
    AND public.is_staff_or_admin(auth.uid())
  );

-- Update existing jobs policy for public access
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
CREATE POLICY "Anyone can view active jobs" ON public.jobs
  FOR SELECT USING (
    status = 'active'
    AND archived_at IS NULL
    AND (published_at IS NOT NULL OR scheduled_publish_at IS NULL OR scheduled_publish_at <= now())
    AND (scheduled_unpublish_at IS NULL OR scheduled_unpublish_at > now())
    AND (expires_at IS NULL OR expires_at > now())
  );

-- =============================================================
-- TRIGGER FUNCTIONS
-- =============================================================

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_job_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug from title
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- If slug not provided, generate one
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM public.jobs WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_job_slug ON public.jobs;
CREATE TRIGGER trg_generate_job_slug
  BEFORE INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_job_slug();

-- Function to track job updates
CREATE OR REPLACE FUNCTION public.track_job_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  
  IF auth.uid() IS NOT NULL THEN
    NEW.updated_by := auth.uid();
  END IF;
  
  IF NEW.status = 'active' AND OLD.status != 'active' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
    NEW.published_by := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_job_update ON public.jobs;
CREATE TRIGGER trg_track_job_update
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.track_job_update();

-- Function to track job creation
CREATE OR REPLACE FUNCTION public.track_job_create()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.created_by := auth.uid();
    NEW.updated_by := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_job_create ON public.jobs;
CREATE TRIGGER trg_track_job_create
  BEFORE INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.track_job_create();

-- Function to log job activity (bypass RLS for system logging)
CREATE OR REPLACE FUNCTION public.log_job_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_type public.job_action;
  before_json jsonb;
  after_json jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_type := 'create';
    before_json := NULL;
    after_json := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      IF NEW.status = 'active' AND OLD.status != 'active' THEN
        action_type := 'publish';
      ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
        action_type := 'unpublish';
      ELSE
        action_type := 'status_change';
      END IF;
    ELSIF OLD.archived_at IS NULL AND NEW.archived_at IS NOT NULL THEN
      action_type := 'archive';
    ELSIF OLD.archived_at IS NOT NULL AND NEW.archived_at IS NULL THEN
      action_type := 'restore';
    ELSE
      action_type := 'update';
    END IF;
    
    before_json := to_jsonb(OLD);
    after_json := to_jsonb(NEW);
  END IF;
  
  INSERT INTO public.job_activity_log (job_id, action, actor_user_id, before_state, after_state)
  VALUES (COALESCE(NEW.id, OLD.id), action_type, auth.uid(), before_json, after_json);
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_job_activity ON public.jobs;
CREATE TRIGGER trg_log_job_activity
  AFTER INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.log_job_activity();

-- Status transition validation
CREATE OR REPLACE FUNCTION public.validate_job_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  is_admin_user := public.has_role(auth.uid(), 'admin');
  
  IF is_admin_user THEN
    RETURN NEW;
  END IF;
  
  IF OLD.status != NEW.status THEN
    IF OLD.status = 'draft' AND NEW.status = 'pending' THEN
      RETURN NEW;
    ELSIF OLD.status = 'pending' AND NEW.status IN ('active', 'draft') THEN
      RETURN NEW;
    ELSIF OLD.status = 'active' AND NEW.status IN ('expired', 'closed') THEN
      RETURN NEW;
    ELSIF OLD.status = 'closed' THEN
      RAISE EXCEPTION 'Cannot change status of closed jobs without admin privileges';
    ELSIF OLD.status = 'expired' AND NEW.status = 'active' THEN
      RAISE EXCEPTION 'Only admins can reactivate expired jobs';
    ELSE
      RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_job_status ON public.jobs;
CREATE TRIGGER trg_validate_job_status
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.validate_job_status_transition();

-- =============================================================
-- MIGRATE EXISTING DATA
-- =============================================================

UPDATE public.jobs 
SET application_method = 'apply_through_met'::public.application_method
WHERE apply_through_met = true AND application_method = 'apply_url';

UPDATE public.jobs 
SET published_at = posted_at
WHERE status = 'active' AND posted_at IS NOT NULL AND published_at IS NULL;