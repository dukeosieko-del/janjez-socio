-- M-Pesa transactions table for deposits and payouts

CREATE TABLE IF NOT EXISTS mpesa_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  child_user_id UUID REFERENCES child_users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'payout', 'withdrawal')),
  amount DECIMAL(10,2) NOT NULL,
  phone_number TEXT NOT NULL,
  checkout_request_id TEXT,
  merchant_request_id TEXT,
  conversation_id TEXT,
  originator_conversation_id TEXT,
  mpesa_receipt_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  result_code INTEGER,
  result_desc TEXT,
  callback_data JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  CONSTRAINT mpesa_transactions_owner_check CHECK (
    (partner_id IS NOT NULL AND child_user_id IS NULL) OR
    (partner_id IS NULL AND child_user_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_partner ON mpesa_transactions(partner_id) WHERE partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_child ON mpesa_transactions(child_user_id) WHERE child_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_status ON mpesa_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_merchant_request ON mpesa_transactions(merchant_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_checkout_request ON mpesa_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_originator ON mpesa_transactions(originator_conversation_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_created ON mpesa_transactions(created_at);

ALTER TABLE mpesa_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mpesa_transactions_service_only" ON mpesa_transactions FOR ALL USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION update_mpesa_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mpesa_transactions_updated_at
  BEFORE UPDATE ON mpesa_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_mpesa_transactions_updated_at();
