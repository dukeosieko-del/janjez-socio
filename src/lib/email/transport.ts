import { SendMailClient } from "zeptomail";

export interface MailTransportOptions {
  url?: string;
  token?: string;
}

let client: SendMailClient | null = null;

export function getMailClient(options: MailTransportOptions = {}) {
  const url = options.url || process.env.ZEPTOMAIL_URL || "api.zeptomail.com";
  const token = options.token || process.env.ZEPTOMAIL_SENDMAIL_TOKEN;

  if (!token) {
    throw new Error("ZEPTOMAIL_SENDMAIL_TOKEN is not configured");
  }

  if (!client) {
    client = new SendMailClient({ url, token });
  }

  return client;
}

export interface SendMailInput {
  from: { address: string; name: string };
  to: Array<{ email_address: { address: string; name: string } }>;
  replyTo?: Array<{ address: string; name: string }>;
  cc?: Array<{ email_address: { address: string; name: string } }>;
  bcc?: Array<{ email_address: { address: string; name: string } }>;
  subject: string;
  htmlbody?: string;
  textbody?: string;
  clientReference?: string;
}

export async function sendMail(input: SendMailInput) {
  const mailClient = getMailClient();
  return mailClient.sendMail({
    ...input,
    reply_to: input.replyTo,
    track_clicks: true,
    track_opens: true,
  });
}
