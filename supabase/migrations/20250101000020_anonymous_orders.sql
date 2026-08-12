-- Support anonymous orders: allow NULL user_id on orders and wallet_transactions, add phone_number and order linkage

-- 1. orders: make user_id nullable, add phone_number and anonymous flag
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS anonymous BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. wallet_transactions: make user_id nullable for anonymous order payments,
--    add related_order_id and phone_number columns
ALTER TABLE public.wallet_transactions ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.wallet_transactions
  ADD COLUMN IF NOT EXISTS related_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS phone_number TEXT;

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_order ON public.wallet_transactions(related_order_id) WHERE related_order_id IS NOT NULL;

-- 3. Extend type CHECK constraint to support anonymous order_payment type
ALTER TABLE public.wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_type_check;
ALTER TABLE public.wallet_transactions
  ADD CONSTRAINT wallet_transactions_type_check
  CHECK (type IN ('topup', 'spend', 'refund', 'bonus', 'adjustment', 'order_payment'));

-- 4. Add service_role policies for anonymous operations
DROP POLICY IF EXISTS "Service role can insert anonymous transactions" ON public.wallet_transactions;
CREATE POLICY "Service role can manage anonymous transactions" ON public.wallet_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert anonymous orders" ON public.orders;
CREATE POLICY "Service role can manage anonymous orders" ON public.orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Anonymous order lookup function by phone + order_id
CREATE OR REPLACE FUNCTION public.get_anonymous_order(p_order_id UUID, p_phone TEXT)
RETURNS TABLE (
  id UUID,
  order_id TEXT,
  service_name TEXT,
  link TEXT,
  quantity INTEGER,
  amount DECIMAL(10, 2),
  payment_status TEXT,
  fulfillment_status TEXT,
  provider_order_id TEXT,
  status TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  provider_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id, o.order_id, o.service_name, o.link, o.quantity, o.amount,
    o.payment_status, o.fulfillment_status, o.provider_order_id,
    o.status, o.phone_number, o.created_at, o.provider_status
  FROM public.orders o
  WHERE o.id = p_order_id
    AND (o.phone_number = p_phone OR o.user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Index for anonymous order lookups by phone
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone_number) WHERE phone_number IS NOT NULL;
