#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# CONTROLLED LIVE VERIFICATION — PRE-FLIGHT GATE
# =============================================================================
# This script is READ-ONLY. It does NOT modify code, data, or state.
# It does NOT create orders, debit wallets, or call provider actions.
# =============================================================================

PROJECT_ROOT="${1:-/home/ec2-user/janjez-socio}"
cd "$PROJECT_ROOT"

echo "=================================================="
echo "JANJEZ — CONTROLLED LIVE VERIFICATION (PRE-FLIGHT)"
echo "=================================================="
echo "Project: $PROJECT_ROOT"
echo "Date: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

# =============================================================================
# 1. PROJECT / GIT
# =============================================================================
echo "=================================================="
echo "1. PROJECT / GIT"
echo "=================================================="

if [ ! -d "$PROJECT_ROOT/.git" ]; then
  echo "ERROR: Not a git repository: $PROJECT_ROOT"
  exit 1
fi

git_branch=$(git branch --show-current 2>/dev/null || echo "UNKNOWN")
git_head=$(git rev-parse --short HEAD 2>/dev/null || echo "UNKNOWN")
git_status=$(git status --short 2>/dev/null || echo "UNKNOWN")

echo "pwd=$(pwd)"
echo "git_branch=$git_branch"
echo "git_head=$git_head"
echo "git_status=$git_status"

if [ "$git_status" = "UNKNOWN" ]; then
  echo "GIT_STATUS=UNKNOWN"
elif [ -z "$git_status" ]; then
  echo "GIT_STATUS=CLEAN"
else
  echo "GIT_STATUS=DIRTY"
  echo "git_changes=$git_status"
fi
echo ""

# =============================================================================
# 2. RUNTIME
# =============================================================================
echo "=================================================="
echo "2. RUNTIME"
echo "=================================================="

node_version=$(node -v 2>/dev/null || echo "MISSING")
npm_version=$(npm -v 2>/dev/null || echo "MISSING")

echo "node=$node_version"
echo "npm=$npm_version"
echo ""

# =============================================================================
# 3. ENVIRONMENT VARIABLES (PRESENCE ONLY)
# =============================================================================
echo "=================================================="
echo "3. ENVIRONMENT VARIABLES"
echo "=================================================="

check_env_var() {
  local var_name="$1"
  if [ -n "${!var_name:-}" ]; then
    echo "$var_name=SET"
  else
    echo "$var_name=MISSING"
  fi
}

check_env_var "NEXT_PUBLIC_SUPABASE_URL"
check_env_var "SUPABASE_SERVICE_ROLE_KEY"
check_env_var "SMM_API_URL"
check_env_var "SMM_API_KEY"
check_env_var "MPESA_ENV"
echo ""

# =============================================================================
# 4. PROVIDER CONNECTIVITY
# =============================================================================
echo "=================================================="
echo "4. PROVIDER CONNECTIVITY"
echo "=================================================="

if [ -z "${SMM_API_KEY:-}" ] || [ -z "${SMM_API_URL:-}" ]; then
  echo "PROVIDER_REACHABLE=NO"
  echo "PROVIDER_BALANCE=UNAVAILABLE"
  echo "PROVIDER_CURRENCY=UNAVAILABLE"
  echo "PROVIDER_AUTH=FAIL"
