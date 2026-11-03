import { randomBytes, createHash } from 'crypto';

export interface ApiKeyPair {
  key: string;
  keyId: string;
  keyHash: string;
  prefix: string;
}

export function generateApiKey(prefix: string = 'jzb'): ApiKeyPair {
  const keyId = randomBytes(8).toString('hex');
  const secret = randomBytes(32).toString('base64url');
  const key = `${prefix}_${keyId}_${secret}`;
  const keyHash = createHash('sha256').update(key).digest('hex');
  
  return {
    key,
    keyId,
    keyHash,
    prefix: `${prefix}_${keyId.slice(0, 8)}`,
  };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export function validateApiKeyFormat(key: string): boolean {
  const pattern = /^[a-z]+_[a-f0-9]+_[A-Za-z0-9_-]+$/;
  return pattern.test(key);
}
