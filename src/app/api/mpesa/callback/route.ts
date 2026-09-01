import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { completeStkPayment, StkCallbackMetadata } from "@/lib/mpesa/client";
import { rateLimit } from "@/lib/server/rate-limiter";
import { sendEmail } from "@/lib/email/mailer";
import { getPaymentReceivedEmail } from "@/lib/email/templates";
import { SITE_URL } from "@/lib/email/config";

export const runtime = "nodejs";

interface MpesaCallbackBody {
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResultCode?: string;
  ResultDesc?: string;
  ResponseDescription?: string;
  CallbackMetadata?: {
    Item: Array<{ Name: string; Value?: string }>;
  };
}

function extractMetadata(body: MpesaCallbackBody): StkCallbackMetadata {
  const items = body?.CallbackMetadata?.Item || [];
  if (!Array.isArray(items)) return {};
  const get = (name: string): string | undefined =>
    items.find((i: { Name: string; Value?: string }) => i.Name === name)?.Value;
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
  const checkoutRequestID = body?.CheckoutRequestID;

  if (!checkoutRequestID) {
    return NextResponse.json({ error: "Missing CheckoutRequestID" }, { status: 400 });
  }

  const responseCode = body?.ResponseCode || body?.ResponseCode?.toString();
  const resultCode = body?.ResultCode?.toString() || (responseCode === "0" ? "0" : "999");

  if (resultCode !== "0") {
    const { error } = await supabase
      .from("wallet_transactions")
      .update({
        status: "failed",
        notes: body?.ResultDesc || body?.ResponseDescription || "M-Pesa payment failed",
      })
      .eq("reference", checkoutRequestID)
      .eq("status", "pending");

    if (error) console.error("Failed to update pending tx:", error.message);
    return NextResponse.json({ ok: true, resultCode });
  }

  const metadata = extractMetadata(body);

  try {
    const result = await completeStkPayment(checkoutRequestID, metadata);
    if (result.amount > 0) {
      try {
        const { data: pendingTx } = await supabase
          .from("wallet_transactions")
          .select("user_id, reference")
          .eq("reference", checkoutRequestID)
          .single();
        const txUserId = pendingTx?.user_id;
        if (txUserId) {
          const { data: authUser } = await supabase.auth.admin.getUserById(txUserId);
          const email = authUser?.user?.email;
          if (email) {
            const fullName =
              ((authUser?.user?.user_metadata as { full_name?: string } | undefined)?.full_name) || null;
            const { subject, html, text } = getPaymentReceivedEmail({
              customerName: fullName,
              amount: result.amount,
              method: "M-Pesa",
              reference: pendingTx?.reference || checkoutRequestID,
              link: `${SITE_URL}/wallet`,
            });
            const emailResult = await sendEmail({
              to: { address: email, name: fullName || "" },
              subject,
              html,
              text,
            });
            if (!emailResult.ok) {
              console.error("[email] payment-received failed:", emailResult.error);
            }
          }
        }
      } catch (emailErr) {
        console.error("[email] payment-received threw:", emailErr);
      }
    }
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
