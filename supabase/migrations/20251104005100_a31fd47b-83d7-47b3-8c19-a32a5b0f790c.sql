-- Add user_id column to quiz_results table
ALTER TABLE quiz_results ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);

-- Enable Row Level Security
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Policy: Pro users can view their own quiz results
CREATE POLICY "Pro users can view own quiz results"
  ON quiz_results FOR SELECT
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE user_id = auth.uid()
      AND status IN ('active', 'trialing')
    )
  );

-- Policy: Pro users can insert their own quiz results
CREATE POLICY "Pro users can insert own quiz results"
  ON quiz_results FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE user_id = auth.uid()
      AND status IN ('active', 'trialing')
    )
  );

-- Policy: Pro users can delete their own quiz results
CREATE POLICY "Pro users can delete own quiz results"
  ON quiz_results FOR DELETE
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE user_id = auth.uid()
      AND status IN ('active', 'trialing')
    )
  );