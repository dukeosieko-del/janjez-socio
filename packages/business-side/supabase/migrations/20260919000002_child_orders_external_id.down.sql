-- Rollback: 20260919000002_child_orders_external_id.sql
-- Reverses: adds external_order_id column + index on child_orders
-- Author: Kilo Extension | Date: 2026-09-24

DROP INDEX IF EXISTS idx_child_orders_external;
ALTER TABLE child_orders DROP COLUMN IF EXISTS external_order_id;