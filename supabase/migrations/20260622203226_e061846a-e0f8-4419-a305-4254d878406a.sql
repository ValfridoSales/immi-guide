DROP POLICY IF EXISTS "Anyone can view quiz completion count" ON public.quiz_completions;

CREATE POLICY "Authenticated users can view quiz completions"
ON public.quiz_completions
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.quiz_completions FROM anon;