-- Add MIME type restrictions to employer-inquiry-attachments bucket
-- This prevents arbitrary file uploads and restricts to common document types
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]
WHERE id = 'employer-inquiry-attachments';