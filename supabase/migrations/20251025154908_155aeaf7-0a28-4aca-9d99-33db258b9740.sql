-- Fix quiz_results policies to allow anonymous quiz taking and lead capture
-- while still protecting PII on SELECT

-- Ensure INSERT policy allows anonymous users
DROP POLICY IF EXISTS "Anyone can insert quiz results" ON public.quiz_results;

CREATE POLICY "Anyone can insert quiz results"
ON public.quiz_results FOR INSERT
WITH CHECK (true);

-- Add UPDATE policy to allow lead data to be added later
DROP POLICY IF EXISTS "Anyone can update quiz results with lead data" ON public.quiz_results;

CREATE POLICY "Anyone can update quiz results with lead data"
ON public.quiz_results FOR UPDATE
USING (true)
WITH CHECK (true);

-- Note: The SELECT policy requiring authentication remains in place to protect PII
-- Users can insert/update anonymously, but can only view their own results when authenticated