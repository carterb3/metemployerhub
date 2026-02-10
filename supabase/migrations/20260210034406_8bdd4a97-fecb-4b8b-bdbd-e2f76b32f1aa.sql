-- Add rejection_reason column to employer_inquiries
ALTER TABLE public.employer_inquiries
ADD COLUMN rejection_reason text;
