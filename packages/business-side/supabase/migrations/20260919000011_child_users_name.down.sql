-- Rollback: 20260919000011_child_users_name.sql
-- Reverses: adds child_users.name column + index
-- Author: Kilo Extension | Date: 2026-09-24

DROP INDEX IF EXISTS idx_child_users_name;
ALTER TABLE child_users DROP COLUMN IF EXISTS name;