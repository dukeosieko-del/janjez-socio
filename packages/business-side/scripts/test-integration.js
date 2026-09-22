#!/usr/bin/env node
/**
 * Test the Business Side ↔ Main Build API integration end-to-end.
 *
 * Signs a request exactly as the business-side client does, then verifies
 * the main build accepts it. Run this BEFORE configuring production secrets
 * to confirm the integration contract works.
 *
 * Usage: node scripts/test-integration.js
 */

const crypto = require('crypto');
const https = require('https');

const API_KEY = process.argv[2] || 'biz_test_key';
const API_SECRET = process.argv[3] || 'test_secret_1234567890abcdef';
const MAIN_API_URL = process.env.JANJEZ_MAIN_API_URL || 'https://janjez.social/api/business/v1';

function signRequest(method, path, body, timestamp, nonce, secret) {
  const bodyHash = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const payload = `${method}\n${path}\n${bodyHash}\n${timestamp}\n${nonce}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
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
          headers: Object.keys(res.headers).filter((h) => h.startsWith('x-')),
          body: data.slice(0, 300),
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
  console.log('=== Business Side ↔ Main Build Integration Test ===');
  console.log(`API Key: ${API_KEY.slice(0, 12)}...`);
  console.log(`API URL: ${MAIN_API_URL}`);
  console.log('');

  const tests = [
    { name: 'GET /health', method: 'GET', path: '/health' },
    { name: 'GET /services', method: 'GET', path: '/services' },
    { name: 'GET /orders (control)', method: 'GET', path: '/orders' },
  ];

  for (const test of tests) {
    try {
      const result = await testEndpoint(test.method, test.path);
      const status = result.status;
      let icon = '✓';
      if (status >= 400 && status < 500) icon = '⚠️ (expected auth error)';
      if (status >= 500) icon = '❌';
      console.log(`${icon} ${test.name}: ${status} ${result.body.slice(0, 100)}`);
    } catch (err) {
      console.log(`❌ ${test.name}: ${err.message}`);
    }
  }

  console.log('');
  console.log('=== Interpretation ===');
  console.log('✓ 200 = API key accepted, integration working');
  console.log('⚠️ 401/403 = API key rejected — check BUSINESS_SIDE_API_KEY on main build');
  console.log('❌ 500 = Server error — check main build logs');
  console.log('❌ Connection error = Main build not reachable');
}

main().catch(console.error);