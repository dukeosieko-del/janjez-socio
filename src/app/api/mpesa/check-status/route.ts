import { NextResponse, NextRequest } from "next/server";
import { queryStkStatus, completeStkPayment, StkQueryResponse, StkCallbackMetadata } from "@/lib/mpesa/client";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { rateLimit } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

function extractMetadata(result: StkQueryResponse): StkCallbackMetadata {
  const items = result?.CallbackMetadata?.Item || [];
  if (!Array.isArray(items)) return {};
  const get = (name: string): string | undefined =>
    items.find((i: { Name: string; Value?: string }) => i.Name === name)?.Value;
  return {
    amount: get("Amount") ? Number(get("Amount")) : undefined,
    phone: get("PhoneNumber"),
    receipt: get("MpesaReceiptNumber"),
  };
}

export async function GET(request: NextRequest) {
  const rl = rateLimit(request, 30);
  if (!rl.ok && rl.response) return rl.response;

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const checkoutRequestId = searchParams.get("checkoutRequestId");
  if (!checkoutRequestId) {
    return NextResponse.json({ error: "checkoutRequestId is required" }, { status: 400 });
  }

  try {
    const result = await queryStkStatus(checkoutRequestId);
    const paid = result.ResultCode === "0";

    let credited = false;
    if (paid) {
      const metadata = extractMetadata(result);
      try {
        await completeStkPayment(checkoutRequestId, metadata);
        credited = true;
      } catch (creditError) {
        console.error("Failed to credit wallet:", creditError);
      }
    }

    return NextResponse.json({
      ok: true,
      paid,
      credited,
      resultCode: result.ResultCode,
      description: result.ResultDesc,
    });
  } catch (error) {
    console.error("M-Pesa status query error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to check M-Pesa status",
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, 10);
  if (!rl.ok && rl.response) return rl.response;

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { checkoutRequestId } = body as { checkoutRequestId?: string };
  if (!checkoutRequestId) {
    return NextResponse.json({ error: "checkoutRequestId is required" }, { status: 400 });
  }

  try {
    const result = await queryStkStatus(checkoutRequestId);
    const paid = result.ResultCode === "0";

    let credited = false;
    if (paid) {
      const metadata = extractMetadata(result);
      try {
        await completeStkPayment(checkoutRequestId, metadata);
        credited = true;
      } catch (creditError) {
        console.error("Failed to credit wallet:", creditError);
      }
    }

    return NextResponse.json({
      ok: true,
      paid,
      credited,
      resultCode: result.ResultCode,
      description: result.ResultDesc,
    });
  } catch (error) {
    console.error("M-Pesa status query error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to check M-Pesa status",
    }, { status: 500 });
  }
}
