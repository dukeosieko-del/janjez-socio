#!/usr/bin/env node
/**
 * Generate shared API secrets for the Business Side ↔ Main Build integration.
 *
 * Usage: node scripts/generate-secrets.js
 *
 * Outputs two secrets that MUST be identical on both systems:
 *   - API Key (identifier)
 *   - HMAC Secret (request signing)
 *
 * Copy the output to:
 *   1. Business Side: JANJEZ_MAIN_API_KEY, JANJEZ_MAIN_API_SECRET
 *   2. Main Build:   BUSINESS_SIDE_API_KEY, BUSINESS_SIDE_HMAC_SECRET
 */

const { createHash, randomBytes } = require('crypto');

function generateApiKey() {
  // 32 bytes → 64 hex chars. Prefix with "biz_" for identification.
  return `biz_${randomBytes(32).toString('hex')}`;
}

function generateHmacSecret() {
  // 64 bytes → 128 hex chars. High entropy for HMAC signing.
  return randomBytes(64).toString('hex');
}

const apiKey = generateApiKey();
const hmacSecret = generateHmacSecret();

console.log('=== GENERATED SECRETS ===');
console.log('');
console.log('# Business Side (Vercel):');
console.log(`JANJEZ_MAIN_API_KEY=${apiKey}`);
console.log(`JANJEZ_MAIN_API_SECRET=${hmacSecret}`);
console.log('');
console.log('# Main Build (Lightsail):');
console.log(`BUSINESS_SIDE_API_KEY=${apiKey}`);
console.log(`BUSINESS_SIDE_HMAC_SECRET=${hmacSecret}`);
console.log('');
console.log('# HMAC_SECRET (shared nonce/signing salt):');
console.log(`HMAC_SECRET=${randomBytes(32).toString('hex')}`);
console.log('');
console.log('=== VERIFICATION COMMANDS ===');
console.log('');
console.log('# 1. Test main build accepts the key:');
console.log(`curl -sI -H "X-Business-Side-API-Key: ${apiKey}" \\`);
console.log(`  -H "X-Timestamp: $(date +%s)" \\`);
console.log(`  -H "X-Nonce: $(uuidgen)" \\`);
console.log(`  -H "X-Signature: test" \\`);
console.log(`  https://janjez.social/api/business/v1/health`);
console.log('');
console.log('# 2. Test business-side health check:');
console.log('curl -s https://business.janjez.social/api/health/janjez');