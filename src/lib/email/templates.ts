import { SITE_NAME, SUPPORT_ADDRESS, SUPPORT_PHONE } from "./config";

const BRAND_GREEN = "#00A859";
const BRAND_RED = "#BB133E";
const BRAND_BLACK = "#0D0D0D";
const BRAND_WHITE = "#FFFFFF";
const TEXT_DARK = "#1A1A1A";
const TEXT_MUTED = "#5A5A5A";
const SURFACE_BG = "#F7F7F8";
const CARD_BORDER = "#E5E5E7";
const TABLE_BG = "#FAFAFB";

function escapeHtml(text: string | null | undefined): string {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function wordmark() {
  return `
    <span style="font-family: Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 800; letter-spacing: 2px; color: ${BRAND_WHITE}; text-transform: uppercase;">
      JANJEZ <span style="color: ${BRAND_GREEN};">SOCIO</span>
    </span>
  `;
}

function logoRow() {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
      <tr>
        <td align="left" valign="middle" style="padding: 0;">
          ${wordmark()}
        </td>
        <td align="right" valign="middle" style="padding: 0;">
          <span style="font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #9A9A9A; letter-spacing: 1px; text-transform: uppercase;">
            Pata Clout Chapchap
          </span>
        </td>
      </tr>
    </table>
  `;
}

function header() {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; background: ${BRAND_BLACK};">
      <tr>
        <td style="padding: 22px 28px;">
          ${logoRow()}
        </td>
      </tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" height="6" style="border-collapse: collapse;">
      <tr>
        <td style="padding: 0; line-height: 6px; font-size: 6px; background: ${BRAND_GREEN};">&nbsp;</td>
        <td width="34%" style="padding: 0; line-height: 6px; font-size: 6px; background: ${BRAND_BLACK};">&nbsp;</td>
        <td width="14%" style="padding: 0; line-height: 6px; font-size: 6px; background: ${BRAND_RED};">&nbsp;</td>
      </tr>
    </table>
  `;
}

function footer() {
  const year = new Date().getFullYear();
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; margin-top: 28px;">
      <tr>
        <td style="padding: 0 28px 22px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
            <tr>
              <td align="left" valign="top" style="padding: 0;">
                <span style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: ${TEXT_MUTED};">
                  &copy; ${year} ${SITE_NAME}. All rights reserved.
                </span>
              </td>
              <td align="right" valign="top" style="padding: 0;">
                <span style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: ${TEXT_MUTED};">
                  <a href="mailto:${SUPPORT_ADDRESS}" style="color: ${BRAND_GREEN}; text-decoration: none;">${SUPPORT_ADDRESS}</a>
                  &nbsp;&middot;&nbsp;
                  <span style="color: ${TEXT_DARK};">${SUPPORT_PHONE}</span>
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; background: ${SURFACE_BG}; border-top: 1px solid ${CARD_BORDER};">
      <tr>
        <td align="center" style="padding: 14px 28px;">
          <span style="font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: ${TEXT_MUTED}; letter-spacing: 0.5px;">
            <a href="https://instagram.com/janjez.socio" style="color: ${TEXT_MUTED}; text-decoration: none;">Instagram</a>
            &nbsp;&middot;&nbsp;
            <a href="https://facebook.com/janjez.socio" style="color: ${TEXT_MUTED}; text-decoration: none;">Facebook</a>
            &nbsp;&middot;&nbsp;
            <a href="https://x.com/janjez_socio" style="color: ${TEXT_MUTED}; text-decoration: none;">X</a>
            &nbsp;&middot;&nbsp;
            <a href="https://tiktok.com/@janjez.socio" style="color: ${TEXT_MUTED}; text-decoration: none;">TikTok</a>
            &nbsp;&middot;&nbsp;
            <a href="https://t.me/janjez_socio" style="color: ${TEXT_MUTED}; text-decoration: none;">Telegram</a>
          </span>
        </td>
      </tr>
    </table>
  `;
}

interface ShellOptions {
  preheader: string;
  body: string;
}

function shell({ preheader, body }: ShellOptions): string {
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${SITE_NAME}</title>
  </head>
  <body style="margin: 0; padding: 0; background: ${SURFACE_BG}; font-family: Helvetica, Arial, sans-serif; color: ${TEXT_DARK}; -webkit-text-size-adjust: 100%;">
    <span style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: ${SURFACE_BG}; opacity: 0;">
      ${escapeHtml(preheader)}
    </span>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; background: ${SURFACE_BG};">
      <tr>
        <td align="center" style="padding: 24px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="border-collapse: collapse; max-width: 600px; width: 100%; background: ${BRAND_WHITE}; border: 1px solid ${CARD_BORDER}; border-radius: 12px; overflow: hidden;">
            <tr>
              <td style="padding: 0;">
                ${header()}
              </td>
            </tr>
            <tr>
              <td style="padding: 36px 32px 12px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding: 0;">
                ${footer()}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

export function baseLayout(title: string, bodyHtml: string, preheader?: string): string {
  const body = `
    ${titleBlock(title)}
    ${bodyHtml}
  `;
  return shell({ preheader: preheader ?? title, body });
}

function ctaButton(url: string, label: string): string {
  const safeUrl = escapeHtml(url);
  const safeLabel = escapeHtml(label);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; margin: 28px 0 8px;">
      <tr>
        <td align="center" style="padding: 0;">
          <a href="${safeUrl}" target="_blank" rel="noopener" style="display: inline-block; background: ${BRAND_GREEN}; color: ${BRAND_WHITE}; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">
            ${safeLabel}
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 12px 0 0; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: ${TEXT_MUTED}; text-align: center; word-break: break-all;">
      Or copy this link: <a href="${safeUrl}" style="color: ${BRAND_GREEN}; text-decoration: none;">${safeUrl}</a>
    </p>
  `;
}

function greetingBlock(fullName: string | null): string {
  const greeting = fullName ? `Hi ${escapeHtml(fullName)},` : "Hi there,";
  return `
    <p style="margin: 0 0 18px; font-family: Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: ${TEXT_DARK};">
      ${greeting}
    </p>
  `;
}

function titleBlock(title: string, subtitle?: string): string {
  return `
    <h1 style="margin: 0 0 8px; font-family: Helvetica, Arial, sans-serif; font-size: 26px; line-height: 1.3; font-weight: 800; color: ${BRAND_GREEN};">
      ${escapeHtml(title)}
    </h1>
    ${subtitle ? `
    <p style="margin: 0 0 24px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.5; color: ${TEXT_MUTED};">
      ${escapeHtml(subtitle)}
    </p>
    ` : ""}
  `;
}

function paragraph(text: string): string {
  return `
    <p style="margin: 0 0 16px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.65; color: ${TEXT_DARK};">
      ${text}
    </p>
  `;
}

function mutedParagraph(text: string): string {
  return `
    <p style="margin: 0 0 14px; font-family: Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.6; color: ${TEXT_MUTED};">
      ${escapeHtml(text)}
    </p>
  `;
}

function divider(): string {
  return `
    <hr style="margin: 24px 0; border: 0; border-top: 1px solid ${CARD_BORDER}; height: 0;" />
  `;
}

function stepsList(steps: string[]): string {
  const items = steps
    .map(
      (step, idx) => `
        <tr>
          <td valign="top" width="36" style="padding: 6px 12px 6px 0; font-family: Helvetica, Arial, sans-serif;">
            <div style="width: 28px; height: 28px; line-height: 28px; border-radius: 50%; background: ${BRAND_GREEN}; color: ${BRAND_WHITE}; text-align: center; font-weight: 700; font-size: 14px;">
              ${idx + 1}
            </div>
          </td>
          <td valign="top" style="padding: 6px 0; font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.55; color: ${TEXT_DARK};">
            ${escapeHtml(step)}
          </td>
        </tr>
      `
    )
    .join("");
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; margin: 12px 0 8px;">
      ${items}
    </table>
  `;
}

export interface WelcomeEmailInput {
  fullName: string | null;
  signInUrl: string;
}

export function getWelcomeEmail({ fullName, signInUrl }: WelcomeEmailInput) {
  const body = `
    ${greetingBlock(fullName)}
    ${titleBlock(`Welcome to ${SITE_NAME}!`, "Your account is ready — let’s get you signed in.")}
    ${paragraph(
      `You're all set up. From here you can browse services, place orders, top up your wallet, and manage your Janjez Socio profile.`
    )}
    ${ctaButton(signInUrl, "Open Dashboard")}
    ${divider()}
    ${paragraph(
      `Need a hand? Reply to this email or reach our team at <a href="mailto:${SUPPORT_ADDRESS}" style="color: ${BRAND_GREEN}; text-decoration: none;">${SUPPORT_ADDRESS}</a>.`
    )}
  `;
  return {
    subject: `Welcome to ${SITE_NAME}`,
    html: shell({
      preheader: `Your Janjez Socio account is ready. Sign in to get started.`,
      body,
    }),
    text: [
      `Welcome to ${SITE_NAME}!`,
      ``,
      fullName ? `Hi ${fullName},` : `Hi there,`,
      ``,
      `Your account is ready. Sign in to browse services, place orders, and manage your wallet.`,
      ``,
      `Sign in: ${signInUrl}`,
      ``,
      `Need help? ${SUPPORT_ADDRESS}`,
    ].join("\n"),
  };
}

export interface VerificationEmailInput {
  fullName: string | null;
  verifyUrl: string;
  expiresInHours?: number;
}

export function getVerificationEmail({ fullName, verifyUrl, expiresInHours = 24 }: VerificationEmailInput) {
  const body = `
    ${greetingBlock(fullName)}
    ${titleBlock("Verify your email", "One click and you're in.")}
    ${paragraph(
      `Thanks for joining ${SITE_NAME}. Please confirm your email address so we can activate your account and keep your profile secure.`
    )}
    ${ctaButton(verifyUrl, "Verify Email")}
    ${mutedParagraph(`This verification link will expire in ${expiresInHours} hours.`)}
    ${divider()}
    ${mutedParagraph(
      `If you didn't create a Janjez Socio account, you can safely ignore this email — nothing else is required.`
    )}
  `;
  return {
    subject: `Verify your email — ${SITE_NAME}`,
    html: shell({
      preheader: `Confirm your email to finish setting up your Janjez Socio account.`,
      body,
    }),
    text: [
      `Verify your email — ${SITE_NAME}`,
      ``,
      fullName ? `Hi ${fullName},` : `Hi there,`,
      ``,
      `Click this link to verify your email and activate your account:`,
      verifyUrl,
      ``,
      `This link expires in ${expiresInHours} hours.`,
    ].join("\n"),
  };
}

export interface PasswordResetEmailInput {
  fullName: string | null;
  resetUrl: string;
  expiresInMinutes?: number;
}

export function getPasswordResetEmail({ fullName, resetUrl, expiresInMinutes = 60 }: PasswordResetEmailInput) {
  const steps = [
    "Click the button below to open our secure reset page.",
    "Choose a new password — at least 6 characters.",
    "Sign in with your new password and you're back in.",
  ];
  const body = `
    ${greetingBlock(fullName)}
    ${titleBlock("Reset your password", "We got a request to change your password.")}
    ${paragraph(
      `Someone (hopefully you) just asked to reset the password for your ${SITE_NAME} account. Use the secure link below to set a new one.`
    )}
    ${ctaButton(resetUrl, "Reset Password")}
    ${divider()}
    <h2 style="margin: 0 0 12px; font-family: Helvetica, Arial, sans-serif; font-size: 17px; font-weight: 700; color: ${BRAND_BLACK};">
      What's next?
    </h2>
    ${stepsList(steps)}
    ${mutedParagraph(`This link will expire in ${expiresInMinutes} minutes.`)}
    ${paragraph(
      `<strong>Didn't request this?</strong> You can safely ignore this email — your password will stay exactly the same.`
    )}
  `;
  return {
    subject: `Reset your password — ${SITE_NAME}`,
    html: shell({
      preheader: `Follow the secure link in this email to set a new Janjez Socio password.`,
      body,
    }),
    text: [
      `Reset your password — ${SITE_NAME}`,
      ``,
      fullName ? `Hi ${fullName},` : `Hi there,`,
      ``,
      `You (or someone using your email) requested a password reset.`,
      ``,
      `Reset your password: ${resetUrl}`,
      ``,
      `This link expires in ${expiresInMinutes} minutes.`,
      ``,
      `If you didn't request this, ignore this email — your password is unchanged.`,
    ].join("\n"),
  };
}

