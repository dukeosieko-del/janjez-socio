#!/bin/bash
set -euo pipefail

# ============================================================
# Janjez.social Lightsail Deployment + Reconciliation Import
# Branch: session/agent_200e4553-a3ec-4db9-a0c1-b2cb8f7d59af
# ============================================================

APP_DIR="/opt/janjez-socio"
CLEANED_DIR="/tmp/cleaned"
BRANCH="session/agent_200e4553-a3ec-4db9-a0c1-b2cb8f7d59af"

echo "🚀 Starting Lightsail deployment + service reconciliation..."

# 1. Pull latest code
echo "📦 Pulling latest code..."
cd "$APP_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# 3. Build
echo "🔨 Building application..."
npm run build

# 4. Restart PM2
echo "⚙️  Restarting PM2..."
pm2 restart janjez-app

# 5. Wait for app to be ready
echo "⏳ Waiting for app to be ready..."
sleep 5

# 6. Verify app is running
echo "🔍 Verifying app status..."
pm2 status
curl -s -o /dev/null -w "Homepage HTTP status: %{http_code}\n" https://janjez.social || true

# 7. Check if cleaned CSV files exist
echo "📋 Checking for cleaned CSV files..."
if [ ! -d "$CLEANED_DIR" ] || [ ! -f "$CLEANED_DIR/manifest.json" ]; then
  echo "⚠️  Cleaned CSV files not found at $CLEANED_DIR"
  echo "   Transfer them from your local machine:"
  echo "   scp -r /tmp/cleaned ubuntu@<lightsail-ip>:$CLEANED_DIR"
  exit 1
fi

echo "✅ Cleaned CSV files found:"
ls -la "$CLEANED_DIR"/*.csv 2>/dev/null || true
ls -la "$CLEANED_DIR"/*.tsv 2>/dev/null || true

# 8. Run reconciliation import
echo "🔄 Running service reconciliation import..."
cd "$APP_DIR"
npx tsx scripts/reconcile-services.ts

# 9. Final verification
echo ""
echo "=== Deployment Complete ==="
echo "Branch: $BRANCH"
echo "App: https://janjez.social"
echo ""
echo "Next steps:"
echo "1. Verify services page: https://janjez.social/services"
echo "2. Check new platforms:"
echo "   - https://janjez.social/services/snapchat"
echo "   - https://janjez.social/services/linkedin"
echo "3. Test anonymous order flow"
echo "4. Verify admin MappingTab at /admin"
echo "5. Update JANJEZ_BUILD_STATE.md with reconciliation results"
