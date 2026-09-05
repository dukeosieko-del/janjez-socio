import { NextResponse, NextRequest } from "next/server";
import { sendEmail } from "@/lib/email/mailer";
import { SUPPORT_ADDRESS, EMAIL_FORWARDING, SITE_NAME } from "@/lib/email/config";
import { getContactNotificationHtml, getContactConfirmationHtml } from "@/lib/email/templates";
import { rateLimit } from "@/lib/server/rate-limiter";
import { sanitizeString } from "@/lib/server/validation";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, 10);
    if (!rl.ok && rl.response) return rl.response;

    const body = await request.json();
    const { name, email, subject, message, department = "support" } = body as {
      name: string;
      email: string;
      subject: string;
      message: string;
      department?: string;
    };

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const sanitizedName = sanitizeString(name, 100) || name;
    const sanitizedEmail = sanitizeString(email, 254) || email;
    const sanitizedSubject = sanitizeString(subject, 200) || subject;
    const sanitizedMessage = sanitizeString(message, 5000) || message;
    const sanitizedDept = sanitizeString(department, 50) || department;

    const forwardTo = EMAIL_FORWARDING[`${sanitizedDept}@janjez.social`] || EMAIL_FORWARDING[SUPPORT_ADDRESS] || SUPPORT_ADDRESS;
    const data = { name: sanitizedName, email: sanitizedEmail, subject: sanitizedSubject, message: sanitizedMessage, department: sanitizedDept };

    let mailSent = false;
    try {
      const notifyResult = await sendEmail({
        fromName: SITE_NAME,
        to: { address: forwardTo, name: `${SITE_NAME} Team` },
        subject: `[${SITE_NAME}] ${subject}`,
        html: getContactNotificationHtml(data),
        text: [
          `New contact request from ${SITE_NAME}`,
          `Name: ${name}`,
          `Email: ${email}`,
          `Department: ${department}`,
          ``,
          `Message:`,
          message,
        ].join("\n"),
        replyTo: { address: email, name },
      });

      const confirmResult = await sendEmail({
        fromName: SITE_NAME,
        to: { address: email, name },
        subject: `We received your message — ${SITE_NAME}`,
        html: getContactConfirmationHtml(data),
        text: [
          `Hi ${name},`,
          ``,
          `We received your message. We aim to respond within a few minutes to one hour.`,
          ``,
          `Subject: ${subject}`,
          `Message:`,
          message,
          ``,
          `Questions? Email us at ${SUPPORT_ADDRESS}.`,
        ].join("\n"),
        replyTo: { address: SUPPORT_ADDRESS, name: SITE_NAME },
      });

      mailSent = notifyResult.ok && confirmResult.ok;
      if (!mailSent) {
        console.error("Contact mail delivery failed:", { notify: notifyResult.error, confirm: confirmResult.error });
      }
    } catch (mailError) {
      console.error("Mail delivery failed:", mailError);
    }

    if (!mailSent) {
      return NextResponse.json(
        {
          ok: false,
          mailSent: false,
          error: "We're having trouble sending your message right now. Please try again in a few minutes or email us directly.",
          departmentEmail: forwardTo,
          supportEmail: SUPPORT_ADDRESS,
        },
        { status: 503 }
      );
    }

    const supabase = createAdminClient();
    if (supabase) {
      try {
        await supabase.from("contact_messages").insert({
          name: sanitizedName,
          email: sanitizedEmail,
          subject: sanitizedSubject,
          message: sanitizedMessage,
          department: sanitizedDept,
          source: "contact_form",
          ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
          user_agent: request.headers.get("user-agent") || null,
        });
      } catch (dbError) {
        console.error("Contact message persistence failed:", dbError);
      }
    }

    return NextResponse.json({
      ok: true,
      mailSent,
      departmentEmail: forwardTo,
      supportEmail: SUPPORT_ADDRESS,
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
