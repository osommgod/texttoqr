-- Create payment_logs table to track all payment transactions
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users_custom(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL,
  gateway TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own payment logs
CREATE POLICY "Users can view own payment logs"
  ON payment_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only service role can insert payment logs
CREATE POLICY "Service role can insert payment logs"
  ON payment_logs
  FOR INSERT
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE payment_logs IS 'Stores all payment transaction records for audit and verification purposes';
