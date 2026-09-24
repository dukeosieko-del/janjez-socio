-- Rollback: 20260919000012_child_panels_name.sql
-- Reverses: adds child_panels.name column + index
-- Author: Kilo Extension | Date: 2026-09-24

DROP INDEX IF EXISTS idx_child_panels_name;
ALTER TABLE child_panels DROP COLUMN IF EXISTS name;