import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email/transport";
import { SUPPORT_ADDRESS, EMAIL_FORWARDING, SITE_NAME } from "@/lib/email/config";
import { getContactNotificationHtml, getContactConfirmationHtml } from "@/lib/email/templates";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
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

    const forwardTo = EMAIL_FORWARDING[`${department}@janjez.social`] || EMAIL_FORWARDING[SUPPORT_ADDRESS] || SUPPORT_ADDRESS;

    const data = { name, email, subject, message, department };

    await sendMail({
      from: {
        address: SITE_NAME === "janjez.social" ? "noreply@janjez.social" : `noreply@${String(SITE_NAME).toLowerCase()}`,
        name: SITE_NAME,
      },
      to: [
        { email_address: { address: forwardTo, name: `${SITE_NAME} Team` } },
      ],
      replyTo: [{ address: email, name }],
      subject: `[${SITE_NAME}] ${subject}`,
      htmlbody: getContactNotificationHtml(data),
      textbody: [
        `New contact request from ${SITE_NAME}`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Department: ${department}`,
        `Subject: ${subject}`,
        ``,
        `Message:`,
        message,
      ].join("\n"),
      clientReference: `contact-${department}-${Date.now()}`,
    });

    await sendMail({
      from: {
        address: SITE_NAME === "janjez.social" ? "noreply@janjez.social" : `noreply@${String(SITE_NAME).toLowerCase()}`,
        name: SITE_NAME,
      },
      to: [
        { email_address: { address: email, name } },
      ],
      replyTo: [{ address: SUPPORT_ADDRESS, name: SITE_NAME }],
      subject: `We received your message — ${SITE_NAME}`,
      htmlbody: getContactConfirmationHtml(data),
      textbody: [
        `Hi ${name},`,
        ``,
        `We received your message. We aim to respond within 24 hours.`,
        ``,
        `Subject: ${subject}`,
        `Message:`,
        message,
        ``,
        `Questions? Email us at ${SUPPORT_ADDRESS}.`,
      ].join("\n"),
      clientReference: `contact-confirmation-${Date.now()}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
