import { createAdminClient } from "@/lib/supabase/admin";

export async function consumeResetToken(token: string): Promise<{ user_id: string } | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("password_reset_tokens")
    .select("user_id, used, expires_at")
    .eq("token", token)
    .eq("used", false)
    .gt("expires_at", now)
    .single();

  if (error || !data) return null;
  return { user_id: data.user_id };
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