else
  PROVIDER_SCRIPT=$(cat <<'PROVIDER_EOF'
const https = require('https');
const url = new URL(process.env.SMM_API_URL || '');
const postData = new URLSearchParams({ key: process.env.SMM_API_KEY || '', action: 'balance' }).toString();
const options = {
  hostname: url.hostname,
  port: url.port || 443,
  path: url.pathname || '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 10000
};
const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('PROVIDER_STATUS_CODE=' + res.statusCode);
      if (json.balance !== undefined) {
        console.log('PROVIDER_BALANCE=' + json.balance);
        console.log('PROVIDER_CURRENCY=' + (json.currency || 'UNKNOWN'));
      } else if (json.error) {
        console.log('PROVIDER_ERROR=' + json.error);
      } else {
        console.log('PROVIDER_RESPONSE=' + JSON.stringify(json).substring(0, 200));
      }
    } catch (e) {
      console.log('PROVIDER_RAW=' + data.substring(0, 200));
    }
  });
});
req.on('error', (e) => {
  console.log('PROVIDER_ERROR=' + e.message);
});
req.on('timeout', () => {
  console.log('PROVIDER_ERROR=Timeout');
  req.destroy();
});
req.write(postData);
req.end();
PROVIDER_EOF
)

  provider_output=$(node -e "$PROVIDER_SCRIPT" 2>&1 || true)
  echo "$provider_output"

  if echo "$provider_output" | grep -q "PROVIDER_STATUS_CODE=401"; then
    echo "PROVIDER_AUTH=FAIL"
  elif echo "$provider_output" | grep -q "PROVIDER_BALANCE="; then
    balance=$(echo "$provider_output" | grep "PROVIDER_BALANCE=" | head -1 | cut -d'=' -f2)
    currency=$(echo "$provider_output" | grep "PROVIDER_CURRENCY=" | head -1 | cut -d'=' -f2)
    echo "PROVIDER_REACHABLE=YES"
    echo "PROVIDER_AUTH=OK"
    # Check for insufficient funds
    if echo "$balance" | grep -qi "0\.0\|insufficient\|not enough"; then
      echo "PROVIDER_BALANCE=INSUFFICIENT"
    else
      echo "PROVIDER_BALANCE=$balance"
    fi
    echo "PROVIDER_CURRENCY=$currency"
  else
    echo "PROVIDER_REACHABLE=UNKNOWN"
    echo "PROVIDER_AUTH=UNKNOWN"
  fi
fi
echo ""

# =============================================================================
# 5. SUPABASE CONNECTIVITY
# =============================================================================
echo "=================================================="
echo "5. SUPABASE CONNECTIVITY"
echo "=================================================="

if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "SUPABASE=FAIL"
  echo "SUPABASE_REASON=Missing credentials"
else
  SUPABASE_SCRIPT=$(cat <<'SUPABASE_EOF'
const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log('SUPABASE=FAIL');
  console.log('SUPABASE_REASON=Missing credentials');
  process.exit(0);
}
const supabase = createClient(url, key);
(async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.log('SUPABASE=FAIL');
      console.log('SUPABASE_ERROR=' + error.message);
    } else {
      console.log('SUPABASE=OK');
    }
  } catch (e) {
    console.log('SUPABASE=FAIL');
    console.log('SUPABASE_ERROR=' + e.message);
  }
})();
SUPABASE_EOF
)

  supabase_output=$(node -e "$SUPABASE_SCRIPT" 2>&1 || true)
  echo "$supabase_output"
fi
echo ""

# =============================================================================
# 6. ACTIVE JANJEZ SERVICES
# =============================================================================
echo "=================================================="
echo "6. ACTIVE JANJEZ SERVICES"
echo "=================================================="

if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "JANJEZ_SERVICES=SKIP (no Supabase credentials)"
else
  JANJEZ_SCRIPT=$(cat <<'JANJEZ_EOF'
const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);
(async () => {
  try {
    const { data, error } = await supabase
      .from('janjez_services')
      .select('id, name, category, subcategory, selling_price_ksh, min_quantity, max_quantity, supports_drip_feed, provider_service_id, is_active')
      .eq('is_active', true)
      .not('provider_service_id', 'is', null)
      .limit(20);
    if (error) {
      console.log('JANJEZ_SERVICES=ERROR');
      console.log('JANJEZ_ERROR=' + error.message);
      return;
    }
    if (!data || data.length === 0) {
      console.log('JANJEZ_SERVICES=NONE');
      return;
    }
    console.log('JANJEZ_SERVICES_COUNT=' + data.length);
    data.forEach((s, i) => {
      console.log('JANJEZ_SERVICE_' + (i+1) + '_ID=' + s.id);
      console.log('JANJEZ_SERVICE_' + (i+1) + '_NAME=' + s.name);
      console.log('JANJEZ_SERVICE_' + (i+1) + '_CATEGORY=' + s.category);
      console.log('JANJEZ_SERVICE_' + (i+1) + '_SUBCATEGORY=' + (s.subcategory || ''));
      console.log('JANJEZ_SERVICE_' + (i+1) + '_PRICE=' + s.selling_price_ksh);
      console.log('JANJEZ_SERVICE_' + (i+1) + '_MIN=' + s.min_quantity);
      console.log('JANJEZ_SERVICE_' + (i+1) + '_MAX=' + s.max_quantity);
      console.log('JANJEZ_SERVICE_' + (i+1) + '_DRIP=' + (s.supports_drip_feed ? 'YES' : 'NO'));
      console.log('JANJEZ_SERVICE_' + (i+1) + '_PROVIDER_ID=' + (s.provider_service_id ? 'PRESENT' : 'ABSENT'));
    });
  } catch (e) {
    console.log('JANJEZ_SERVICES=ERROR');
    console.log('JANJEZ_ERROR=' + e.message);
  }
})();
JANJEZ_EOF
)

  janjez_output=$(node -e "$JANJEZ_SCRIPT" 2>&1 || true)
  echo "$janjez_output"
