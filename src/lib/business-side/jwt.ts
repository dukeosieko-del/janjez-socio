import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

const ALG = 'HS256';
const ISSUER = 'janjez.social';
const AUDIENCE = 'business-side-api';

function getSecret(): Uint8Array {
  const secret = process.env.API_KEY_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'API_KEY_JWT_SECRET must be set and at least 32 characters. ' +
      'Generate with: node -e "console.log(require("crypto").randomBytes(32).toString("hex"))"'
    );
  }
  return new TextEncoder().encode(secret);
}

export interface ApiKeyPayload {
  sub: string;       // user_id
  tid: string | null; // tenant_id (partner or child panel)
  kid: string;       // key_id — public identifier
  scopes: string[];
  iat: number;
  exp: number;
}

/**
 * Sign a new API key JWT. Follows the existing oauth/authorize pattern
 * (src/app/oauth/authorize/route.ts:61-70): SignJWT, HS256, setIssuedAt,
 * setExpirationTime.
 */
export async function signApiKey(payload: Omit<ApiKeyPayload, 'iat' | 'exp'>, expiresInMs: number): Promise<string> {
  return await new SignJWT({
    sub: payload.sub,
    tid: payload.tid,
    kid: payload.kid,
    scopes: payload.scopes,
  })
    .setProtectedHeader({ alg: ALG })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + Math.floor(expiresInMs / 1000))
    .sign(getSecret());
}

/**
 * Verify an API key JWT. Returns the decoded payload or null on failure.
 * Rejects expired, revoked, and malformed tokens.
 */
export async function verifyApiKey(token: string): Promise<ApiKeyPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    if (!payload.sub || !payload.kid || !Array.isArray(payload.scopes)) {
      return null;
    }

    return {
      sub: String(payload.sub),
      tid: payload.tid ? String(payload.tid) : null,
      kid: String(payload.kid),
      scopes: payload.scopes as string[],
      iat: Number(payload.iat),
      exp: Number(payload.exp),
    };
  } catch {
    return null;
  }
}

/**
 * Generate a public key_id and a random secret. The secret is shown once at
 * issuance time; only the hash is stored.
 */
export function generateKeyPair(): { keyId: string; secret: string; hash: string } {
  const keyId = `key_${randomBytes(8).toString('hex')}`;
  const secret = `jk_${randomBytes(32).toString('base64url')}`;
  const hash = createHash('sha256').update(secret).digest('hex');
  return { keyId, secret, hash };
}

/**
 * Constant-time comparison of a provided secret against a stored hash.
 * Uses timingSafeEqual to resist brute-force timing attacks.
 */
export function verifySecret(provided: string, storedHash: string): boolean {
  const providedHash = createHash('sha256').update(provided).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(providedHash), Buffer.from(storedHash));
  } catch {
    return false;
  }
}

/** Default scopes granted on issuance. */
export const DEFAULT_SCOPES = ['orders:read', 'orders:write', 'services:read', 'wallet:read'] as const;

/** All known scopes. */
export const ALL_SCOPES = [
  'orders:read',
  'orders:write',
  'services:read',
  'services:write',
  'wallet:read',
  'wallet:write',
  'webhooks:read',
  'webhooks:write',
  'analytics:read',
  'users:read',
  'users:write',
  'admin:read',
  'admin:write',
] as const;

/** Default key expiry: 365 days. */
export const DEFAULT_KEY_EXPIRY_MS = 365 * 24 * 60 * 60 * 1000;

/** Default rate limit: 60 req/min. */
export const DEFAULT_RATE_LIMIT = 60;