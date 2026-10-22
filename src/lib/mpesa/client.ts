import { createAdminClient } from "@/lib/supabase/admin";
import { creditWallet } from "@/lib/wallet";

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
    TransactionType: "CustomerBuyGoodsOnline",
    Amount: Math.round(params.amount),
    PartyA: "1329148",
    PartyB: "1799086",
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
    const errorText = await res.text();
    let errorJson: Record<string, unknown> = {};
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      // ignore parse error
    }
    const message =
      (errorJson as { errorMessage?: string; errorCode?: string }).errorMessage ||
      (errorJson as { message?: string }).message ||
      errorText ||
      res.statusText;
    throw new Error(`M-Pesa STK push failed: ${res.status} ${message}`);
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
): Promise<{ newBalance: number; amount: number; orderId?: string; alreadyCompleted?: boolean }> {
  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Server misconfigured");
  }

  const { data: pendingTx, error: findError } = await supabase
    .from("wallet_transactions")
    .select("id, user_id, amount, related_order_id, status")
    .eq("reference", checkoutRequestId)
    .maybeSingle();

  if (findError || !pendingTx) {
    throw new Error("No transaction found for this CheckoutRequestID");
  }

  const pendingAmount = Number(pendingTx.amount) || 0;
  const confirmedAmount = Number(metadata.amount) || 0;

  if (confirmedAmount > 0 && pendingAmount > 0 && Math.abs(confirmedAmount - pendingAmount) > 0.01) {
    console.error(
      `[mpesa] Amount mismatch for ${checkoutRequestId}: requested ${pendingAmount}, confirmed ${confirmedAmount}. Using the requested amount.`
    );
  }

  // The pending amount is the amount we asked Safaricom to charge and the
  // amount the order was priced at — it is the only safe value to credit.
  const amount = pendingAmount > 0 ? pendingAmount : confirmedAmount;

  // Idempotency: Safaricom retries callbacks, so a transaction that is already
  // completed must not be credited twice.
  if (pendingTx.status === "completed") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", pendingTx.user_id ?? "")
      .maybeSingle();
    return {
      newBalance: Number(profile?.wallet_balance) || 0,
      amount,
      orderId: pendingTx.related_order_id || undefined,
      alreadyCompleted: true,
    };
  }

  if (pendingTx.status !== "pending") {
    throw new Error(`Transaction is already ${pendingTx.status}`);
  }

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

  // ---------------------------------------------------------------------
  // Order payment: the money paid for an order, so it must NOT be credited
  // to the wallet. Mark the order paid and fulfil it.
  // ---------------------------------------------------------------------
  if (pendingTx.related_order_id) {
    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing",
        fulfillment_status: "pending",
      })
      .eq("id", pendingTx.related_order_id)
      .in("payment_status", ["pending_mpesa", "pending"]);

    if (orderUpdateError) {
      console.error("Failed to update order payment status:", orderUpdateError.message);
    } else {
      console.log(
        `[mpesa] Order ${pendingTx.related_order_id} paid via M-Pesa (KES ${amount}). Fulfilling.`
      );
    }

    // Trigger async fulfillment for the order
    try {
      const { fulfillOrder } = await import("@/lib/smm/fulfillment");
      await fulfillOrder(pendingTx.related_order_id);
    } catch (fulfillError) {
      console.error("Order fulfillment failed after M-Pesa payment:", fulfillError);
    }

    if (pendingTx.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", pendingTx.user_id)
        .maybeSingle();

      await supabase.from("notifications").insert({
        user_id: pendingTx.user_id,
        type: "topup",
        title: "Payment Received",
        message: `KES ${amount.toLocaleString()} received via M-Pesa for order ${pendingTx.related_order_id}. Your order is now being processed.`,
        link: "/orders/all",
      });

      return {
        newBalance: Number(profile?.wallet_balance) || 0,
        amount,
        orderId: pendingTx.related_order_id,
      };
    }

    return { newBalance: 0, amount, orderId: pendingTx.related_order_id };
  }

  // ---------------------------------------------------------------------
  // Wallet top-up: credit the balance.
  // ---------------------------------------------------------------------
  if (!pendingTx.user_id) {
    console.error(
      `[mpesa] Transaction ${checkoutRequestId} has no user and no related order — nothing to credit.`
    );
    return { newBalance: 0, amount };
  }

  const credit = await creditWallet(supabase as any, pendingTx.user_id, amount);
  if (credit.error) {
    throw new Error(credit.error);
  }

  const newBalance = credit.newBalance;

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
  return process.env.MPESA_CALLBACK_URL || `${siteUrl}/api/mpesa/callback`;
}
