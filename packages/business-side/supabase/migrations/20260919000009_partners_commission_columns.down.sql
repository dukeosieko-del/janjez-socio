-- Rollback: 20260919000009_partners_commission_columns.sql
-- Reverses: adds partners.total_commission + partners.pending_commission
-- Author: Kilo Extension | Date: 2026-09-24

ALTER TABLE partners DROP COLUMN IF EXISTS total_commission;
ALTER TABLE partners DROP COLUMN IF EXISTS pending_commission;