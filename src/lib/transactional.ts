import { sendEmail } from "@/lib/email/mailer";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getWelcomeEmail,
  getVerificationEmail,
  getPasswordResetEmail,
  getPasswordResetConfirmationEmail,
  getSecurityLoginAlertEmail,
  getOrderReceivedEmail,
  getOrderCompletedEmail,
  getOrderFailedEmail,
  getPaymentReceivedEmail,
  getLowWalletBalanceEmail,
  getAdminNewOrderEmail,
  getAdminHighValueOrderEmail,
  getAdminFulfillmentFailureEmail,
  getSystemMaintenanceEmail,
} from "@/lib/email/templates";
import {
  createNotification,
  notifyUser,
  notifyAdmins,
  type NotificationAudience,
  type NotificationCategory,
  type NotificationSeverity,
} from "@/lib/notifications";

export type { NotificationAudience, NotificationCategory, NotificationSeverity };

export type TemplateRenderer<T> = (data: T) => string;

export interface TransactionalTemplate<T = Record<string, unknown>> {
  subject: TemplateRenderer<T>;
  html: TemplateRenderer<T>;
  text: TemplateRenderer<T>;
  notificationTitle: TemplateRenderer<T>;
  notificationBody: TemplateRenderer<T>;
  notificationLink?: TemplateRenderer<T>;
  category: NotificationCategory;
  severity?: NotificationSeverity;
}

export interface TransactionalEvent {
  name: string;
  userId: string;
  audience?: NotificationAudience;
  data: Record<string, unknown>;
  email?: string;
  fullName?: string | null;
}

export interface SendTransactionalResult {
  emailOk: boolean;
  notificationOk: boolean;
}

const registry: Record<string, TransactionalTemplate> = {};

function register<T>(name: string, template: TransactionalTemplate<T>) {
  registry[name] = template as TransactionalTemplate;
}

register("user.welcome", {
  subject: (d) => getWelcomeEmail(d as Parameters<typeof getWelcomeEmail>[0]).subject,
  html: (d) => getWelcomeEmail(d as Parameters<typeof getWelcomeEmail>[0]).html,
  text: (d) => getWelcomeEmail(d as Parameters<typeof getWelcomeEmail>[0]).text,
  notificationTitle: (d) =>
    `Welcome to ${getWelcomeEmail(d as Parameters<typeof getWelcomeEmail>[0]).subject.replace("Welcome to ", "")}!`,
  notificationBody: (d) => {
    const fullName = (d as { fullName?: string | null }).fullName;
    return fullName
      ? `Your account is ready, ${fullName}. Sign in any time to browse services and place orders.`
      : "Your account is ready. Sign in any time to browse services and place orders.";
  },
  notificationLink: () => "/auth/sign-in",
  category: "system",
  severity: "success",
});

register("user.verify_email", {
  subject: (d) => getVerificationEmail(d as Parameters<typeof getVerificationEmail>[0]).subject,
  html: (d) => getVerificationEmail(d as Parameters<typeof getVerificationEmail>[0]).html,
  text: (d) => getVerificationEmail(d as Parameters<typeof getVerificationEmail>[0]).text,
  notificationTitle: () => "Verify your email",
  notificationBody: () => "Check your inbox for a verification link to activate your account.",
  notificationLink: () => "/auth/sign-in",
  category: "security",
  severity: "info",
});

register("user.password_reset", {
  subject: (d) => getPasswordResetEmail(d as Parameters<typeof getPasswordResetEmail>[0]).subject,
  html: (d) => getPasswordResetEmail(d as Parameters<typeof getPasswordResetEmail>[0]).html,
  text: (d) => getPasswordResetEmail(d as Parameters<typeof getPasswordResetEmail>[0]).text,
  notificationTitle: () => "Password reset requested",
  notificationBody: () => "If this wasn't you, secure your account immediately.",
  notificationLink: () => "/auth/sign-in",
  category: "security",
  severity: "warning",
});

