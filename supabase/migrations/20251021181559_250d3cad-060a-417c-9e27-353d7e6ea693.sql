-- =============================================
-- FASE 1: ESTRUTURA DE BANCO DE DADOS COMPLETA
-- Sistema Premium com Autenticação e Pagamentos
-- =============================================

-- 1. TABELA PROFILES
-- Armazena informações do perfil do usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  whatsapp TEXT,
  location TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Trigger para criar profile automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. TABELA SUBSCRIPTIONS
-- Gerencia assinaturas e status premium
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive', -- active, canceled, past_due, trialing, inactive
  plan_type TEXT NOT NULL DEFAULT 'free', -- free, pro
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies para subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. TABELA CRS_HISTORY (Feature Premium)
-- Armazena histórico de cálculos CRS do usuário
CREATE TABLE IF NOT EXISTS public.crs_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  crs_score INTEGER NOT NULL,
  calculation_data JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies para crs_history
ALTER TABLE public.crs_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own CRS history"
  ON public.crs_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CRS history"
  ON public.crs_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CRS history"
  ON public.crs_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own CRS history"
  ON public.crs_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_crs_history_user_id ON public.crs_history(user_id);
CREATE INDEX IF NOT EXISTS idx_crs_history_created_at ON public.crs_history(created_at DESC);

-- 4. TABELA CRS_SIMULATIONS (Feature Premium)
-- Armazena simulações de cenários "e se..."
CREATE TABLE IF NOT EXISTS public.crs_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  base_crs_score INTEGER NOT NULL,
  simulation_type TEXT NOT NULL, -- 'improve_language', 'study', 'marriage', 'work_experience', 'custom'
  simulation_name TEXT NOT NULL,
  changes JSONB NOT NULL,
  projected_crs_score INTEGER NOT NULL,
  score_difference INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies para crs_simulations
ALTER TABLE public.crs_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own simulations"
  ON public.crs_simulations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
  ON public.crs_simulations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON public.crs_simulations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_crs_simulations_user_id ON public.crs_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_crs_simulations_created_at ON public.crs_simulations(created_at DESC);

-- 5. TABELA DRAW_ALERTS (Feature Premium)
-- Configuração de alertas automáticos de draws
CREATE TABLE IF NOT EXISTS public.draw_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  min_crs_threshold INTEGER,
  draw_types TEXT[],
  email_notifications BOOLEAN DEFAULT TRUE,
  whatsapp_notifications BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies para draw_alerts
ALTER TABLE public.draw_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts"
  ON public.draw_alerts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_draw_alerts_user_id ON public.draw_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_draw_alerts_active ON public.draw_alerts(is_active) WHERE is_active = TRUE;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS draw_alerts_updated_at ON public.draw_alerts;
CREATE TRIGGER draw_alerts_updated_at
  BEFORE UPDATE ON public.draw_alerts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. TABELA PDF_REPORTS (Feature Premium)
-- Rastreamento de relatórios PDF gerados
CREATE TABLE IF NOT EXISTS public.pdf_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL, -- 'quiz_results', 'crs_analysis', 'full_profile'
  report_data JSONB NOT NULL,
  pdf_url TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_free_trial BOOLEAN DEFAULT FALSE
);

-- RLS Policies para pdf_reports
ALTER TABLE public.pdf_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON public.pdf_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.pdf_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pdf_reports_user_id ON public.pdf_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_reports_generated_at ON public.pdf_reports(generated_at DESC);

-- 7. FUNÇÃO HELPER: is_pro_user()
-- Verifica se usuário tem assinatura Pro ativa
CREATE OR REPLACE FUNCTION public.is_pro_user(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = user_uuid
    AND status IN ('active', 'trialing')
    AND plan_type = 'pro'
  );
$$;

-- 8. FUNÇÃO HELPER: get_user_subscription()
-- Retorna dados da assinatura do usuário
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  plan_type TEXT,
  status TEXT,
  trial_end TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    plan_type,
    status,
    trial_end,
    current_period_end,
    cancel_at_period_end
  FROM public.subscriptions
  WHERE user_id = user_uuid;
$$;

-- 9. FUNÇÃO: count_user_pdf_reports()
-- Conta quantos relatórios PDF não-trial o usuário já gerou
CREATE OR REPLACE FUNCTION public.count_user_pdf_reports(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.pdf_reports
  WHERE user_id = user_uuid
  AND is_free_trial = FALSE;
$$;

-- 10. VIEW: user_stats
-- Estatísticas agregadas do usuário para o dashboard
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  p.id AS user_id,
  p.email,
  p.full_name,
  s.plan_type,
  s.status AS subscription_status,
  (SELECT COUNT(*) FROM public.crs_history WHERE user_id = p.id) AS crs_calculations_count,
  (SELECT COUNT(*) FROM public.crs_simulations WHERE user_id = p.id) AS simulations_count,
  (SELECT COUNT(*) FROM public.pdf_reports WHERE user_id = p.id) AS reports_count,
  (SELECT crs_score FROM public.crs_history WHERE user_id = p.id ORDER BY created_at DESC LIMIT 1) AS latest_crs_score,
  (SELECT created_at FROM public.crs_history WHERE user_id = p.id ORDER BY created_at DESC LIMIT 1) AS latest_crs_date
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.user_id = p.id;

-- RLS para user_stats view
ALTER VIEW public.user_stats SET (security_invoker = on);

-- Garantir que tabela express_entry_draws existe (já deve existir)
-- Apenas adicionando índice se não existir
CREATE INDEX IF NOT EXISTS idx_express_entry_draws_date ON public.express_entry_draws(date DESC);