-- Rollback: 20260919000007_partners_reseller_onboarding.sql
-- Reverses: adds partners.reseller_agreement_accepted + partners.branding_completed
-- Author: Kilo Extension | Date: 2026-09-24

ALTER TABLE partners DROP COLUMN IF EXISTS reseller_agreement_accepted;
ALTER TABLE partners DROP COLUMN IF EXISTS branding_completed;