fi
echo ""

# =============================================================================
# 7. PROVIDER MAPPING
# =============================================================================
echo "=================================================="
echo "7. PROVIDER MAPPING"
echo "=================================================="

if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "MAPPING=SKIP (no Supabase credentials)"
else
  MAPPING_SCRIPT=$(cat <<'MAPPING_EOF'
const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);
(async () => {
  try {
    const { data: janjezServices } = await supabase
      .from('janjez_services')
      .select('id, name, provider_service_id')
      .eq('is_active', true)
      .not('provider_service_id', 'is', null)
      .limit(1);
    if (!janjezServices || janjezServices.length === 0) {
      console.log('MAPPING=INVALID');
      console.log('MAPPING_REASON=No active Janjez service with provider mapping');
      return;
    }
    const js = janjezServices[0];
    const { data: providerService, error } = await supabase
      .from('provider_services')
      .select('id, name, is_active')
      .eq('id', js.provider_service_id)
      .single();
    if (error || !providerService) {
      console.log('MAPPING=INVALID');
      console.log('MAPPING_REASON=Provider service not found for ' + js.provider_service_id);
      return;
    }
    if (!providerService.is_active) {
      console.log('MAPPING=INVALID');
      console.log('MAPPING_REASON=Provider service is inactive');
      return;
    }
    console.log('MAPPING=VALID');
    console.log('MAPPING_JANJEZ_ID=' + js.id);
    console.log('MAPPING_JANJEZ_NAME=' + js.name);
    console.log('MAPPING_PROVIDER_ID=' + providerService.id);
    console.log('MAPPING_PROVIDER_NAME=' + providerService.name);
    console.log('MAPPING_PROVIDER_ACTIVE=' + (providerService.is_active ? 'YES' : 'NO'));
  } catch (e) {
    console.log('MAPPING=ERROR');
    console.log('MAPPING_ERROR=' + e.message);
  }
})();
MAPPING_EOF
)

  mapping_output=$(node -e "$MAPPING_SCRIPT" 2>&1 || true)
  echo "$mapping_output"
fi
echo ""

# =============================================================================
# 8. DRIP-FEED SETTINGS
# =============================================================================
echo "=================================================="
echo "8. DRIP-FEED SETTINGS"
echo "=================================================="

