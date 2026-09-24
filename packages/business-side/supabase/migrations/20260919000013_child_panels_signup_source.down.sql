-- Rollback: 20260919000013_child_panels_signup_source.sql
-- Reverses: adds child_panels.signup_source column
-- Author: Kilo Extension | Date: 2026-09-24

ALTER TABLE child_panels DROP COLUMN IF EXISTS signup_source;