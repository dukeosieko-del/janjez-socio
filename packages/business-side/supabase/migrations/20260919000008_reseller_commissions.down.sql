-- Rollback: 20260919000008_reseller_commissions.sql
-- Reverses: reseller_commissions table, 2 indexes, RLS, 1 policy
-- Author: Kilo Extension | Date: 2026-09-24

DROP POLICY IF EXISTS "reseller_commissions_all" ON reseller_commissions;
DROP INDEX IF EXISTS idx_reseller_commissions_reseller;
DROP INDEX IF EXISTS idx_reseller_commissions_order;
DROP TABLE IF EXISTS reseller_commissions CASCADE;