export interface PasswordResetConfirmationEmailInput {
  fullName: string | null;
  signInUrl: string;
}

export function getPasswordResetConfirmationEmail({ fullName, signInUrl }: PasswordResetConfirmationEmailInput) {
  const body = `
    ${greetingBlock(fullName)}
    ${titleBlock("Password updated", "Your Janjez Socio password was just changed.")}
    ${paragraph(
      `Your account password has been successfully updated. You can now sign in with your new password.`
    )}
    ${ctaButton(signInUrl, "Sign In")}
    ${divider()}
    ${paragraph(
      `<span style="color: ${BRAND_RED}; font-weight: 700;">Didn't make this change?</span> Reach us immediately at <a href="mailto:${SUPPORT_ADDRESS}" style="color: ${BRAND_GREEN}; text-decoration: none;">${SUPPORT_ADDRESS}</a> or call ${SUPPORT_PHONE} so we can lock things down.`
    )}
  `;
  return {
    subject: `Your password was updated — ${SITE_NAME}`,
    html: shell({
      preheader: `Your Janjez Socio password was changed. If this wasn't you, please contact support.`,
      body,
    }),
    text: [
      `Your password was updated — ${SITE_NAME}`,
      ``,
      fullName ? `Hi ${fullName},` : `Hi there,`,
      ``,
      `Your password for ${SITE_NAME} was just updated.`,
      ``,
      `Sign in: ${signInUrl}`,
      ``,
      `If you didn't make this change, contact ${SUPPORT_ADDRESS} immediately.`,
    ].join("\n"),
  };
}

