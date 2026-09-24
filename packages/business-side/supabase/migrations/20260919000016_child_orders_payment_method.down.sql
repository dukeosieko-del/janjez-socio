-- Rollback: 20260919000016_child_orders_payment_method.sql
-- Reverses: CHECK constraint on child_orders.payment_method
-- Author: Kilo Extension | Date: 2026-09-24

ALTER TABLE child_orders DROP CONSTRAINT IF EXISTS child_orders_payment_method_check;