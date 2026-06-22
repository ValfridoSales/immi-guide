
-- SELECT: drop the session_id branch
DROP POLICY IF EXISTS "Authenticated users can view own quiz results" ON public.quiz_results;
CREATE POLICY "Authenticated users can view own quiz results"
ON public.quiz_results
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (
    auth.uid() = user_id
    OR auth.email() = user_email
  )
);

-- UPDATE: drop the session_id branch
DROP POLICY IF EXISTS "Authenticated users can update own quiz results" ON public.quiz_results;
CREATE POLICY "Authenticated users can update own quiz results"
ON public.quiz_results
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (
    auth.uid() = user_id
    OR auth.email() = user_email
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    auth.uid() = user_id
    OR auth.email() = user_email
  )
);

-- INSERT: prevent signed-in users from spoofing another user's identity
DROP POLICY IF EXISTS "Anonymous users can insert quiz results" ON public.quiz_results;
CREATE POLICY "Anyone can insert quiz results"
ON public.quiz_results
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) > 0
  AND results IS NOT NULL
  -- if authenticated, the row must belong to the caller (when those fields are set)
  AND (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid())
  AND (auth.uid() IS NULL OR user_email IS NULL OR user_email = auth.email())
);
