import { createAdminClient } from "@/lib/supabase/admin";

export async function consumeResetToken(token: string): Promise<{ user_id: string } | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const result = await supabase
    .from("password_reset_tokens")
    .update({ used: true })
    .eq("token", token)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .select("user_id")
    .single();

  if (result.error || !result.data) return null;
  return { user_id: result.data.user_id as string };
}

export async function markTokenUsed(token: string): Promise<boolean> {
  const supabase = createAdminClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("password_reset_tokens")
    .update({ used: true })
    .eq("token", token);

  return !error;
}

export async function setPassword(userId: string, password: string): Promise<boolean> {
  const supabase = createAdminClient();
  if (!supabase) return false;

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password,
  });

  return !error;
}
