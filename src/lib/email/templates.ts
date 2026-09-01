import { SITE_NAME, SUPPORT_ADDRESS } from "./config";

const BRAND_GREEN = "#00A859";
const BRAND_BLACK = "#0D0D0D";

function shell(title: string, body: string) {
  const year = new Date().getFullYear();
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: ${BRAND_BLACK};">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: ${BRAND_GREEN}; margin: 0; font-size: 28px;">${SITE_NAME}</h1>
        <p style="color: #666; margin-top: 8px;">Pata Clout Chapchap</p>
      </div>
      <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 30px; margin-top: 20px;">
        <h2 style="color: ${BRAND_BLACK}; margin-top: 0;">${title}</h2>
        ${body}
      </div>
      <div style="text-align: center; padding: 20px 0; color: #999; font-size: 12px;">
        &copy; ${year} ${SITE_NAME}. All rights reserved.
      </div>
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

function ctaButton(url: string, label: string) {
  const safeUrl = escapeHtml(url);
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${safeUrl}" style="background: ${BRAND_GREEN}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">${escapeHtml(label)}</a>
    </div>
    <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: ${BRAND_GREEN}; font-size: 14px;">${safeUrl}</p>
  `;
}

export interface WelcomeEmailInput {
  fullName: string | null;
  signInUrl: string;
}

export function getWelcomeEmail({ fullName, signInUrl }: WelcomeEmailInput) {
  const greeting = fullName ? `Hi ${escapeHtml(fullName)},` : "Hi there,";
  const body = `
    <p style="color: #333; line-height: 1.6;">${greeting}</p>
    <p style="color: #333; line-height: 1.6;">Welcome to ${SITE_NAME}! Your account is ready to use. You can sign in anytime to browse services, place orders, and track your activity.</p>
    ${ctaButton(signInUrl, "Open Dashboard")}
    <p style="color: #666; font-size: 14px;">If you have any questions, just reply to this email or reach us at <a href="mailto:${SUPPORT_ADDRESS}">${SUPPORT_ADDRESS}</a>.</p>
  `;
  return {
    subject: `Welcome to ${SITE_NAME}`,
    html: shell("Welcome aboard", body),
    text: `Welcome to ${SITE_NAME}!\n\nSign in: ${signInUrl}\n\nNeed help? ${SUPPORT_ADDRESS}`,
  };
}

export interface VerificationEmailInput {
  fullName: string | null;
  verifyUrl: string;
  expiresInHours?: number;
}

export function getVerificationEmail({ fullName, verifyUrl, expiresInHours = 24 }: VerificationEmailInput) {
  const greeting = fullName ? `Hi ${escapeHtml(fullName)},` : "Hi there,";
  const body = `
    <p style="color: #333; line-height: 1.6;">${greeting}</p>
    <p style="color: #333; line-height: 1.6;">Thanks for signing up for ${SITE_NAME}. Click the button below to verify your email address and activate your account.</p>
    ${ctaButton(verifyUrl, "Verify Email")}
    <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in ${expiresInHours} hours.</p>
  `;
  return {
    subject: `Verify your email — ${SITE_NAME}`,
    html: shell("Verify Your Email", body),
    text: `Verify your email for ${SITE_NAME}\n\nClick this link: ${verifyUrl}\n\nThis link expires in ${expiresInHours} hours.`,
  };
}

export interface PasswordResetEmailInput {
  fullName: string | null;
  resetUrl: string;
  expiresInMinutes?: number;
}

export function getPasswordResetEmail({ fullName, resetUrl, expiresInMinutes = 60 }: PasswordResetEmailInput) {
  const greeting = fullName ? `Hi ${escapeHtml(fullName)},` : "Hi there,";
  const body = `
    <p style="color: #333; line-height: 1.6;">${greeting}</p>
    <p style="color: #333; line-height: 1.6;">You (or someone using your email) requested a password reset. Click the button below to set a new password.</p>
    ${ctaButton(resetUrl, "Reset Password")}
    <p style="color: #666; font-size: 14px;">If you did not request this change, you can safely ignore this email. Your password will remain the same.</p>
    <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in ${expiresInMinutes} minutes.</p>
  `;
  return {
    subject: `Reset your password — ${SITE_NAME}`,
    html: shell("Reset Your Password", body),
    text: `Reset your password for ${SITE_NAME}\n\nClick this link: ${resetUrl}\n\nThis link expires in ${expiresInMinutes} minutes.\n\nIf you did not request this, ignore this email.`,
  };
}

export interface PasswordResetConfirmationEmailInput {
  fullName: string | null;
  signInUrl: string;
}

export function getPasswordResetConfirmationEmail({ fullName, signInUrl }: PasswordResetConfirmationEmailInput) {
  const greeting = fullName ? `Hi ${escapeHtml(fullName)},` : "Hi there,";
  const body = `
    <p style="color: #333; line-height: 1.6;">${greeting}</p>
    <p style="color: #333; line-height: 1.6;">Your password for ${SITE_NAME} was just updated. If this was you, you can now sign in with your new password.</p>
    ${ctaButton(signInUrl, "Sign In")}
    <p style="color: #b00; font-size: 14px;">If you did not make this change, please contact us immediately at <a href="mailto:${SUPPORT_ADDRESS}">${SUPPORT_ADDRESS}</a>.</p>
  `;
  return {
    subject: `Your password was updated — ${SITE_NAME}`,
    html: shell("Password Updated", body),
    text: `Your password for ${SITE_NAME} was updated.\n\nSign in: ${signInUrl}\n\nIf you did not make this change, contact ${SUPPORT_ADDRESS} immediately.`,
  };
}

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
        Sent from ${SITE_NAME} — Please reply directly to ${escapeHtml(data.email)}.
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
