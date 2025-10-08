-- Create Express Entry Draws table
CREATE TABLE public.express_entry_draws (
  id INTEGER PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('general', 'pnp', 'cec', 'category')),
  category TEXT,
  invitations INTEGER NOT NULL,
  crs_min INTEGER NOT NULL,
  tiebreak_ts TIMESTAMPTZ,
  source_url TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_ee_draws_date ON public.express_entry_draws(date DESC);
CREATE INDEX idx_ee_draws_type ON public.express_entry_draws(type);
CREATE INDEX idx_ee_draws_category ON public.express_entry_draws(category) WHERE category IS NOT NULL;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_ee_draws_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger
CREATE TRIGGER set_ee_draws_updated_at
  BEFORE UPDATE ON public.express_entry_draws
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ee_draws_updated_at();

-- Enable RLS
ALTER TABLE public.express_entry_draws ENABLE ROW LEVEL SECURITY;

-- Anyone can view draws
CREATE POLICY "Anyone can view draws"
  ON public.express_entry_draws
  FOR SELECT
  USING (true);

-- Service role can insert/update (via Edge Function)
CREATE POLICY "Service role can insert draws"
  ON public.express_entry_draws
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update draws"
  ON public.express_entry_draws
  FOR UPDATE
  USING (true);

-- Insert seed data for testing
INSERT INTO public.express_entry_draws (id, date, type, category, invitations, crs_min, source_url) VALUES
  (325, '2025-10-01T14:12:29Z', 'category', 'Healthcare occupations', 2500, 470, 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds/invitations-325.html'),
  (324, '2025-09-15T10:30:00Z', 'general', NULL, 4500, 486, 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds/invitations-324.html'),
  (323, '2025-09-01T12:00:00Z', 'category', 'French language proficiency', 3200, 436, 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds/invitations-323.html'),
  (322, '2025-08-19T15:45:00Z', 'pnp', NULL, 749, 688, 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds/invitations-322.html'),
  (321, '2025-08-05T11:20:00Z', 'category', 'STEM occupations', 1800, 491, 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds/invitations-321.html');