
DROP POLICY IF EXISTS "Anyone can insert quiz completions" ON public.quiz_completions;
CREATE POLICY "Anyone can insert quiz completions"
ON public.quiz_completions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL AND length(session_id) > 0
);