export interface SecurityLoginAlertEmailInput {
  fullName: string | null;
  ip: string;
  userAgent: string;
  location: string;
  time: string;
  signOutUrl: string;
}

export function getSecurityLoginAlertEmail({
  fullName,
  ip,
  userAgent,
  location,
  time,
  signOutUrl,
}: SecurityLoginAlertEmailInput) {
  const body = `
    ${greetingBlock(fullName)}
    ${titleBlock("New sign-in to your account", "Heads up — we noticed a new login.")}
    ${paragraph(
      `We detected a new sign-in to your ${SITE_NAME} account. If this was you, no action is needed. If not, please secure your account right away.`
    )}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; margin: 8px 0 16px; background: ${TABLE_BG}; border: 1px solid ${CARD_BORDER}; border-radius: 10px;">
      <tr>
        <td style="padding: 16px 18px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: ${TEXT_DARK};">
            <tr>
              <td width="110" style="padding: 6px 12px 6px 0; color: ${TEXT_MUTED}; font-weight: 600;">Time</td>
              <td style="padding: 6px 0;">${escapeHtml(time)}</td>
            </tr>
            <tr>
              <td width="110" style="padding: 6px 12px 6px 0; color: ${TEXT_MUTED}; font-weight: 600;">IP address</td>
              <td style="padding: 6px 0; word-break: break-all;">${escapeHtml(ip)}</td>
            </tr>
            <tr>
              <td width="110" style="padding: 6px 12px 6px 0; color: ${TEXT_MUTED}; font-weight: 600;">Location</td>
              <td style="padding: 6px 0;">${escapeHtml(location)}</td>
            </tr>
            <tr>
              <td width="110" style="padding: 6px 0; color: ${TEXT_MUTED}; font-weight: 600; vertical-align: top;">Device</td>
              <td style="padding: 6px 0; word-break: break-word; color: ${TEXT_MUTED}; font-size: 13px;">${escapeHtml(userAgent)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${ctaButton(signOutUrl, "Sign Out Other Sessions")}
    ${divider()}
    ${paragraph(
      `<strong>Wasn't you?</strong> Reset your password immediately and contact <a href="mailto:${SUPPORT_ADDRESS}" style="color: ${BRAND_GREEN}; text-decoration: none;">${SUPPORT_ADDRESS}</a> so our team can help secure your account.`
    )}
  `;
  return {
    subject: `New sign-in to your account — ${SITE_NAME}`,
    html: shell({
      preheader: `We noticed a new login to your Janjez Socio account. Was this you?`,
      body,
    }),
    text: [
      `New sign-in to your account — ${SITE_NAME}`,
      ``,
      fullName ? `Hi ${fullName},` : `Hi there,`,
      ``,
      `We detected a new sign-in to your ${SITE_NAME} account.`,
      ``,
      `Time: ${time}`,
      `IP: ${ip}`,
      `Location: ${location}`,
      `Device: ${userAgent}`,
      ``,
      `If this was you, no action is needed.`,
      `If not, secure your account and sign out other sessions: ${signOutUrl}`,
      ``,
      `Need help? ${SUPPORT_ADDRESS}`,
    ].join("\n"),
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
  return shell({
    preheader: `New contact request from ${data.name} — ${data.subject}`,
    body: `
      ${titleBlock("New Contact Request", `A new message just landed in your inbox.`)}
      ${mutedParagraph(`Forwarded to the ${escapeHtml(departmentLabel)} department.`)}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; margin: 8px 0 16px; background: ${TABLE_BG}; border: 1px solid ${CARD_BORDER}; border-radius: 10px;">
        <tr>
          <td style="padding: 16px 18px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: ${TEXT_DARK};">
              <tr>
                <td width="120" style="padding: 8px 12px 8px 0; color: ${TEXT_MUTED}; font-weight: 600; vertical-align: top;">Name</td>
                <td style="padding: 8px 0; border-bottom: 1px solid ${CARD_BORDER};">${escapeHtml(data.name)}</td>
              </tr>
              <tr>
                <td width="120" style="padding: 8px 12px 8px 0; color: ${TEXT_MUTED}; font-weight: 600; vertical-align: top;">Email</td>
                <td style="padding: 8px 0; border-bottom: 1px solid ${CARD_BORDER};"><a href="mailto:${escapeHtml(data.email)}" style="color: ${BRAND_GREEN}; text-decoration: none;">${escapeHtml(data.email)}</a></td>
              </tr>
              <tr>
                <td width="120" style="padding: 8px 12px 8px 0; color: ${TEXT_MUTED}; font-weight: 600; vertical-align: top;">Department</td>
                <td style="padding: 8px 0; border-bottom: 1px solid ${CARD_BORDER};">${escapeHtml(departmentLabel)}</td>
              </tr>
              <tr>
                <td width="120" style="padding: 8px 12px 8px 0; color: ${TEXT_MUTED}; font-weight: 600; vertical-align: top;">Subject</td>
                <td style="padding: 8px 0; border-bottom: 1px solid ${CARD_BORDER};">${escapeHtml(data.subject)}</td>
              </tr>
              <tr>
                <td width="120" style="padding: 8px 0; color: ${TEXT_MUTED}; font-weight: 600; vertical-align: top;">Message</td>
                <td style="padding: 8px 0; white-space: pre-wrap;">${escapeHtml(data.message)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      ${mutedParagraph(`Reply directly to ${escapeHtml(data.email)} to respond to this message.`)}
    `,
  });
}

export function getContactConfirmationHtml(data: ContactFormData) {
  return shell({
    preheader: `We received your message — our team will get back to you within 24 hours.`,
    body: `
      ${titleBlock("We received your message", "Thanks for reaching out to the Janjez Socio team.")}
      ${paragraph(
        `We've got your note and our team will get back to you within 24 hours. Below is a copy of what you sent so you have a record.`
      )}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; margin: 8px 0 16px; background: ${TABLE_BG}; border: 1px solid ${CARD_BORDER}; border-radius: 10px;">
        <tr>
          <td style="padding: 16px 18px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: ${TEXT_DARK};">
              <tr>
                <td width="120" style="padding: 8px 12px 8px 0; color: ${TEXT_MUTED}; font-weight: 600; vertical-align: top;">Name</td>
                <td style="padding: 8px 0; border-bottom: 1px solid ${CARD_BORDER};">${escapeHtml(data.name)}</td>
              </tr>
              <tr>
                <td width="120" style="padding: 8px 12px 8px 0; color: ${TEXT_MUTED}; font-weight: 600; vertical-align: top;">Email</td>
                <td style="padding: 8px 0; border-bottom: 1px solid ${CARD_BORDER};"><a href="mailto:${escapeHtml(data.email)}" style="color: ${BRAND_GREEN}; text-decoration: none;">${escapeHtml(data.email)}</a></td>
              </tr>
              <tr>
                <td width="120" style="padding: 8px 12px 8px 0; color: ${TEXT_MUTED}; font-weight: 600; vertical-align: top;">Subject</td>
                <td style="padding: 8px 0; border-bottom: 1px solid ${CARD_BORDER};">${escapeHtml(data.subject)}</td>
              </tr>
              <tr>
                <td width="120" style="padding: 8px 0; color: ${TEXT_MUTED}; font-weight: 600; vertical-align: top;">Message</td>
                <td style="padding: 8px 0; white-space: pre-wrap;">${escapeHtml(data.message)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      ${mutedParagraph(`Need urgent help? Chat with us on WhatsApp or email ${SUPPORT_ADDRESS}.`)}
    `,
  });
}
export interface OrderReceivedEmailInput {
  customerName: string | null;
  orderId: string;
  service: string;
  quantity: number | string;
  amount: number | string;
  link: string;
}

export function getOrderReceivedEmail({
  customerName,
  orderId,
  service,
  quantity,
  amount,
  link,
}: OrderReceivedEmailInput) {
  const formattedAmount = typeof amount === "number" ? `KES ${amount.toLocaleString()}` : `KES ${amount}`;
  const body = `
    ${greetingBlock(customerName)}
    ${titleBlock("Order received", `We're on it — order ${escapeHtml(orderId)} is queued.`)}
    ${paragraph(`Thanks for your order from ${SITE_NAME}. We've received it and our team is working on fulfillment. You'll get another email as soon as it's delivered.`)}
    ${paragraph(`<strong>Service:</strong> ${escapeHtml(service)}<br/><strong>Quantity:</strong> ${escapeHtml(String(quantity))}<br/><strong>Amount:</strong> ${escapeHtml(formattedAmount)}<br/><strong>Target link:</strong> <a href="${escapeHtml(link)}" style="color: ${BRAND_GREEN}; text-decoration: none;">${escapeHtml(link)}</a>`)}
    ${ctaButton(`https://${SITE_NAME}/orders/all`, "Track Your Order")}
    ${divider()}
    ${mutedParagraph(`Need help? Reply to this email or reach us at ${SUPPORT_ADDRESS}.`)}
  `;
  return {
    subject: `Order received — ${orderId}`,
    html: shell({ preheader: `We received your order ${orderId}.`, body }),
    text: [
      `Order received — ${SITE_NAME}`,
      ``,
      customerName ? `Hi ${customerName},` : `Hi there,`,
      ``,
      `Order ID: ${orderId}`,
      `Service: ${service}`,
      `Quantity: ${quantity}`,
      `Amount: ${formattedAmount}`,
      `Target link: ${link}`,
      ``,
      `Track your order: https://${SITE_NAME}/orders/all`,
      ``,
      `Need help? ${SUPPORT_ADDRESS}`,
    ].join("\n"),
  };
}

