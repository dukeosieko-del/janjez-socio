-- Rollback: 20260919000001_affiliate_payouts.sql
-- Reverses: creates affiliate_payouts table for payout tracking
-- Author: Kilo Extension | Date: 2026-09-24

DROP POLICY IF EXISTS "affiliate_payouts_own_read" ON affiliate_payouts;
DROP TABLE IF EXISTS affiliate_payouts CASCADE;