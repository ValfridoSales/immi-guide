-- Drop the restrictive policy that prevents users from creating subscriptions
DROP POLICY IF EXISTS "Only service role can insert subscriptions" ON subscriptions;

-- Create new policy allowing users to insert their own subscription
CREATE POLICY "Users can insert own subscription"
ON subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);