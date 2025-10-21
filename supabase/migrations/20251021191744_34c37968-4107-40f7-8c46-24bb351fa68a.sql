-- Atualizar subscription para Pro com trial de 7 dias
UPDATE public.subscriptions
SET 
  plan_type = 'pro',
  status = 'trialing',
  trial_end = NOW() + INTERVAL '7 days',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '7 days',
  updated_at = NOW()
WHERE user_id = 'f9d956fa-ef91-4fdf-9284-ea95a0d49a42';

-- Se não existir subscription, criar uma
INSERT INTO public.subscriptions (user_id, plan_type, status, trial_end, current_period_start, current_period_end)
SELECT 
  'f9d956fa-ef91-4fdf-9284-ea95a0d49a42',
  'pro',
  'trialing',
  NOW() + INTERVAL '7 days',
  NOW(),
  NOW() + INTERVAL '7 days'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions WHERE user_id = 'f9d956fa-ef91-4fdf-9284-ea95a0d49a42'
);