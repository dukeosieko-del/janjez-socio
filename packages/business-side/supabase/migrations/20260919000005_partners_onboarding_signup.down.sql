-- Rollback: 20260919000005_partners_onboarding_signup.sql
-- Reverses: adds partners.onboarding_state + partners.signup_source columns
-- Author: Kilo Extension | Date: 2026-09-24

ALTER TABLE partners DROP COLUMN IF EXISTS onboarding_state;
ALTER TABLE partners DROP COLUMN IF EXISTS signup_source;