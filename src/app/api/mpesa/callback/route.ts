import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { completeStkPayment, StkCallbackMetadata } from "@/lib/mpesa/client";
import { rateLimit } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

interface CallbackMetadataItem {
  Name: string;
  Value?: string;
}

interface StkCallback {
  CheckoutRequestID?: string;
  MerchantRequestID?: string;
  ResultCode?: string;
  ResultDesc?: string;
  CallbackMetadata?: {
    Item: CallbackMetadataItem[] | CallbackMetadataItem;
  };
}

interface MpesaCallbackBody {
  Body?: {
    stkCallback?: StkCallback;
  };
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResultCode?: string;
  ResultDesc?: string;
  ResponseDescription?: string;
  CallbackMetadata?: {
    Item: Array<{ Name: string; Value?: string }>;
  };
}

function getStkCallback(body: MpesaCallbackBody): StkCallback | null {
  if (body?.Body?.stkCallback) return body.Body.stkCallback;
  if (body?.CheckoutRequestID || body?.ResultCode !== undefined || body?.CallbackMetadata) {
    return body as unknown as StkCallback;
  }
  return null;
}

function extractMetadata(stk: StkCallback): StkCallbackMetadata {
  const raw = stk?.CallbackMetadata?.Item;
  if (!raw) return {};
  const items = Array.isArray(raw) ? raw : [raw];
  const get = (name: string): string | undefined =>
    items.find((i) => i.Name === name)?.Value;
  return {
    amount: get("Amount") ? Number(get("Amount")) : undefined,
    phone: get("PhoneNumber"),
    receipt: get("MpesaReceiptNumber"),
  };
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, 30);
  if (!rl.ok && rl.response) return rl.response;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const body = await request.json() as MpesaCallbackBody;
  const stk = getStkCallback(body);
  const checkoutRequestID = stk?.CheckoutRequestID || body?.CheckoutRequestID;

  if (!checkoutRequestID) {
    return NextResponse.json({ error: "Missing CheckoutRequestID" }, { status: 400 });
  }

  const resultCode = stk?.ResultCode?.toString() || body?.ResultCode?.toString() || (body?.ResponseCode === "0" ? "0" : "999");

  if (resultCode !== "0") {
    const { error } = await supabase
      .from("wallet_transactions")
      .update({
        status: "failed",
        notes: stk?.ResultDesc || body?.ResultDesc || body?.ResponseDescription || "M-Pesa payment failed",
      })
      .eq("reference", checkoutRequestID)
      .eq("status", "pending");

    if (error) console.error("Failed to update pending tx:", error.message);
    return NextResponse.json({ ok: true, resultCode });
  }

  const metadata = extractMetadata(stk || body);

  try {
    await completeStkPayment(checkoutRequestID, metadata);
  } catch (error) {
    console.error("Failed to complete STK payment:", error);
    await supabase
      .from("wallet_transactions")
      .update({
        status: "failed",
        notes: `Wallet credit failed: ${error instanceof Error ? error.message : String(error)}`,
      })
      .eq("reference", checkoutRequestID);
    return NextResponse.json({ error: "Payment received but wallet credit failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, resultCode });
}

export async function GET() {
  return NextResponse.json({ message: "M-Pesa callback endpoint. POST your callback data here." });
}
