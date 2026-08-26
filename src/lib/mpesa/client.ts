import { createAdminClient } from "@/lib/supabase/admin";

const MPESA_ENV = process.env.MPESA_ENV || "sandbox";
const BASE_URL =
  MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

const TOKEN_URL = `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
const STK_PUSH_URL = `${BASE_URL}/mpesa/stkpush/v1/processrequest`;
const STK_QUERY_URL = `${BASE_URL}/mpesa/stkpush/v1/query`;

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
    .select("user_id, amount, related_order_id")
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

  let newBalance = 0;

  // For anonymous orders (user_id is NULL), credit wallet is skipped.
  // Instead, mark the related order as paid and trigger fulfillment.
  if (pendingTx.user_id === null || pendingTx.user_id === undefined) {
    if (pendingTx.related_order_id) {
      const { error: orderUpdateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "processing",
          fulfillment_status: "pending",
        })
        .eq("id", pendingTx.related_order_id)
        .eq("payment_status", "pending_mpesa");

      if (orderUpdateError) {
        console.error("Failed to update anonymous order payment status:", orderUpdateError.message);
      }

      // Trigger async fulfillment for anonymous order
      try {
        const { fulfillOrder } = await import("@/lib/smm/fulfillment");
        await fulfillOrder(pendingTx.related_order_id);
      } catch (fulfillError) {
        console.error("Anonymous order fulfillment failed:", fulfillError);
      }
    }
    return { newBalance: 0, amount };
  }

  const { data: creditData, error: creditError } = await supabase.rpc("credit_wallet", {
    p_user_id: pendingTx.user_id,
    p_amount: amount,
  });

  const creditResult = creditData as { new_balance: number } | null;

  if (creditError || !creditResult) {
    throw new Error(creditError?.message || "Failed to credit wallet");
  }

  newBalance = Number(creditResult.new_balance) || 0;

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

export function getCallbackUrl(origin?: string): string {
  const siteUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || "https://janjez.social";
  return `${siteUrl}/api/mpesa/callback`;
}