export interface OrderCompletedEmailInput {
  customerName: string | null;
  orderId: string;
  service: string;
  link: string;
}

export function getOrderCompletedEmail({
  customerName,
  orderId,
  service,
  link,
}: OrderCompletedEmailInput) {
  const body = `
    ${greetingBlock(customerName)}
    ${titleBlock("Order completed", `Order ${escapeHtml(orderId)} has been delivered.`)}
    ${paragraph(`Great news — your order has been completed and delivered. Thanks for choosing ${SITE_NAME}!`)}
    ${paragraph(`<strong>Service:</strong> ${escapeHtml(service)}<br/><strong>Target link:</strong> <a href="${escapeHtml(link)}" style="color: ${BRAND_GREEN}; text-decoration: none;">${escapeHtml(link)}</a>`)}
    ${ctaButton(`https://${SITE_NAME}/orders/all`, "View Order")}
    ${divider()}
    ${mutedParagraph(`If anything looks off, reply to this email within 24 hours and we'll make it right.`)}
  `;
  return {
    subject: `Order completed — ${orderId}`,
    html: shell({ preheader: `Your order ${orderId} has been completed.`, body }),
    text: [
      `Order completed — ${SITE_NAME}`,
      ``,
      customerName ? `Hi ${customerName},` : `Hi there,`,
      ``,
      `Order ID: ${orderId}`,
      `Service: ${service}`,
      `Link: ${link}`,
      ``,
      `View: https://${SITE_NAME}/orders/all`,
    ].join("\n"),
  };
}

