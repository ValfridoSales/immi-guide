-- Criar subscription Pro manualmente (sem Stripe)
UPDATE public.subscriptions
SET 
  plan_type = 'pro',
  status = 'active',
  trial_end = NOW() + INTERVAL '30 days',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '30 days',
  updated_at = NOW()
WHERE user_id = 'f9d956fa-ef91-4fdf-9284-ea95a0d49a42';

-- Adicionar uma flag para indicar que é uma subscription manual
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT FALSE;

-- Marcar esta subscription como manual
UPDATE public.subscriptions
SET is_manual = TRUE
WHERE user_id = 'f9d956fa-ef91-4fdf-9284-ea95a0d49a42';

-- Criar trigger para proteger subscriptions manuais
CREATE OR REPLACE FUNCTION protect_manual_subscriptions()
RETURNS TRIGGER AS $$
BEGIN
  -- Se é uma subscription manual, não permitir que seja alterada para inactive
  IF OLD.is_manual = TRUE AND NEW.status = 'inactive' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_manual_subs_trigger
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION protect_manual_subscriptions();