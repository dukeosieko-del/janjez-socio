-- Atomic wallet balance functions to prevent race conditions and money minting
-- debit_wallet: atomically decreases balance only if sufficient funds exist
-- credit_wallet: atomically increases balance (for M-Pesa top-ups)

CREATE OR REPLACE FUNCTION public.credit_wallet(
  p_user_id UUID,
  p_amount DECIMAL
)
RETURNS TABLE(new_balance DECIMAL)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT COALESCE(wallet_balance, 0) FROM profiles WHERE id = p_user_id;
    RETURN;
  END IF;

  UPDATE profiles
  SET wallet_balance = wallet_balance + p_amount
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 0::DECIMAL;
  ELSE
    RETURN QUERY SELECT wallet_balance FROM profiles WHERE id = p_user_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.debit_wallet(
  p_user_id UUID,
  p_amount DECIMAL
)
RETURNS TABLE(new_balance DECIMAL, success BOOLEAN)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_amount < 0 THEN
    RETURN QUERY SELECT wallet_balance, FALSE FROM profiles WHERE id = p_user_id;
    RETURN;
  END IF;

  UPDATE profiles
  SET wallet_balance = wallet_balance - p_amount
  WHERE id = p_user_id AND wallet_balance >= p_amount;

  IF NOT FOUND THEN
    RETURN QUERY SELECT wallet_balance, FALSE FROM profiles WHERE id = p_user_id;
  ELSE
    RETURN QUERY SELECT wallet_balance, TRUE FROM profiles WHERE id = p_user_id;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.credit_wallet IS 'Atomically credits a user wallet. Use for M-Pesa top-ups.';
COMMENT ON FUNCTION public.debit_wallet IS 'Atomically debits a user wallet only if sufficient balance exists. Returns success flag.';
