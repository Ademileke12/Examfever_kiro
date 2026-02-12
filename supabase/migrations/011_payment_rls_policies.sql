-- Enable RLS on payment_transactions if not already enabled
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_select" ON payment_transactions;

-- Allow users to view their own transactions
CREATE POLICY "payment_transactions_select"
ON payment_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own transactions
CREATE POLICY "payment_transactions_insert"
ON payment_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);
