-- Allow staff/admin to delete employers
CREATE POLICY "Staff can delete employers"
ON public.employers
FOR DELETE
USING (is_staff_or_admin(auth.uid()));