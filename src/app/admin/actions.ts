"use server";

import { logAdminAction } from "@/lib/server/auth-helpers";

export async function logDashboardOpened(params: {
  actor_id?: string;
  actor_email?: string;
}) {
  await logAdminAction({
    actor_id: params.actor_id,
    actor_email: params.actor_email,
    action: "dashboard_opened",
  });
}