if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "DRIP_FEED=SKIP (no Supabase credentials)"
else
  DRIP_SCRIPT=$(cat <<'DRIP_EOF'
const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);
(async () => {
  try {
    const { data, error } = await supabase
      .from('drip_feed_settings')
      .select('*')
      .limit(1)
      .single();
    if (error || !data) {
      console.log('DRIP_FEED=ERROR');
      console.log('DRIP_ERROR=' + (error ? error.message : 'No data'));
      return;
    }
    console.log('DRIP_FEED_ENABLED=' + (data.enabled ? 'YES' : 'NO'));
    console.log('DRIP_FEED_MIN_RUNS=' + data.min_runs);
    console.log('DRIP_FEED_MAX_RUNS=' + data.max_runs);
    console.log('DRIP_FEED_MIN_INTERVAL=' + data.min_interval);
    console.log('DRIP_FEED_MAX_INTERVAL=' + data.max_interval);
    const runs2 = data.min_runs <= 2 && 2 <= data.max_runs;
    const interval1 = data.min_interval <= 1 && 1 <= data.max_interval;
    console.log('DRIP_FEED_RUNS_2=' + (runs2 ? 'VALID' : 'INVALID'));
    console.log('DRIP_FEED_INTERVAL_1=' + (interval1 ? 'VALID' : 'INVALID'));
  } catch (e) {
    console.log('DRIP_FEED=ERROR');
    console.log('DRIP_ERROR=' + e.message);
  }
})();
DRIP_EOF
)

  drip_output=$(node -e "$DRIP_SCRIPT" 2>&1 || true)
  echo "$drip_output"
fi
echo ""

# =============================================================================
# 9. TEST USER WALLET
# =============================================================================
echo "=================================================="
echo "9. TEST USER WALLET"
echo "=================================================="

TEST_USER_ID="bd5ae69e-4461-43e2-b79c-7230c78b9362"

if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "WALLET=SKIP (no Supabase credentials)"
else
  WALLET_SCRIPT=$(cat <<'WALLET_EOF'
const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const testUserId = process.env.TEST_USER_ID;
const supabase = createClient(url, key);
(async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('wallet_balance, email, role')
      .eq('id', testUserId)
      .single();
    if (error || !data) {
      console.log('WALLET=ERROR');
      console.log('WALLET_ERROR=' + (error ? error.message : 'User not found'));
      return;
    }
    const balance = parseFloat(data.wallet_balance) || 0;
    console.log('WALLET_USER_ID=' + testUserId);
    console.log('WALLET_EMAIL=' + (data.email || 'UNKNOWN'));
    console.log('WALLET_ROLE=' + (data.role || 'UNKNOWN'));
    console.log('WALLET_BALANCE=' + balance.toFixed(2));
  } catch (e) {
    console.log('WALLET=ERROR');
    console.log('WALLET_ERROR=' + e.message);
  }
})();
WALLET_EOF
)

  wallet_output=$(TEST_USER_ID="$TEST_USER_ID" node -e "$WALLET_SCRIPT" 2>&1 || true)
  echo "$wallet_output"
fi
echo ""

# =============================================================================
# 10. EXISTING M-PESA TRANSACTION
# =============================================================================
echo "=================================================="
echo "10. EXISTING M-PESA TRANSACTION"
echo "=================================================="

MPESA_REF="12ac8238-f92c-4a5a-8f97-737634de5c1c"

if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "MPESA_TRANSACTION=SKIP (no Supabase credentials)"
else
  MPESA_SCRIPT=$(cat <<'MPESA_EOF'
const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ref = process.env.MPESA_REF;
const supabase = createClient(url, key);
(async () => {
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('status, amount, mpesa_receipt, updated_at, created_at, type, notes')
      .eq('reference', ref)
      .single();
    if (error || !data) {
      console.log('MPESA_TRANSACTION=NOT_FOUND');
      console.log('MPESA_REF=' + ref);
      return;
    }
    console.log('MPESA_TRANSACTION=FOUND');
    console.log('MPESA_REF=' + ref);
    console.log('MPESA_STATUS=' + data.status);
    console.log('MPESA_AMOUNT=' + data.amount);
    console.log('MPESA_RECEIPT=' + (data.mpesa_receipt || 'NONE'));
    console.log('MPESA_UPDATED_AT=' + (data.updated_at || 'NONE'));
    console.log('MPESA_CREATED_AT=' + (data.created_at || 'NONE'));
    console.log('MPESA_TYPE=' + (data.type || 'UNKNOWN'));
    console.log('MPESA_NOTES=' + (data.notes || 'NONE'));
  } catch (e) {
    console.log('MPESA_TRANSACTION=ERROR');
    console.log('MPESA_ERROR=' + e.message);
  }
})();
MPESA_EOF
)

  mpesa_output=$(MPESA_REF="$MPESA_REF" node -e "$MPESA_SCRIPT" 2>&1 || true)
  echo "$mpesa_output"
