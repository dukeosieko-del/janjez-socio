BUILD STATE - janjez.social
==========================

Date: 2026-10-22T09:47:28Z
Branch: optimize/mobile-perf
Commit: 544e0fb
Author: auto
Message: fix: mpesa order/wallet flow, reconcile stuck txs, deposit salutation, admin ledger failures, mobile/responsive fixes, blog/service CTAs, build optimization

Environment
------------
Node: v22.23.2
Next.js: 16.2.10
Platform: linux x64
Working dir: /home/ubuntu/janjez-socio

Git state
---------
On branch optimize/mobile-perf
nothing to commit, working tree clean

Typecheck
---------
tsc --noEmit: 0 errors

Lint
----
eslint (changed files): 0 errors, 5 warnings (react-hooks/set-state-in-effect in deposit/success, unused imports)
Full eslint run: pre-existing warnings only

Tests
-----
vitest run: 25 test files passed, 243 tests passed (0 failed)

Build
-----
next build (TURBOPACK=0): compiled successfully
Pages: 86
Build ID: ZdIhfpSDBXfiDyFrJSoWd
standalone output: built and deployed

Key fixes
---------
- MPESA: wallet/credit_wallet and debit_wallet RPC results unwrapped (array rows). Orders can be paid from wallet balance or via M-Pesa; callback credits wallet for topups and fulfills order-paid M-Pesa transactions. Added /api/mpesa/reconcile to settle stuck pending txs (idempotent). STK push supports orderId.
- Deposit success: /deposit/success with copy "Congratulations on making your deposit!" and CTAs to dashboard/services.
- Admin: ledger classifies failed wallet_transactions with status and reason; order actions/admin mutations reviewed.
- Mobile: viewport meta, global overflow/hover fixes for touch devices, responsive tables/containers.
- Services: catalog/detail pages fit screen; "View"/"Order Now" routes to actual service pages.
- Blog: service-related CTAs added to articles.
- Assets: Snapchat icon corrected to canonical glyph; snapchat-icon.png fixed to real PNG.
- Docker/PM2: rebuilt images, containers recreated, healthy. Routes OK on :3000, :3001, :8080, https://janjez.social.

Deployed
--------
PM2 janjez-app: online (cluster)
Docker janjez-socio: healthy (port 3001)
Docker janjez-nginx: healthy (port 8080)
Public: https://janjez.social (200, health ok)
