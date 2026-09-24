-- Rollback: 20260919000015_child_panels_rls.sql
-- Reverses: ENABLE ROW LEVEL SECURITY + "child_panels_all" policy on child_panels
-- Author: Kilo Extension | Date: 2026-09-24
--
-- NOTE: RLS remains ENABLED after this rollback (the original migration
-- 20250101000002_init_child_panels.sql also enabled it). Only the policy
-- added by this migration is dropped. To fully disable RLS on child_panels,
-- run: ALTER TABLE child_panels DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "child_panels_all" ON child_panels;