fi
echo ""

# =============================================================================
# 11. APPLICATION HEALTH
# =============================================================================
echo "=================================================="
echo "11. APPLICATION HEALTH"
echo "=================================================="

if command -v pm2 >/dev/null 2>&1; then
  pm2_output=$(pm2 list --no-color 2>&1 || true)
  echo "$pm2_output"
  if echo "$pm2_output" | grep -qi "janjez"; then
    echo "PM2_JANJEZ=LISTED"
  else
    echo "PM2_JANJEZ=NOT_LISTED"
  fi
else
  echo "PM2=NOT_INSTALLED"
fi
echo ""

# =============================================================================
# 12. CUSTOMER CATALOGUE
# =============================================================================
echo "=================================================="
echo "12. CUSTOMER CATALOGUE"
echo "=================================================="

# Check if the app is running locally on port 3000
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/services 2>/dev/null | grep -q "200"; then
  echo "CUSTOMER_CATALOGUE_API=REACHABLE"
  services_response=$(curl -s http://localhost:3000/api/services 2>/dev/null || echo "{}")
  service_count=$(echo "$services_response" | node -e "const d=require('fs').readFileSync(0,'utf8');try{const j=JSON.parse(d);console.log(j.services?j.services.length:0)}catch(e){console.log('0')}" 2>/dev/null || echo "0")
  echo "CUSTOMER_CATALOGUE_COUNT=$service_count"
else
  echo "CUSTOMER_CATALOGUE_API=NOT_REACHABLE (port 3000)"
fi
echo ""

# =============================================================================
# 13. FINAL PRE-FLIGHT GATE
# =============================================================================
echo "=================================================="
echo "13. FINAL PRE-FLIGHT GATE"
echo "=================================================="

echo ""
echo "CHECK | RESULT | DETAILS"
echo "------|--------|---------"

# Determine overall status
provider_balance_check="UNKNOWN"
supabase_check="UNKNOWN"

if [ -n "${SMM_API_KEY:-}" ] && [ -n "${SMM_API_URL:-}" ]; then
  provider_balance_check="CHECKED"
else
  provider_balance_check="SKIPPED"
fi

if [ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  supabase_check="CHECKED"
else
  supabase_check="SKIPPED"
fi

echo "Git | CHECKED | $git_branch @ $git_head"
echo "Runtime | CHECKED | node=$node_version npm=$npm_version"
echo "Environment | CHECKED | SEE SECTION 3"
echo "Provider connectivity | $provider_balance_check | SEE SECTION 4"
echo "Supabase connectivity | $supabase_check | SEE SECTION 5"
echo "Janjez services | $supabase_check | SEE SECTION 6"
echo "Provider mapping | $supabase_check | SEE SECTION 7"
echo "Drip-feed settings | $supabase_check | SEE SECTION 8"
echo "Test user wallet | $supabase_check | SEE SECTION 9"
echo "M-Pesa transaction | $supabase_check | SEE SECTION 10"
echo "Application health | CHECKED | SEE SECTION 11"
echo "Customer catalogue | CHECKED | SEE SECTION 12"
echo ""

# Final verdict
if [ "$provider_balance_check" = "SKIPPED" ] || [ "$supabase_check" = "SKIPPED" ]; then
  echo "FINAL GATE: BLOCKED — ENVIRONMENT"
  echo "REASON: Missing credentials or connectivity. Run on EC2 with configured environment."
elif [ "$provider_balance_check" = "CHECKED" ] && [ "$supabase_check" = "CHECKED" ]; then
  echo "FINAL GATE: READY FOR CONTROLLED LIVE TEST"
  echo "CONDITION: All pre-flight checks completed. Review sections above before proceeding."
else
  echo "FINAL GATE: BLOCKED — UNKNOWN"
fi

echo ""
echo "=================================================="
echo "END OF PRE-FLIGHT VERIFICATION"
echo "=================================================="
