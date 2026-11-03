import { env } from '@/lib/config/env';

const BREVO_API_KEY = env.BREVO_API_KEY;

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!BREVO_API_KEY) {
    console.log(`[Email - fallback] to: ${to} subject: ${subject}`);
    return;
  }
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          email: env.BREVO_SENDER_EMAIL ?? 'noreply@business.janjez.social',
          name: 'Janjez Business Side',
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo send failed:', response.status, errorText);
      throw new Error(`Brevo email send failed: ${response.status}`);
    }
  } catch (err) {
    console.error('Brevo send failed:', err);
    throw err;
  }
}

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Your verification code is:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
        ${code}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;
  await sendEmail(to, 'Verify your email - Janjez Business Side', html);
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;
  await sendEmail(to, 'Reset your password - Janjez Business Side', html);
}

export async function sendOrderNotificationEmail(to: string, orderId: string, status: string): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Update</h2>
      <p>Your order <strong>${orderId}</strong> status has been updated to: <strong>${status}</strong></p>
      <p>Login to your panel to view more details.</p>
    </div>
  `;
  await sendEmail(to, `Order ${orderId} - Status: ${status}`, html);
}

export async function sendTransactionalEmail(to: string, subject: string, htmlContent: string): Promise<void> {
  await sendEmail(to, subject, htmlContent);
}
