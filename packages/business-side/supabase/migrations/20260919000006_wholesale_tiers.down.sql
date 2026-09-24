-- Rollback: 20260919000006_wholesale_tiers.sql
-- Reverses: wholesale_tiers table, 2 indexes, seed data, RLS, 1 policy
-- Author: Kilo Extension | Date: 2026-09-24

DROP POLICY IF EXISTS "wholesale_tiers_all" ON wholesale_tiers;
DROP INDEX IF EXISTS idx_wholesale_tiers_category;
DROP INDEX IF EXISTS idx_wholesale_tiers_quantity;
DROP TABLE IF EXISTS wholesale_tiers CASCADE;