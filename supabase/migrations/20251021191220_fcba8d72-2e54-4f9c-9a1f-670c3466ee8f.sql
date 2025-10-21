-- Create CRS history table
CREATE TABLE IF NOT EXISTS public.crs_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL,
  core_score INTEGER NOT NULL,
  spouse_score INTEGER NOT NULL,
  transferability_score INTEGER NOT NULL,
  additional_score INTEGER NOT NULL,
  calculation_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.crs_calculations ENABLE ROW LEVEL SECURITY;

-- Users can view their own calculations
CREATE POLICY "Users can view own calculations"
  ON public.crs_calculations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own calculations
CREATE POLICY "Users can insert own calculations"
  ON public.crs_calculations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own calculations
CREATE POLICY "Users can delete own calculations"
  ON public.crs_calculations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_crs_calculations_user_id ON public.crs_calculations(user_id);
CREATE INDEX idx_crs_calculations_created_at ON public.crs_calculations(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_crs_calculations_updated_at
  BEFORE UPDATE ON public.crs_calculations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create user alerts preferences table
CREATE TABLE IF NOT EXISTS public.user_alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  new_draws_enabled BOOLEAN DEFAULT true,
  crs_drops_enabled BOOLEAN DEFAULT true,
  target_score_enabled BOOLEAN DEFAULT false,
  weekly_digest_enabled BOOLEAN DEFAULT false,
  target_crs_score INTEGER,
  notification_email TEXT,
  notification_whatsapp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_alert_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own alert preferences"
  ON public.user_alert_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own alert preferences"
  ON public.user_alert_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own alert preferences"
  ON public.user_alert_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_alert_preferences_updated_at
  BEFORE UPDATE ON public.user_alert_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();