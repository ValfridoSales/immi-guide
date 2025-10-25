-- Fix RLS policies for quiz_results to work with anonymous users
-- The issue is that policies are for 'public' role but anonymous requests use 'anon' role

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Anyone can update quiz results with lead data" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can view own quiz results" ON public.quiz_results;

-- Create INSERT policy for anon and authenticated users
CREATE POLICY "Anonymous users can insert quiz results"
ON public.quiz_results
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create UPDATE policy for anon and authenticated users  
CREATE POLICY "Anonymous users can update quiz results"
ON public.quiz_results
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Create SELECT policy for authenticated users only (protects PII)
CREATE POLICY "Authenticated users can view own quiz results"
ON public.quiz_results
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    (auth.uid())::text = session_id 
    OR auth.email() = user_email
  )
);