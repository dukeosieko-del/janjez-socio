-- Backfill existing orders with human-readable order_id values
-- and add a trigger to auto-generate them for new orders

-- Backfill: set order_id for any rows that are missing one
UPDATE public.orders
SET order_id = 'ORD-' || substr(replace(id::text, '-', ''), 1, 8)
WHERE order_id IS NULL OR order_id = '';

-- Trigger to auto-generate order_id on insert if not provided
DROP FUNCTION IF EXISTS public.generate_order_id();
CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_id IS NULL OR NEW.order_id = '' THEN
    NEW.order_id = 'ORD-' || upper(substr(replace(NEW.id::text, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_insert ON public.orders;
CREATE TRIGGER on_order_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_id();