export interface OrderFailedEmailInput {
  customerName: string | null;
  orderId: string;
  reason: string;
  link: string;
}

export function getOrderFailedEmail({
  customerName,
  orderId,
  reason,
  link,
}: OrderFailedEmailInput) {
  const body = `
    ${greetingBlock(customerName)}
    ${titleBlock("Order failed", `Refund issued for ${escapeHtml(orderId)}.`)}
    ${paragraph(`Unfortunately we couldn't complete your order. A refund has been credited to your wallet — no charges were lost.`)}
    ${paragraph(`<strong>Reason:</strong> ${escapeHtml(reason)}<br/><strong>Target link:</strong> <a href="${escapeHtml(link)}" style="color: ${BRAND_GREEN}; text-decoration: none;">${escapeHtml(link)}</a>`)}
    ${paragraph(`<span style="color: ${BRAND_RED}; font-weight: 700;">Refund status:</span> Credited to your wallet.`)}
    ${ctaButton(`https://${SITE_NAME}/orders/all`, "View Order")}
    ${divider()}
    ${mutedParagraph(`Need help with a retry? Contact ${SUPPORT_ADDRESS}.`)}
  `;
  return {
    subject: `Order failed — refund issued — ${orderId}`,
    html: shell({ preheader: `Your order ${orderId} failed. Refund credited to wallet.`, body }),
    text: [
      `Order failed — refund issued — ${SITE_NAME}`,
      ``,
      customerName ? `Hi ${customerName},` : `Hi there,`,
      ``,
      `Order ID: ${orderId}`,
      `Reason: ${reason}`,
      `Link: ${link}`,
      ``,
      `A refund has been credited to your wallet.`,
      ``,
      `View: https://${SITE_NAME}/orders/all`,
      ``,
      `Need help? ${SUPPORT_ADDRESS}`,
    ].join("\n"),
  };
}

