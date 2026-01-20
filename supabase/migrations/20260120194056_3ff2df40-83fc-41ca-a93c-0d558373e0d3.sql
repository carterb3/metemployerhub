-- Create storage bucket for employer inquiry attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('employer-inquiry-attachments', 'employer-inquiry-attachments', false, 10485760);

-- Allow anyone to upload files (public form)
CREATE POLICY "Anyone can upload inquiry attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'employer-inquiry-attachments');

-- Staff can view all attachments
CREATE POLICY "Staff can view inquiry attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'employer-inquiry-attachments' AND is_staff_or_admin(auth.uid()));

-- Staff can delete attachments
CREATE POLICY "Staff can delete inquiry attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'employer-inquiry-attachments' AND is_staff_or_admin(auth.uid()));

-- Add attachment columns to employer_inquiries table
ALTER TABLE public.employer_inquiries 
ADD COLUMN attachment_url text,
ADD COLUMN attachment_filename text;