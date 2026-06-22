DROP POLICY IF EXISTS "Anyone can insert quiz results" ON public.quiz_results;

CREATE POLICY "Authenticated users can insert own quiz results"
ON public.quiz_results
FOR INSERT
TO authenticated
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) > 0
  AND results IS NOT NULL
  AND user_id = auth.uid()
  AND (user_email IS NULL OR user_email = auth.email())
);

REVOKE INSERT ON public.quiz_results FROM anon;