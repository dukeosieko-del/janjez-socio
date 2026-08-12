import { NextResponse, NextRequest } from "next/server";
import { initiateStkPush, getCallbackUrl } from "@/lib/mpesa/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { rateLimit } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, 5);
  if (!rl.ok && rl.response) return rl.response;

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { phoneNumber, amount } = body as { phoneNumber?: string; amount?: number };

  if (!phoneNumber || !amount || amount < 50) {
    return NextResponse.json({ error: "Valid phone number and amount (min 50 KES) required" }, { status: 400 });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 50) {
    return NextResponse.json({ error: "Invalid amount: minimum is KES 50" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const callbackUrl = getCallbackUrl();
    const response = await initiateStkPush({
      phoneNumber,
      amount: numAmount,
      callbackUrl,
      accountReference: `janjez-topup-${user.id.slice(0, 8)}`,
      transactionDesc: `Wallet top-up for ${user.email}`,
    });

    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "topup",
      amount: numAmount,
      currency: "KES",
      payment_method: "mpesa",
      mpesa_phone: phoneNumber,
      reference: response.CheckoutRequestID,
      status: "pending",
      notes: "M-Pesa STK push initiated",
    });

    return NextResponse.json({
      ok: true,
      checkoutRequestId: response.CheckoutRequestID,
      message: response.CustomerMessage || "STK push initiated. Check your phone.",
    });
  } catch (error) {
    console.error("M-Pesa STK push error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to initiate M-Pesa payment",
    }, { status: 500 });
  }
}
