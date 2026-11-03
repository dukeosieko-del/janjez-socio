-- RPC functions for wallet operations

CREATE OR REPLACE FUNCTION credit_wallet(
  p_partner_id UUID,
  p_amount DECIMAL,
  p_category TEXT,
  p_reference TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS DECIMAL AS $$
DECLARE
  v_new_balance DECIMAL;
BEGIN
  UPDATE partners
  SET wallet_balance = wallet_balance + p_amount,
      updated_at = NOW()
  WHERE id = p_partner_id
  RETURNING wallet_balance INTO v_new_balance;
  
  INSERT INTO wallet_transactions (partner_id, amount, category, reference, metadata, balance_after)
  VALUES (p_partner_id, p_amount, p_category, p_reference, p_metadata, v_new_balance);
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION debit_wallet(
  p_partner_id UUID,
  p_amount DECIMAL,
  p_category TEXT,
  p_reference TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS DECIMAL AS $$
DECLARE
  v_new_balance DECIMAL;
  v_current_balance DECIMAL;
BEGIN
  SELECT wallet_balance INTO v_current_balance
  FROM partners
  WHERE id = p_partner_id
  FOR UPDATE;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  UPDATE partners
  SET wallet_balance = wallet_balance - p_amount,
      updated_at = NOW()
  WHERE id = p_partner_id
  RETURNING wallet_balance INTO v_new_balance;
  
  INSERT INTO wallet_transactions (partner_id, amount, category, reference, metadata, balance_after)
  VALUES (p_partner_id, -p_amount, p_category, p_reference, p_metadata, v_new_balance);
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION debit_child_wallet(
  p_child_user_id UUID,
  p_amount DECIMAL,
  p_order_id UUID DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
  v_new_balance DECIMAL;
  v_current_balance DECIMAL;
BEGIN
  SELECT balance INTO v_current_balance
  FROM child_users
  WHERE id = p_child_user_id
  FOR UPDATE;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  UPDATE child_users
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE id = p_child_user_id
  RETURNING balance INTO v_new_balance;
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
