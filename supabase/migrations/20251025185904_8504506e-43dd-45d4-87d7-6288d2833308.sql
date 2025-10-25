
-- Grant necessary permissions to anon and authenticated roles for quiz_results table
GRANT INSERT, UPDATE, SELECT ON public.quiz_results TO anon, authenticated;
