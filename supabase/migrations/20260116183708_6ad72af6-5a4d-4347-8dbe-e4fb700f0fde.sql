-- Add listing_type enum for organizing jobs by source/category
CREATE TYPE public.listing_type AS ENUM (
  'summer_employment',
  'met_positions',
  'partner_jobs',
  'training_programs'
);

-- Add listing_type column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN listing_type public.listing_type NOT NULL DEFAULT 'partner_jobs';

-- Update existing jobs based on current data
-- Summer employment (internships or titles containing "Summer")
UPDATE public.jobs 
SET listing_type = 'summer_employment' 
WHERE employment_type = 'internship' 
   OR title ILIKE '%summer%' 
   OR title ILIKE '%intern%';

-- MET positions (employment counsellors)
UPDATE public.jobs 
SET listing_type = 'met_positions' 
WHERE title ILIKE '%employment%counsellor%' 
   OR title ILIKE '%employment & training%'
   OR title ILIKE '%MET%';

-- Everything else stays as partner_jobs (the default)