export interface PaymentReceivedEmailInput {
  customerName: string | null;
  amount: number | string;
  method: string;
  reference: string;
  link: string;
}

export function getPaymentReceivedEmail({
  customerName,
  amount,
  method,
  reference,
  link,
}: PaymentReceivedEmailInput) {
  const formattedAmount = typeof amount === "number" ? `KES ${amount.toLocaleString()}` : `KES ${amount}`;
  const body = `
    ${greetingBlock(customerName)}
    ${titleBlock("Payment received", `${escapeHtml(formattedAmount)} added to your wallet.`)}
    ${paragraph(`We received your payment via ${escapeHtml(method)}. Your wallet has been topped up and is ready to use.`)}
    ${paragraph(`<strong>Amount:</strong> ${escapeHtml(formattedAmount)}<br/><strong>Method:</strong> ${escapeHtml(method)}<br/><strong>Reference:</strong> ${escapeHtml(reference)}`)}
    ${ctaButton(`https://${SITE_NAME}/wallet`, "View Wallet")}
    ${divider()}
    ${mutedParagraph(`Keep this reference handy if you need to contact support about this payment.`)}
  `;
  return {
    subject: `Payment received — ${formattedAmount}`,
    html: shell({ preheader: `Your wallet was topped up with ${formattedAmount}.`, body }),
    text: [
      `Payment received — ${SITE_NAME}`,
      ``,
      customerName ? `Hi ${customerName},` : `Hi there,`,
      ``,
      `Amount: ${formattedAmount}`,
      `Method: ${method}`,
      `Reference: ${reference}`,
      ``,
      `Wallet: https://${SITE_NAME}/wallet`,
      link ? `Details: ${link}` : ``,
    ].join("\n"),
  };
}

export interface LowWalletBalanceEmailInput {
  fullName: string | null;
  balance: number | string;
  topUpUrl: string;
}

export function getLowWalletBalanceEmail({
  fullName,
  balance,
  topUpUrl,
}: LowWalletBalanceEmailInput) {
  const formattedBalance = typeof balance === "number" ? `KES ${balance.toLocaleString()}` : `KES ${balance}`;
  const body = `
    ${greetingBlock(fullName)}
    ${titleBlock("Low wallet balance", `Your wallet is below KES 100.`)}
    ${paragraph(`Your ${SITE_NAME} wallet balance is getting low. Top up now so your next order goes through without delays.`)}
    ${paragraph(`<strong>Current balance:</strong> ${escapeHtml(formattedBalance)}`)}
    ${paragraph(`<span style="color: ${BRAND_RED}; font-weight: 700;">Alert threshold:</span> below KES 100.`)}
    ${ctaButton(topUpUrl, "Top Up via M-Pesa")}
    ${divider()}
    ${mutedParagraph(`Top-ups are processed instantly via M-Pesa STK push.`)}
  `;
  return {
    subject: `Low wallet balance — ${formattedBalance}`,
    html: shell({ preheader: `Your wallet is low: ${formattedBalance}. Top up via M-Pesa.`, body }),
    text: [
      `Low wallet balance — ${SITE_NAME}`,
      ``,
      fullName ? `Hi ${fullName},` : `Hi there,`,
      ``,
      `Current balance: ${formattedBalance}`,
      ``,
      `Top up via M-Pesa: ${topUpUrl}`,
    ].join("\n"),
  };
}

