import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessSideApiKey, getBusinessSideHmacSecret } from "./config";
import { businessError } from "./response";

const NONCE_TTL_MS = 10 * 60 * 1000;
const nonces = new Map<string, number>();

function pruneNonces(now: number) {
  for (const [nonce, expiresAt] of nonces.entries()) {
    if (expiresAt <= now) nonces.delete(nonce);
  }
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function authenticateBusinessSideRequest(request: NextRequest) {
  const apiKey = request.headers.get("x-business-side-api-key") || undefined;
  const configuredApiKey = getBusinessSideApiKey();
  if (!apiKey || !configuredApiKey || !constantTimeEqual(apiKey, configuredApiKey)) {
    return { ok: false as const, response: businessError("INVALID_API_KEY", "Invalid Business Side API key.", 401) };
  }

  const secret = getBusinessSideHmacSecret();
  if (!secret) {
    return { ok: false as const, response: businessError("SERVER_MISCONFIGURED", "Business Side HMAC secret is not configured.", 500) };
  }

  const timestampHeader = request.headers.get("x-timestamp") || "";
  const timestamp = Number(timestampHeader);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(timestamp) || Math.abs(nowSeconds - timestamp) > 300) {
    return { ok: false as const, response: businessError("INVALID_TIMESTAMP", "Timestamp must be within 5 minutes of server time.", 401) };
  }

  const nonce = request.headers.get("x-nonce") || "";
  if (!nonce || nonce.length > 200) {
    return { ok: false as const, response: businessError("INVALID_NONCE", "A unique nonce is required.", 401) };
  }

  const signature = request.headers.get("x-signature") || "";
  if (!/^[a-fA-F0-9]{64}$/.test(signature)) {
    return { ok: false as const, response: businessError("INVALID_SIGNATURE", "Invalid request signature.", 401) };
  }

  const rawBody = await request.text();
  const bodyHash = createHmac("sha256", secret).update(rawBody).digest("hex");
  const path = new URL(request.url).pathname;
  const payload = `${request.method.toUpperCase()}\n${path}\n${bodyHash}\n${timestampHeader}\n${nonce}`;
  const expectedSignature = createHmac("sha256", secret).update(payload).digest("hex");
  if (!constantTimeEqual(signature.toLowerCase(), expectedSignature)) {
    return { ok: false as const, response: businessError("INVALID_SIGNATURE", "Invalid request signature.", 401) };
  }

  const now = Date.now();
  pruneNonces(now);
  if (nonces.has(nonce)) {
    return { ok: false as const, response: businessError("INVALID_NONCE", "Nonce has already been used.", 401) };
  }
  nonces.set(nonce, now + NONCE_TTL_MS);

  return { ok: true as const, rawBody, apiKey };
}
