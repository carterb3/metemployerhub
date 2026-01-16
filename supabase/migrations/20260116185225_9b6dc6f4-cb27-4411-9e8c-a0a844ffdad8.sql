-- =============================================================
-- PHASE 1: NEW ENUMS (use IF NOT EXISTS pattern via DO block)
-- =============================================================

DO $$ BEGIN
  CREATE TYPE public.job_source AS ENUM ('manual', 'imported');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.location_type AS ENUM ('onsite', 'hybrid', 'remote');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.application_method AS ENUM ('apply_url', 'apply_through_met', 'email', 'phone', 'in_person');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.pay_period AS ENUM ('hour', 'day', 'week', 'month', 'year', 'project');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.job_action AS ENUM ('create', 'update', 'status_change', 'publish', 'unpublish', 'duplicate', 'archive', 'restore');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================
-- PHASE 2: EXTEND JOBS TABLE (ADD COLUMN IF NOT EXISTS)
-- =============================================================

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS published_by uuid REFERENCES auth.users(id);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS source public.job_source NOT NULL DEFAULT 'manual';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS location_type public.location_type NOT NULL DEFAULT 'onsite';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS province text NOT NULL DEFAULT 'MB';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS application_method public.application_method NOT NULL DEFAULT 'apply_url';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS apply_email text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS apply_phone text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS apply_instructions text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pay_min numeric(12,2);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pay_max numeric(12,2);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pay_currency text NOT NULL DEFAULT 'CAD';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pay_period public.pay_period;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pay_visible boolean NOT NULL DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS published_at timestamp with time zone;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS scheduled_publish_at timestamp with time zone;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS scheduled_unpublish_at timestamp with time zone;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES auth.users(id);

-- Add unique constraint on slug
DO $$ BEGIN
  ALTER TABLE public.jobs ADD CONSTRAINT jobs_slug_unique UNIQUE (slug);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================
-- PHASE 3: TAGS SYSTEM
-- =============================================================

CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_tags (
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_job_tags_job_id ON public.job_tags(job_id);
CREATE INDEX IF NOT EXISTS idx_job_tags_tag_id ON public.job_tags(tag_id);

-- =============================================================
-- PHASE 4: AUDIT LOG TABLE
-- =============================================================

CREATE TABLE IF NOT EXISTS public.job_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  action public.job_action NOT NULL,
  actor_user_id uuid REFERENCES auth.users(id),
  before_state jsonb,
  after_state jsonb,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_activity_log_job_id ON public.job_activity_log(job_id);
CREATE INDEX IF NOT EXISTS idx_job_activity_log_actor ON public.job_activity_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_job_activity_log_created ON public.job_activity_log(created_at DESC);

-- =============================================================
-- PHASE 5: ATTACHMENTS TABLE
-- =============================================================

CREATE TABLE IF NOT EXISTS public.job_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  file_type text,
  is_public boolean NOT NULL DEFAULT false,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_attachments_job_id ON public.job_attachments(job_id);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('job-attachments', 'job-attachments', false, 10485760, ARRAY['application/pdf']::text[])
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- PHASE 6: MORE INDEXES
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_jobs_slug ON public.jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON public.jobs(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_jobs_archived ON public.jobs(archived_at) WHERE archived_at IS NULL;

-- =============================================================
-- PHASE 7: CONSTRAINTS
-- =============================================================

DO $$ BEGIN
  ALTER TABLE public.jobs ADD CONSTRAINT chk_pay_range CHECK (pay_min IS NULL OR pay_max IS NULL OR pay_min <= pay_max);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.jobs ADD CONSTRAINT chk_schedule_order CHECK (scheduled_publish_at IS NULL OR scheduled_unpublish_at IS NULL OR scheduled_publish_at < scheduled_unpublish_at);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;