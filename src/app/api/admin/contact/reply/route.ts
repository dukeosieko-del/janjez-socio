import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { sendEmail } from "@/lib/email/mailer";
import { SUPPORT_ADDRESS, SITE_NAME } from "@/lib/email/config";
import { getContactReplyHtml, getContactConfirmationHtml } from "@/lib/email/templates";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, replyText } = body as { id: string; replyText: string };

    if (!id || !replyText || !replyText.trim()) {
      return NextResponse.json({ error: "Message ID and reply text are required" }, { status: 400 });
    }

    const { data: message, error: fetchError } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("contact_messages")
      .update({
        reply_text: replyText.trim(),
        replied_at: new Date().toISOString(),
        replied_by: auth.id,
        status: "resolved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, reply_text, replied_at, status")
      .single();

    if (updateError || !updated) {
      console.error("Contact reply update error:", updateError?.message);
      return NextResponse.json({ error: "Failed to save reply" }, { status: 500 });
    }

    if (message.email) {
      const replyData = {
        name: message.name,
        email: message.email,
        subject: `Re: ${message.subject}`,
        message: replyText.trim(),
        originalMessage: message.message,
        department: message.department,
      };

      sendEmail({
        fromName: SITE_NAME,
        to: { address: message.email, name: message.name },
        subject: `Re: ${message.subject}`,
        html: getContactReplyHtml(replyData),
        text: [
          `Hi ${message.name},`,
          ``,
          `We replied to your message:`,
          ``,
          `--- Original Message ---`,
          `Subject: ${message.subject}`,
          `Message: ${message.message}`,
          ``,
          `--- Our Reply ---`,
          replyText.trim(),
          ``,
          `Questions? Reply to this email or contact us at ${SUPPORT_ADDRESS}.`,
        ].join("\n"),
        replyTo: { address: SUPPORT_ADDRESS, name: SITE_NAME },
      }).catch((mailError) => {
        console.error("Contact reply mail delivery failed:", mailError);
      });
    }

    return NextResponse.json({ ok: true, message: updated });
  } catch (error) {
    console.error("Contact reply POST error:", error);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