register("user.password_reset_confirmation", {
  subject: (d) =>
    getPasswordResetConfirmationEmail(d as Parameters<typeof getPasswordResetConfirmationEmail>[0]).subject,
  html: (d) =>
    getPasswordResetConfirmationEmail(d as Parameters<typeof getPasswordResetConfirmationEmail>[0]).html,
  text: (d) =>
    getPasswordResetConfirmationEmail(d as Parameters<typeof getPasswordResetConfirmationEmail>[0]).text,
  notificationTitle: () => "Password updated",
  notificationBody: () => "Your password was just changed. If this wasn't you, contact support.",
  notificationLink: () => "/auth/sign-in",
  category: "security",
  severity: "success",
});

register("user.security_alert", {
  subject: (d) => getSecurityLoginAlertEmail(d as Parameters<typeof getSecurityLoginAlertEmail>[0]).subject,
  html: (d) => getSecurityLoginAlertEmail(d as Parameters<typeof getSecurityLoginAlertEmail>[0]).html,
  text: (d) => getSecurityLoginAlertEmail(d as Parameters<typeof getSecurityLoginAlertEmail>[0]).text,
  notificationTitle: () => "New sign-in detected",
  notificationBody: (d) => {
    const input = d as { time?: string; ip?: string; location?: string; userAgent?: string };
    return `Sign-in from ${input.location || "unknown location"} (${input.ip || "unknown IP"}) on ${input.userAgent || "unknown device"} at ${input.time || "recently"}.`;
  },
  notificationLink: () => "/profile",
  category: "security",
  severity: "warning",
});

register("order.received", {
  subject: (d) => getOrderReceivedEmail(d as Parameters<typeof getOrderReceivedEmail>[0]).subject,
  html: (d) => getOrderReceivedEmail(d as Parameters<typeof getOrderReceivedEmail>[0]).html,
  text: (d) => getOrderReceivedEmail(d as Parameters<typeof getOrderReceivedEmail>[0]).text,
  notificationTitle: (d) => `Order ${(d as { orderId?: string }).orderId || ""} received`,
  notificationBody: () => "We've received your order and our team is on it.",
  notificationLink: () => "/orders/all",
  category: "order",
  severity: "info",
});

register("order.completed", {
  subject: (d) => getOrderCompletedEmail(d as Parameters<typeof getOrderCompletedEmail>[0]).subject,
  html: (d) => getOrderCompletedEmail(d as Parameters<typeof getOrderCompletedEmail>[0]).html,
  text: (d) => getOrderCompletedEmail(d as Parameters<typeof getOrderCompletedEmail>[0]).text,
  notificationTitle: (d) => `Order ${(d as { orderId?: string }).orderId || ""} completed`,
  notificationBody: () => "Your order has been delivered. Thanks for choosing janjez.social!",
  notificationLink: () => "/orders/all",
  category: "order",
  severity: "success",
});

register("order.failed", {
  subject: (d) => getOrderFailedEmail(d as Parameters<typeof getOrderFailedEmail>[0]).subject,
  html: (d) => getOrderFailedEmail(d as Parameters<typeof getOrderFailedEmail>[0]).html,
  text: (d) => getOrderFailedEmail(d as Parameters<typeof getOrderFailedEmail>[0]).text,
  notificationTitle: (d) => `Order ${(d as { orderId?: string }).orderId || ""} failed`,
  notificationBody: () => "A refund has been credited to your wallet.",
  notificationLink: () => "/orders/all",
  category: "order",
  severity: "error",
});

register("payment.received", {
  subject: (d) => getPaymentReceivedEmail(d as Parameters<typeof getPaymentReceivedEmail>[0]).subject,
  html: (d) => getPaymentReceivedEmail(d as Parameters<typeof getPaymentReceivedEmail>[0]).html,
  text: (d) => getPaymentReceivedEmail(d as Parameters<typeof getPaymentReceivedEmail>[0]).text,
  notificationTitle: (d) => {
    const input = d as { amount?: number | string };
    const formatted = typeof input.amount === "number" ? `KES ${input.amount.toLocaleString()}` : `KES ${input.amount ?? ""}`;
    return `Payment received — ${formatted}`;
  },
  notificationBody: (d) => {
    const input = d as { method?: string };
    return `Your wallet was topped up via ${input.method || "M-Pesa"}.`;
  },
  notificationLink: () => "/wallet",
  category: "wallet",
  severity: "success",
});

