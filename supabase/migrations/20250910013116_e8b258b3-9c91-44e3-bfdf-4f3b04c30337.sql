-- Create table to track quiz completions
CREATE TABLE public.quiz_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quiz_completions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert and read completions
CREATE POLICY "Anyone can insert quiz completions" 
ON public.quiz_completions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view quiz completion count" 
ON public.quiz_completions 
FOR SELECT 
USING (true);

-- Create index for better performance
CREATE INDEX idx_quiz_completions_completed_at ON public.quiz_completions(completed_at);

-- Create a function to get total quiz completions count
CREATE OR REPLACE FUNCTION public.get_quiz_completions_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.quiz_completions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;