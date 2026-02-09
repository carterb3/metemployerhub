-- Add business_type column to employers table
ALTER TABLE public.employers
ADD COLUMN business_type text NULL;

-- Also add to employer_inquiries so it's captured on the public form
ALTER TABLE public.employer_inquiries
ADD COLUMN business_type text NULL;