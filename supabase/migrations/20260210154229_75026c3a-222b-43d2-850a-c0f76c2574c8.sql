DROP POLICY "Employers can update own jobs" ON public.jobs;

CREATE POLICY "Employers can update own jobs"
ON public.jobs
FOR UPDATE
USING (
  (employer_id IS NOT NULL)
  AND (employer_id IN (SELECT employers.id FROM employers WHERE employers.user_id = auth.uid()))
  AND (status = ANY (ARRAY['draft'::job_status, 'pending'::job_status, 'active'::job_status]))
);