import { createAdminClient } from "@/lib/supabase/admin";

function getMpesaEnv(): "production" | "sandbox" {
  const env = process.env.MPESA_ENV;
  if (env !== "production" && env !== "sandbox") {
    throw new Error(
      `Invalid or missing MPESA_ENV: "${env}". Must be "production" or "sandbox".`
    );
  }
  return env;
}

function getBaseUrl(): string {
  return getMpesaEnv() === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

function getCallbackUrl(origin?: string): string {
  const siteUrl = origin || process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is required for M-Pesa callback URL");
  }
  return `${siteUrl}/api/mpesa/callback`;
}

function getEndpoints() {
  const base = getBaseUrl();
  return {
    TOKEN_URL: `${base}/oauth/v1/generate?grant_type=client_credentials`,
    STK_PUSH_URL: `${base}/mpesa/stkpush/v1/processrequest`,
    STK_QUERY_URL: `${base}/mpesa/stkpush/v1/query`,
  };
}

let tokenCache: { access_token: string; expires_in: number; fetched_at: number } | null = null;

export interface StkPushParams {
  phoneNumber: string;
  amount: number;
  callbackUrl: string;
  accountReference?: string;
  transactionDesc?: string;
}

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage?: string;
}

export interface StkQueryResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchandiseRequestID?: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: Array<{ Name: string; Value?: string }>
  };
}

function formatPhone(phone: string): string {
  let cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
  if (cleaned.startsWith("0")) cleaned = "254" + cleaned.slice(1);
  if (!cleaned.startsWith("254")) cleaned = "254" + cleaned;
  return cleaned;
}

function generatePassword(shortCode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");
}

function generateTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && now - tokenCache.fetched_at < (tokenCache.expires_in - 60) * 1000) {
    return tokenCache.access_token;
  }

  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error("MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET are required");
  }

  const basicAuth = Buffer.from(`${key}:${secret}`).toString("base64");
  const { TOKEN_URL } = getEndpoints();
  const res = await fetch(TOKEN_URL, {
    method: "GET",
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
  });

  if (!res.ok) {
    throw new Error(`M-Pesa token request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  tokenCache = { access_token: data.access_token, expires_in: data.expires_in, fetched_at: now };
  return data.access_token;
}

export async function initiateStkPush(params: StkPushParams): Promise<StkPushResponse> {
  const accessToken = await getAccessToken();
  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortCode || !passkey) {
    throw new Error("MPESA_SHORTCODE and MPESA_PASSKEY are required");
  }

  const timestamp = generateTimestamp();
  const password = generatePassword(shortCode, passkey, timestamp);
  const phone = formatPhone(params.phoneNumber);

  const body = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: params.amount,
    PartyA: phone,
    PartyB: shortCode,
    PhoneNumber: phone,
    CallBackURL: params.callbackUrl,
    AccountReference: params.accountReference || `janjez-topup-${Date.now()}`,
    TransactionDesc: params.transactionDesc || "Wallet top-up",
    QueueTimeOutURL: params.callbackUrl,
  };

  const { STK_PUSH_URL } = getEndpoints();
  const res = await fetch(STK_PUSH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`M-Pesa STK push failed: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as StkPushResponse;
}

export async function queryStkStatus(checkoutRequestId: string): Promise<StkQueryResponse> {
  const accessToken = await getAccessToken();
  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortCode || !passkey) {
    throw new Error("MPESA_SHORTCODE and MPESA_PASSKEY are required");
  }

  const timestamp = generateTimestamp();
  const password = generatePassword(shortCode, passkey, timestamp);

  const body = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const { STK_QUERY_URL } = getEndpoints();
  const res = await fetch(STK_QUERY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`M-Pesa status query failed: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as StkQueryResponse;
}

export interface StkCallbackMetadata {
  amount?: number;
  phone?: string;
  receipt?: string;
}

export async function completeStkPayment(
  checkoutRequestId: string,
  metadata: StkCallbackMetadata
): Promise<{ newBalance: number; amount: number }> {
  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Server misconfigured");
  }

  const { data: pendingTx, error: findError } = await supabase
    .from("wallet_transactions")
    .select("user_id, amount")
    .eq("reference", checkoutRequestId)
    .eq("status", "pending")
    .single();

  if (findError || !pendingTx) {
    throw new Error("No pending transaction found for this CheckoutRequestID");
  }

  const amount = metadata.amount || Number(pendingTx.amount) || 0;

  const { error: updateError } = await supabase
    .from("wallet_transactions")
    .update({
      status: "completed",
      mpesa_receipt: metadata.receipt || checkoutRequestId,
      mpesa_phone: metadata.phone || "",
      notes: "M-Pesa STK push completed",
    })
    .eq("reference", checkoutRequestId)
    .eq("status", "pending");

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { data: creditData, error: creditError } = await supabase.rpc("credit_wallet", {
    p_user_id: pendingTx.user_id,
    p_amount: amount,
  });

  const creditResult = creditData as { new_balance: number } | null;

  if (creditError || !creditResult) {
    throw new Error(creditError?.message || "Failed to credit wallet");
  }

  const newBalance = Number(creditResult.new_balance) || 0;

  const { error: notifError } = await supabase.from("notifications").insert({
    user_id: pendingTx.user_id,
    type: "topup",
    title: "Wallet Top-Up Successful",
    message: `KES ${amount.toLocaleString()} has been added to your wallet via M-Pesa. New balance: KES ${newBalance.toLocaleString()}.`,
    link: "/pay",
  });

  if (notifError) {
    console.error("Failed to create notification:", notifError.message);
  }

  return { newBalance, amount };
}

export function formatPhoneNumber(phone: string): string {
  return formatPhone(phone);
}

export { getCallbackUrl };
