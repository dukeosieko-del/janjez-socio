-- Rollback: 20260919000004_partners_is_admin.sql
-- Reverses: adds partners.is_admin BOOLEAN column
-- Author: Kilo Extension | Date: 2026-09-24

ALTER TABLE partners DROP COLUMN IF EXISTS is_admin;