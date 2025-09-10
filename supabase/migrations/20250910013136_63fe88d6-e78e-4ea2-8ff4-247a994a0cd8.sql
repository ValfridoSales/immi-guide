-- Fix the security warning by setting search_path for the function
CREATE OR REPLACE FUNCTION public.get_quiz_completions_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.quiz_completions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;