register("wallet.low_balance", {
  subject: (d) => getLowWalletBalanceEmail(d as Parameters<typeof getLowWalletBalanceEmail>[0]).subject,
  html: (d) => getLowWalletBalanceEmail(d as Parameters<typeof getLowWalletBalanceEmail>[0]).html,
  text: (d) => getLowWalletBalanceEmail(d as Parameters<typeof getLowWalletBalanceEmail>[0]).text,
  notificationTitle: () => "Low wallet balance",
  notificationBody: (d) => {
    const input = d as { balance?: number | string };
    const formatted = typeof input.balance === "number" ? `KES ${input.balance.toLocaleString()}` : `KES ${input.balance ?? ""}`;
    return `Your balance is ${formatted}. Top up via M-Pesa to avoid delays.`;
  },
  notificationLink: () => "/wallet",
  category: "wallet",
  severity: "warning",
});

register("admin.new_order", {
  subject: (d) => getAdminNewOrderEmail(d as Parameters<typeof getAdminNewOrderEmail>[0]).subject,
  html: (d) => getAdminNewOrderEmail(d as Parameters<typeof getAdminNewOrderEmail>[0]).html,
  text: (d) => getAdminNewOrderEmail(d as Parameters<typeof getAdminNewOrderEmail>[0]).text,
  notificationTitle: (d) => `New order — ${(d as { orderId?: string }).orderId || ""}`,
  notificationBody: (d) => {
    const input = d as { customerEmail?: string; amount?: number | string };
    const formatted = typeof input.amount === "number" ? `KES ${input.amount.toLocaleString()}` : `KES ${input.amount ?? ""}`;
    return `${input.customerEmail || "Customer"} placed an order for ${formatted}.`;
  },
  notificationLink: () => "/admin/orders",
  category: "admin_alert",
  severity: "info",
});

register("admin.high_value_order", {
  subject: (d) => getAdminHighValueOrderEmail(d as Parameters<typeof getAdminHighValueOrderEmail>[0]).subject,
  html: (d) => getAdminHighValueOrderEmail(d as Parameters<typeof getAdminHighValueOrderEmail>[0]).html,
  text: (d) => getAdminHighValueOrderEmail(d as Parameters<typeof getAdminHighValueOrderEmail>[0]).text,
  notificationTitle: (d) => `High-value order — ${(d as { orderId?: string }).orderId || ""}`,
  notificationBody: (d) => {
    const input = d as { customerEmail?: string; amount?: number | string };
    const formatted = typeof input.amount === "number" ? `KES ${input.amount.toLocaleString()}` : `KES ${input.amount ?? ""}`;
    return `Order above KES 5,000 from ${input.customerEmail || "a customer"} (${formatted}). Review required.`;
  },
  notificationLink: () => "/admin/orders",
  category: "admin_alert",
  severity: "warning",
});

register("admin.fulfillment_failure", {
  subject: (d) => getAdminFulfillmentFailureEmail(d as Parameters<typeof getAdminFulfillmentFailureEmail>[0]).subject,
  html: (d) => getAdminFulfillmentFailureEmail(d as Parameters<typeof getAdminFulfillmentFailureEmail>[0]).html,
  text: (d) => getAdminFulfillmentFailureEmail(d as Parameters<typeof getAdminFulfillmentFailureEmail>[0]).text,
  notificationTitle: (d) => `Fulfillment failure — ${(d as { orderId?: string }).orderId || ""}`,
  notificationBody: (d) => {
    const input = d as { provider?: string; errorMessage?: string };
    return `${input.provider || "Provider"} returned an error: ${input.errorMessage || "unknown error"}.`;
  },
  notificationLink: () => "/admin/orders",
  category: "admin_alert",
  severity: "error",
});

