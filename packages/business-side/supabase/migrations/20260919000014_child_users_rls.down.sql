-- Rollback: 20260919000014_child_users_rls.sql
-- Reverses: ENABLE ROW LEVEL SECURITY + "child_users_all" policy on child_users
-- Author: Kilo Extension | Date: 2026-09-24
--
-- NOTE: RLS remains ENABLED after this rollback (the original migration
-- 20250101000004_init_child_users.sql also enabled it). Only the policy
-- added by this migration is dropped. To fully disable RLS on child_users,
-- run: ALTER TABLE child_users DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "child_users_all" ON child_users;