export interface AdminNewOrderEmailInput {
  adminName: string | null;
  orderId: string;
  customerEmail: string;
  amount: number | string;
  adminUrl: string;
}

export function getAdminNewOrderEmail({
  adminName,
  orderId,
  customerEmail,
  amount,
  adminUrl,
}: AdminNewOrderEmailInput) {
  const formattedAmount = typeof amount === "number" ? `KES ${amount.toLocaleString()}` : `KES ${amount}`;
  const body = `
    ${greetingBlock(adminName)}
    ${titleBlock("New order placed", `Order ${escapeHtml(orderId)} just came in.`)}
    ${paragraph(`A new order was just placed on ${SITE_NAME}.`)}
    ${paragraph(`<strong>Order ID:</strong> ${escapeHtml(orderId)}<br/><strong>Customer:</strong> ${escapeHtml(customerEmail)}<br/><strong>Amount:</strong> ${escapeHtml(formattedAmount)}`)}
    ${ctaButton(adminUrl, "Open Admin")}
  `;
  return {
    subject: `New order placed — ${orderId}`,
    html: shell({ preheader: `New order ${orderId} from ${customerEmail}.`, body }),
    text: [
      `New order placed — ${SITE_NAME}`,
      ``,
      adminName ? `Hi ${adminName},` : `Hi admin,`,
      ``,
      `Order ID: ${orderId}`,
      `Customer: ${customerEmail}`,
      `Amount: ${formattedAmount}`,
      ``,
      `Open admin: ${adminUrl}`,
    ].join("\n"),
  };
}

export interface AdminHighValueOrderEmailInput {
  adminName: string | null;
  orderId: string;
  customerEmail: string;
  amount: number | string;
  adminUrl: string;
}

export function getAdminHighValueOrderEmail({
  adminName,
  orderId,
  customerEmail,
  amount,
  adminUrl,
}: AdminHighValueOrderEmailInput) {
  const formattedAmount = typeof amount === "number" ? `KES ${amount.toLocaleString()}` : `KES ${amount}`;
  const body = `
    ${greetingBlock(adminName)}
    ${titleBlock("High-value order — review", `Order ${escapeHtml(orderId)} is over KES 5,000.`)}
    ${paragraph(`<span style="color: ${BRAND_RED}; font-weight: 700;">High-value order</span> — review required.`)}
    ${paragraph(`<strong>Order ID:</strong> ${escapeHtml(orderId)}<br/><strong>Customer:</strong> ${escapeHtml(customerEmail)}<br/><strong>Amount:</strong> ${escapeHtml(formattedAmount)}<br/><strong>Threshold:</strong> KES 5,000`)}
    ${ctaButton(adminUrl, "Review Order")}
  `;
  return {
    subject: `High-value order > KES 5,000 — ${orderId}`,
    html: shell({ preheader: `High-value order ${orderId} from ${customerEmail} needs review.`, body }),
    text: [
      `High-value order — ${SITE_NAME}`,
      ``,
      adminName ? `Hi ${adminName},` : `Hi admin,`,
      ``,
      `Order ID: ${orderId}`,
      `Customer: ${customerEmail}`,
      `Amount: ${formattedAmount}`,
      `Threshold: KES 5,000`,
      ``,
      `Review: ${adminUrl}`,
    ].join("\n"),
  };
}

export interface AdminFulfillmentFailureEmailInput {
  adminName: string | null;
  orderId: string;
  provider: string;
  errorMessage: string;
  adminUrl: string;
}

export function getAdminFulfillmentFailureEmail({
  adminName,
  orderId,
  provider,
  errorMessage,
  adminUrl,
}: AdminFulfillmentFailureEmailInput) {
  const body = `
    ${greetingBlock(adminName)}
    ${titleBlock("Fulfillment failure", `Provider error on order ${escapeHtml(orderId)}.`)}
    ${paragraph(`<span style="color: ${BRAND_RED}; font-weight: 700;">Provider returned an error</span> while fulfilling an order.`)}
    ${paragraph(`<strong>Order ID:</strong> ${escapeHtml(orderId)}<br/><strong>Provider:</strong> ${escapeHtml(provider)}<br/><strong>Error:</strong> ${escapeHtml(errorMessage)}`)}
    ${ctaButton(adminUrl, "Investigate")}
  `;
  return {
    subject: `Fulfillment failure — ${provider} — ${orderId}`,
    html: shell({ preheader: `Provider ${provider} returned an error on order ${orderId}.`, body }),
    text: [
      `Fulfillment failure — ${SITE_NAME}`,
      ``,
      adminName ? `Hi ${adminName},` : `Hi admin,`,
      ``,
      `Order ID: ${orderId}`,
      `Provider: ${provider}`,
      `Error: ${errorMessage}`,
      ``,
      `Investigate: ${adminUrl}`,
    ].join("\n"),
  };
}

