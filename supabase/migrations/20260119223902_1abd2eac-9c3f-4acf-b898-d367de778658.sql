-- Add storage policy to allow anyone to upload resumes (for public intake form)
-- Using a unique name since other policies may already exist
CREATE POLICY "Public can upload resumes for intake"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'resumes');