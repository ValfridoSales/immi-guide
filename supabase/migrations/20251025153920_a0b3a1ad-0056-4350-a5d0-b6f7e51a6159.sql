-- Fix quiz_results RLS policy to protect user PII
DROP POLICY IF EXISTS "Quiz results are publicly viewable by result ID" ON public.quiz_results;

-- Allow authenticated users to view their own quiz results
CREATE POLICY "Users can view own quiz results"
ON public.quiz_results FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid()::text = session_id OR 
    auth.email() = user_email
  )
);

-- Add explicit subscription modification policies
CREATE POLICY "Only service role can insert subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (false);

CREATE POLICY "Only service role can update subscriptions"
ON public.subscriptions FOR UPDATE
USING (false);

CREATE POLICY "Only service role can delete subscriptions"
ON public.subscriptions FOR DELETE
USING (false);