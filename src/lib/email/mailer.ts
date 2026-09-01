import nodemailer, { type Transporter } from "nodemailer";

const DEFAULT_FROM_NAME = "JANJEZ SOCIO";

export interface MailAddress {
  address: string;
  name?: string;
}

export interface SendEmailOptions {
  to: MailAddress | MailAddress[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: MailAddress;
  fromName?: string;
}

export interface SendEmailResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

let cachedTransport: Transporter | null = null;

function readNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveFromAddress(opts: { fromName?: string }): { address: string; name: string } {
  const address = process.env.BREVO_FROM_EMAIL;
  if (!address) {
    throw new Error("BREVO_FROM_EMAIL is not configured");
  }
  const name = opts.fromName || process.env.BREVO_FROM_NAME || DEFAULT_FROM_NAME;
  return { address, name };
}

function getTransport(): Transporter {
  if (cachedTransport) return cachedTransport;

  const host = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
  const port = readNumberEnv("BREVO_SMTP_PORT", 587);
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_KEY;

  if (!user || !pass) {
    throw new Error("BREVO_SMTP_USER and BREVO_SMTP_KEY must be configured");
  }

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
  });

  return cachedTransport;
}

function toNodemailerAddress(addr: MailAddress) {
  return addr.name ? { address: addr.address, name: addr.name } : { address: addr.address };
}

function toRecipients(to: MailAddress | MailAddress[]) {
  const list = Array.isArray(to) ? to : [to];
  return list.map(toNodemailerAddress);
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const transport = getTransport();
    const from = resolveFromAddress({ fromName: options.fromName });
    const recipients = toRecipients(options.to);

    const info = await transport.sendMail({
      from,
      to: recipients.length === 1 ? recipients[0] : recipients,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo ? toNodemailerAddress(options.replyTo) : undefined,
    });

    return { ok: true, messageId: info.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("[email] sendEmail failed:", message);
    return { ok: false, error: message };
  }
}

export async function verifyMailer(): Promise<{ ok: boolean; error?: string }> {
  try {
    const transport = getTransport();
    await transport.verify();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown verify error";
    console.error("[email] verifyMailer failed:", message);
    return { ok: false, error: message };
  }
}
