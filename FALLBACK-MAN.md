FALLBACK MANUAL (janjez.social)
===============================

Last verified stable: commit 71fcfc0 on branch FALLBACK
Build ID: ZdIhfpSDBXfiDyFrJSoWd
Date: 2026-10-22T09:47:28Z
Health: PM2 online, Docker healthy, https://janjez.social 200

When to use
-----------
Use this if the current deployment breaks (build failure, runtime crash, broken auth/payments) and you need to restore to this known-good state quickly.

Quick restore (on the server)
-----------------------------
1. Switch to fallback
   cd /home/ubuntu/janjez-socio
   git fetch origin
   git checkout FALLBACK
   git reset --hard origin/FALLBACK

2. Install deps (if node_modules changed)
   npm ci --no-audit --no-fund

3. Rebuild and deploy
   TURBOPACK=0 npm run build
   npm run postbuild  (copies static/public to standalone)
   pm2 restart janjez-app --update-env
   docker compose build app
   docker rm -f janjez-socio && docker run -d --name janjez-socio --restart unless-stopped --network janjez-socio_default -p 127.0.0.1:3001:3000 --env-file /tmp/kilo/janjez-container.env --health-cmd "curl -sf http://localhost:3000" --health-interval 30s --health-timeout 10s --health-retries 3 --health-start-period 40s janjez-socio-app:latest
   sudo systemctl reload nginx  (or restart)

4. Verify
   curl -s http://127.0.0.1:3000/api/health
   curl -s http://127.0.0.1:3001/api/health
   curl -s http://127.0.0.1:8080/api/health
   curl -s https://janjez.social/api/health

Key invariants (do not break)
-----------------------------
- MPESA: STK callback must reach /api/mpesa/callback. Never log full secrets.
- Wallet: debit_wallet/credit_wallet return arrays; code unwraps them.
- Orders paid via wallet or M-Pesa must be fulfilled correctly.
- /deposit/success must exist with "Congratulations on making your deposit!" and CTAs.
- Admin ledger must show failed transactions as failed.
- Build artifacts in .next/standalone must include static/ and public/.

Rollback notes
--------------
- This branch contains the entire stable tree at 71fcfc0.
- JANJEZ_BUILD_STATE.md on this branch is the authoritative build record.
- If containers/env changed, reuse /tmp/kilo/janjez-container.env.

Contact
-------
See JANJEZ_BUILD_STATE.md for full details.
