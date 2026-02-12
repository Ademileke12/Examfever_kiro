-- Enable RLS on user_subscriptions if not already enabled
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "user_subscriptions_select" ON user_subscriptions;
DROP POLICY IF EXISTS "user_subscriptions_insert" ON user_subscriptions;
DROP POLICY IF EXISTS "user_subscriptions_update" ON user_subscriptions;

-- Allow users to view their own subscription
CREATE POLICY "user_subscriptions_select"
ON user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own subscription
CREATE POLICY "user_subscriptions_insert"
ON user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own subscription
CREATE POLICY "user_subscriptions_update"
ON user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
