export const EMAIL_FORWARDING: Record<string, string> = {
  "hellothad@janjez.social": "omoithaddaeus@gmail.com",
  "customer@janjez.social": "dukeosieko@gmail.com",
  "hr@janjez.social": "dukeosieko@gmail.com",
  "billing@janjez.social": "dukeosieko@gmail.com",
  "helloduke@janjez.social": "dukeosieko@gmail.com",
  "affiliate@janjez.social": "dukeosieko@gmail.com",
  "admin@janjez.social": "dukeosieko@gmail.com",
  "support@janjez.social": "dukeosieko@gmail.com",
  "info@janjez.social": "dukeosieko@gmail.com",
};

export const EMAIL_ALIASES = Object.keys(EMAIL_FORWARDING);

export const DOMAIN = "janjez.social";

export const NOREPLY_ADDRESS = `noreply@${DOMAIN}`;
export const SUPPORT_ADDRESS = `support@${DOMAIN}`;
export const INFO_ADDRESS = `info@${DOMAIN}`;
export const BILLING_ADDRESS = `billing@${DOMAIN}`;
export const HR_ADDRESS = `hr@${DOMAIN}`;
export const CUSTOMER_ADDRESS = `customer@${DOMAIN}`;
export const ADMIN_ADDRESS = `admin@${DOMAIN}`;
export const AFFILIATE_ADDRESS = `affiliate@${DOMAIN}`;
export const HELLO_DUKE_ADDRESS = `helloduke@${DOMAIN}`;
export const HELLO_HAD_ADDRESS = `hellothad@${DOMAIN}`;

export const SITE_NAME = "janjez.social";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://janjez.social";

export const SUPPORT_PHONE = "+254 101 574 056";
export const SUPPORT_WHATSAPP = "https://wa.me/254101574056";

export const EMAIL_DEPARTMENTS = [
  {
    label: "General Support",
    address: SUPPORT_ADDRESS,
    description: "Order issues, account help, technical support",
  },
  {
    label: "Sales & Customer",
    address: CUSTOMER_ADDRESS,
    description: "New orders, custom packages, bulk inquiries",
  },
  {
    label: "Billing",
    address: BILLING_ADDRESS,
    description: "M-Pesa payments, invoices, refunds",
  },
  {
    label: "Affiliate Program",
    address: AFFILIATE_ADDRESS,
    description: "Partnerships, commissions, referrals",
  },
  {
    label: "Human Resources",
    address: HR_ADDRESS,
    description: "Careers, collaborations, team inquiries",
  },
];