export interface SystemMaintenanceEmailInput {
  fullName: string | null;
  windowStart: string;
  windowEnd: string;
  reason: string;
  statusUrl: string;
}

export function getSystemMaintenanceEmail({
  fullName,
  windowStart,
  windowEnd,
  reason,
  statusUrl,
}: SystemMaintenanceEmailInput) {
  const body = `
    ${greetingBlock(fullName)}
    ${titleBlock("Scheduled maintenance", `Heads up — there's a maintenance window coming up.`)}
    ${paragraph(`${SITE_NAME} has a scheduled maintenance window. During this window, orders and payments may be slower than usual.`)}
    ${paragraph(`<strong>Starts:</strong> ${escapeHtml(windowStart)}<br/><strong>Ends:</strong> ${escapeHtml(windowEnd)}<br/><strong>Reason:</strong> ${escapeHtml(reason)}`)}
    ${ctaButton(statusUrl, "View Status Page")}
    ${divider()}
    ${mutedParagraph(`We'll post live updates on the status page throughout the window.`)}
  `;
  return {
    subject: `Scheduled maintenance window — ${SITE_NAME}`,
    html: shell({ preheader: `Scheduled maintenance: ${windowStart} → ${windowEnd}.`, body }),
    text: [
      `Scheduled maintenance — ${SITE_NAME}`,
      ``,
      fullName ? `Hi ${fullName},` : `Hi there,`,
      ``,
      `Starts: ${windowStart}`,
      `Ends: ${windowEnd}`,
      `Reason: ${reason}`,
      ``,
       `Status page: ${statusUrl}`,
     ].join("\n"),
   };
}

export interface ArticlePublishedEmailInput {
  authorName: string;
  articleTitle: string;
  articleUrl: string;
}

export function getArticlePublishedEmail({ authorName, articleTitle, articleUrl }: ArticlePublishedEmailInput) {
  const body = `
    ${greetingBlock(authorName)}
    ${titleBlock("Article Published", `Your article is now live on ${SITE_NAME}`)}
    ${paragraph(`Great news! Your article <strong>${escapeHtml(articleTitle)}</strong> has been approved and published.`)}
    ${paragraph(`Readers can now find it in the blog and search results. Share it with your audience to maximize reach.`)}
    ${ctaButton(articleUrl, "View Published Article")}
    ${divider()}
    ${mutedParagraph(`Thank you for contributing to the ${SITE_NAME} community.`)}
  `;
  return {
    subject: `Your article is now live — ${articleTitle}`,
    html: shell({ preheader: `Your article "${articleTitle}" has been published on ${SITE_NAME}.`, body }),
    text: [
      `Your article is now live — ${SITE_NAME}`,
      ``,
      `Hi ${authorName},`,
      ``,
      `Great news! Your article "${articleTitle}" has been approved and published.`,
      ``,
      `View it here: ${articleUrl}`,
      ``,
      `Thank you for contributing to the ${SITE_NAME} community.`,
    ].join("\n"),
  };
}

export interface ArticleRejectedEmailInput {
  authorName: string;
  articleTitle: string;
  reason?: string;
  articleUrl: string;
}

export function getArticleRejectedEmail({ authorName, articleTitle, reason, articleUrl }: ArticleRejectedEmailInput) {
  const body = `
    ${greetingBlock(authorName)}
    ${titleBlock("Article Needs Revision", `Your article "${escapeHtml(articleTitle)}" was not approved`)}
    ${paragraph(`Thank you for submitting your article. After review, it was not approved for publication at this time.`)}
    ${reason ? paragraph(`<strong>Reason:</strong> ${escapeHtml(reason)}`) : ""}
    ${paragraph(`You can edit your article and resubmit it for review.`)}
    ${ctaButton(articleUrl, "Edit Article")}
    ${divider()}
    ${mutedParagraph(`If you have questions, reply to this email or contact us on WhatsApp.`)}
  `;
  return {
    subject: `Article update needed — ${articleTitle}`,
    html: shell({ preheader: `Your article "${articleTitle}" needs revision before it can be published.`, body }),
    text: [
      `Article update needed — ${SITE_NAME}`,
      ``,
      `Hi ${authorName},`,
      ``,
      `Your article "${articleTitle}" was not approved for publication.`,
      reason ? `Reason: ${reason}` : "",
      ``,
      `Edit and resubmit: ${articleUrl}`,
      ``,
      `If you have questions, reply to this email or contact us on WhatsApp.`,
    ].join("\n"),
  };
}

export { SITE_NAME, SUPPORT_ADDRESS, SUPPORT_PHONE };
