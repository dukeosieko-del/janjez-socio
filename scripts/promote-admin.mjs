#!/usr/bin/env node
/**
 * Promote a user to admin by email.
 *
 * Usage:
 *   node --env-file=.env scripts/promote-admin.mjs <email>
 *
 * Or with explicit env:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/promote-admin.mjs <email>
 */

import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node --env-file=.env scripts/promote-admin.mjs <email>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("Run with: node --env-file=.env scripts/promote-admin.mjs <email>");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  const user = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(`No auth user found with email ${email}`);
    process.exit(1);
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!existing) {
    console.error(`No profile row found for user ${email} (id ${user.id})`);
    process.exit(1);
  }

  if (existing.role === "admin") {
    console.log(`User ${email} is already an admin.`);
    return;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", user.id);

  if (updateError) {
    console.error("Failed to promote:", updateError.message);
    process.exit(1);
  }

  const { error: metaError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, role: "admin" },
  });

  if (metaError) {
    console.warn(
      "Profile role updated, but failed to set user_metadata.role:",
      metaError.message
    );
  }

  console.log(`Promoted ${email} to admin (id ${user.id}).`);
  console.log("Ask the user to sign out and sign back in to see the change.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
