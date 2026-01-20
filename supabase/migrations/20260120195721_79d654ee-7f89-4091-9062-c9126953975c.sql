-- Create employer communications table for tracking interactions
CREATE TABLE public.employer_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'phone', 'meeting', 'site_visit', 'other')),
  subject TEXT,
  notes TEXT NOT NULL,
  communication_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  follow_up_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add source_inquiry_id to employers to track which inquiry they came from
ALTER TABLE public.employers 
ADD COLUMN source_inquiry_id UUID REFERENCES public.employer_inquiries(id),
ADD COLUMN notes TEXT,
ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect'));

-- Add employer_id to employer_inquiries to link converted inquiries
ALTER TABLE public.employer_inquiries 
ADD COLUMN converted_to_employer_id UUID REFERENCES public.employers(id),
ADD COLUMN converted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN converted_by UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE public.employer_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employer_communications
CREATE POLICY "Deny anonymous access to employer_communications"
ON public.employer_communications
FOR SELECT
TO anon
USING (false);

CREATE POLICY "Staff can view all communications"
ON public.employer_communications
FOR SELECT
TO authenticated
USING (is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can create communications"
ON public.employer_communications
FOR INSERT
TO authenticated
WITH CHECK (is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update communications"
ON public.employer_communications
FOR UPDATE
TO authenticated
USING (is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can delete communications"
ON public.employer_communications
FOR DELETE
TO authenticated
USING (is_staff_or_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_employer_communications_employer_id ON public.employer_communications(employer_id);
CREATE INDEX idx_employer_communications_date ON public.employer_communications(communication_date DESC);
CREATE INDEX idx_employers_status ON public.employers(status);
CREATE INDEX idx_employer_inquiries_converted ON public.employer_inquiries(converted_to_employer_id);