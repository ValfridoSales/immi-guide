-- Add manual PRO subscription for asal.soleiman@gmail.com
INSERT INTO public.subscriptions (
  user_id,
  status,
  plan_type,
  is_manual,
  current_period_start,
  current_period_end
) VALUES (
  '1e18e9d7-a3c6-4af1-a03e-a0a48d850f45',
  'active',
  'pro',
  true,
  now(),
  '2099-12-31'::timestamp with time zone
);