#!/usr/bin/env node
/**
 * Business Side ↔ Main Build integration test.
 *
 * Reads secrets from environment variables at runtime. NEVER prints secret values.
 *
 * Usage:
 *   JANJEZ_MAIN_API_KEY=biz_... JANJEZ_MAIN_API_SECRET=... node scripts/test-integration.js
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = at least one check failed
 */

const crypto = require('crypto');
const https = require('https');

const API_KEY = process.env.JANJEZ_MAIN_API_KEY;
const API_SECRET = process.env.JANJEZ_MAIN_API_SECRET;
const MAIN_API_URL = process.env.JANJEZ_MAIN_API_URL || 'https://janjez.social/api/business/v1';

if (!API_KEY || !API_SECRET) {
  console.error('ERROR: Set JANJEZ_MAIN_API_KEY and JANJEZ_MAIN_API_SECRET env vars.');
  process.exit(2);
}

function signRequest(method, path, body, timestamp, nonce, secret) {
  const bodyHash = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const payload = `${method}\n${path}\n${bodyHash}\n${timestamp}\n${nonce}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function maskKey(key) {
  if (!key) return '(unset)';
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

async function testEndpoint(method, path, body = null) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const bodyString = (method === 'GET' || !body) ? '' : JSON.stringify(body);
  const signature = signRequest(method, path, bodyString, timestamp, nonce, API_SECRET);

  return new Promise((resolve, reject) => {
    const url = new URL(`${MAIN_API_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Business-Side-API-Key': API_KEY,
        'X-Timestamp': timestamp,
        'X-Nonce': nonce,
        'X-Signature': signature,
      },
      timeout: 10000,
    };

    if (bodyString) options.body = bodyString;

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data.slice(0, 200),
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (bodyString) req.write(bodyString);
    req.end();
  });
}

async function main() {
  const results = [];
  const tests = [
    { name: 'GET /health', method: 'GET', path: '/health', expect: [200] },
    { name: 'GET /services (list)', method: 'GET', path: '/services', expect: [200, 404] },
    { name: 'GET /services/test (single)', method: 'GET', path: '/services/test', expect: [200, 401, 404] },
    { name: 'GET /orders (control)', method: 'GET', path: '/orders', expect: [401, 405] },
  ];

  console.log('=== Business Side ↔ Main Build Integration Test ===');
  console.log(`API Key: ${maskKey(API_KEY)}`);
  console.log(`API URL: ${MAIN_API_URL}`);
  console.log('');

  for (const test of tests) {
    try {
      const result = await testEndpoint(test.method, test.path);
      const ok = test.expect.includes(result.status);
      const icon = ok ? '✓' : '✗';
      const status = result.status;
      const snippet = result.body.slice(0, 80).replace(/\n/g, ' ');
      console.log(`${icon} ${test.name}: ${status} ${snippet}`);
      results.push({ name: test.name, status, ok });
    } catch (err) {
      console.log(`✗ ${test.name}: ERROR ${err.message}`);
      results.push({ name: test.name, status: null, ok: false });
    }
  }

  console.log('');
  const allOk = results.every((r) => r.ok);
  if (allOk) {
    console.log('RESULT: PASS — all checks returned expected status codes.');
  } else {
    console.log('RESULT: FAIL — one or more checks returned unexpected status codes.');
  }
  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(2);
});