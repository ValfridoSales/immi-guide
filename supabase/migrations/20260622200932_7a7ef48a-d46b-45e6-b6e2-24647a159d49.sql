
-- 1) express_entry_draws: drop overly-permissive INSERT/UPDATE policies (service role bypasses RLS anyway)
DROP POLICY IF EXISTS "Service role can insert draws" ON public.express_entry_draws;
DROP POLICY IF EXISTS "Service role can update draws" ON public.express_entry_draws;

-- 2) quiz_results: drop permissive anon UPDATE; replace with authenticated-owner-only update
DROP POLICY IF EXISTS "Anonymous users can update quiz results" ON public.quiz_results;

CREATE POLICY "Authenticated users can update own quiz results"
ON public.quiz_results
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (
    (auth.uid())::text = session_id
    OR auth.uid() = user_id
    OR auth.email() = user_email
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    (auth.uid())::text = session_id
    OR auth.uid() = user_id
    OR auth.email() = user_email
  )
);

-- Tighten anon INSERT so it isn't WITH CHECK (true)
DROP POLICY IF EXISTS "Anonymous users can insert quiz results" ON public.quiz_results;
CREATE POLICY "Anonymous users can insert quiz results"
ON public.quiz_results
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) > 0
  AND results IS NOT NULL
);

-- 3) subscriptions: remove self-insert (privilege escalation). Writes go through service role / edge functions.
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;

-- 4) Lock down SECURITY DEFINER functions so they aren't callable via PostgREST by anon/authenticated.
--    Trigger functions don't need EXECUTE on user roles; trigger dispatch uses owner privileges.
REVOKE EXECUTE ON FUNCTION public.is_pro_user(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_subscription(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.count_user_pdf_reports(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_quiz_completions_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;

-- 5) Fix mutable search_path on the remaining function
CREATE OR REPLACE FUNCTION public.protect_manual_subscriptions()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF OLD.is_manual = TRUE AND NEW.status = 'inactive' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;
