-- Forçar atualização da subscription para Pro
DELETE FROM public.subscriptions WHERE user_id = 'f9d956fa-ef91-4fdf-9284-ea95a0d49a42';

INSERT INTO public.subscriptions (
  user_id, 
  plan_type, 
  status, 
  trial_end, 
  current_period_start, 
  current_period_end,
  created_at,
  updated_at
) VALUES (
  'f9d956fa-ef91-4fdf-9284-ea95a0d49a42',
  'pro',
  'active',
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
);