register("system.maintenance", {
  subject: (d) => getSystemMaintenanceEmail(d as Parameters<typeof getSystemMaintenanceEmail>[0]).subject,
  html: (d) => getSystemMaintenanceEmail(d as Parameters<typeof getSystemMaintenanceEmail>[0]).html,
  text: (d) => getSystemMaintenanceEmail(d as Parameters<typeof getSystemMaintenanceEmail>[0]).text,
  notificationTitle: () => "Scheduled maintenance",
  notificationBody: (d) => {
    const input = d as { windowStart?: string; windowEnd?: string };
    return `Maintenance window: ${input.windowStart || "TBD"} → ${input.windowEnd || "TBD"}.`;
  },
  notificationLink: () => "/status",
  category: "system",
  severity: "warning",
});

export function getTemplate(name: string): TransactionalTemplate | undefined {
  return registry[name];
}

export function listRegisteredEvents(): string[] {
  return Object.keys(registry);
}

function safeRender<T>(fn: ((data: T) => string) | undefined, data: T): string {
  if (!fn) return "";
  try {
    return fn(data);
  } catch (err) {
    console.error("[transactional] template render failed:", err);
    return "";
  }
}

async function lookupEmailForUser(userId: string): Promise<{ email: string; fullName: string | null } | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return { email: data.email as string, fullName: (data.full_name as string | null) ?? null };
}

export async function sendTransactional(event: TransactionalEvent): Promise<SendTransactionalResult> {
  let emailOk = false;
  let notificationOk = false;

  try {
    const template = registry[event.name];
    if (!template) {
      console.error(`[transactional] unknown event: ${event.name}`);
      return { emailOk: false, notificationOk: false };
    }

    const subject = safeRender(template.subject, event.data);
    const html = safeRender(template.html, event.data);
    const text = safeRender(template.text, event.data);
    const notificationTitle = safeRender(template.notificationTitle, event.data);
    const notificationBody = safeRender(template.notificationBody, event.data);
    const notificationLink = template.notificationLink ? safeRender(template.notificationLink, event.data) : null;
    const severity = template.severity ?? "info";
    const audience: NotificationAudience = event.audience ?? (event.name.startsWith("admin.") ? "admin" : "user");

    let recipientEmail = event.email;
    let recipientName = event.fullName ?? null;

    if (!recipientEmail) {
      const profile = await lookupEmailForUser(event.userId);
      if (profile) {
        recipientEmail = profile.email;
        if (recipientName == null) recipientName = profile.fullName;
      }
    }

    if (recipientEmail) {
      try {
        const result = await sendEmail({
          to: { address: recipientEmail, name: recipientName || "" },
          subject,
          html,
          text,
        });
        emailOk = !!result.ok;
      } catch (err) {
        console.error(`[transactional] email failed for ${event.name}:`, err);
        emailOk = false;
      }
    } else {
      console.warn(`[transactional] no email found for userId=${event.userId} event=${event.name}`);
    }

    try {
      if (audience === "admin") {
        const rows = await notifyAdmins(template.category, {
          title: notificationTitle,
          body: notificationBody,
          link: notificationLink,
          severity,
        });
        notificationOk = rows.length > 0;
      } else {
        const created = await notifyUser(event.userId, template.category, {
          title: notificationTitle,
          body: notificationBody,
          link: notificationLink,
          severity,
        });
        notificationOk = !!created;
        if (!created) {
          const fallback = await createNotification({
            userId: event.userId,
            audience: "user",
            category: template.category,
            title: notificationTitle,
            body: notificationBody,
            link: notificationLink,
            severity,
          });
          notificationOk = !!fallback;
        }
      }
    } catch (err) {
      console.error(`[transactional] notification failed for ${event.name}:`, err);
      notificationOk = false;
    }

    return { emailOk, notificationOk };
  } catch (err) {
    console.error(`[transactional] unexpected error for ${event.name}:`, err);
    return { emailOk, notificationOk };
  }
}

export { registry };