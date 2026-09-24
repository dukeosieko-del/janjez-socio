-- Rollback: 20260919000010_child_services_cost.sql
-- Reverses: adds child_services.cost column + index
-- Author: Kilo Extension | Date: 2026-09-24

DROP INDEX IF EXISTS idx_child_services_cost;
ALTER TABLE child_services DROP COLUMN IF EXISTS cost;