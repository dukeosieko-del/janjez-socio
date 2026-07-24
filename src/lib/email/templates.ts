import { SITE_URL } from "@/app/lib/config";
import { SUPPORT_ADDRESS, SITE_NAME } from "./config";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  department?: string;
}

export function getContactNotificationHtml(data: ContactFormData) {
  const departmentLabel = data.department || "General Support";
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #111;">
      <h2 style="margin: 0 0 16px; font-size: 20px;">New Contact Request — ${SITE_NAME}</h2>
      <p style="margin: 0 0 24px; color: #666; font-size: 14px;">You received a new message through the contact form.</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; width: 120px; font-weight: 600;">Name</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${escapeHtml(data.name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">Department</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${escapeHtml(departmentLabel)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">Subject</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${escapeHtml(data.subject)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Message</td>
          <td style="padding: 10px 0; white-space: pre-wrap;">${escapeHtml(data.message)}</td>
        </tr>
      </table>
      <p style="margin: 24px 0 0; font-size: 12px; color: #888;">
        Sent from ${SITE_URL} — Please reply directly to ${escapeHtml(data.email)}.
      </p>
    </div>
  `;
}

export function getContactConfirmationHtml(data: ContactFormData) {
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #111;">
      <h2 style="margin: 0 0 12px; font-size: 20px;">We received your message</h2>
      <p style="margin: 0 0 24px; color: #666; font-size: 14px;">Thanks for reaching out to ${SITE_NAME}. We aim to respond within 24 hours.</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; width: 120px; font-weight: 600;">Name</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${escapeHtml(data.name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">Subject</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${escapeHtml(data.subject)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Message</td>
          <td style="padding: 10px 0; white-space: pre-wrap;">${escapeHtml(data.message)}</td>
        </tr>
      </table>
      <p style="margin: 24px 0 0; font-size: 12px; color: #888;">
        Need urgent help? Chat with us on WhatsApp or email ${SUPPORT_ADDRESS}.
      </p>
    </div>
  `;
}

export function getOrderConfirmationHtml({
  customerName,
  customerEmail,
  orderId,
  service,
  amount,
  link,
}: {
  customerName: string;
  customerEmail: string;
  orderId: string;
  service: string;
  amount: number;
  link: string;
}) {
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #111;">
      <h2 style="margin: 0 0 12px; font-size: 20px;">Order Received — ${SITE_NAME}</h2>
      <p style="margin: 0 0 24px; color: #666; font-size: 14px;">We received your order and payment confirmation.</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; width: 120px; font-weight: 600;">Order ID</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${escapeHtml(orderId)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">Customer</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${escapeHtml(customerName)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(customerEmail)}">${escapeHtml(customerEmail)}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">Service</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${escapeHtml(service)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">Amount</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">KES ${amount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Link</td>
          <td style="padding: 10px 0;"><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></td>
        </tr>
      </table>
      <p style="margin: 24px 0 0; font-size: 12px; color: #888;">
        Questions? Reply to this email or contact ${SUPPORT_ADDRESS}.
      </p>
    </div>
  `;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
