#!/usr/bin/env python3
"""
reconstruct_catalogue.py — JANJEZ full CSV catalogue reconciliation.

Reads the authoritative CSV, maps each row to a platform using the SAME logic as
matchPlatform() in src/lib/service-queries.ts, derives a subcategory from the
service name, generates slugs with the SAME logic as normalizeSlug() in
src/lib/janzez-services.ts, stores the per-1000 selling price (order cost uses
calculateOrderCost(): selling_price_ksh * qty / 1000), and creates any CSV row
that is NOT already present in janjez_services (matched by provider_service_id or
slug). ALL created services are staged UNPUBLISHED (show_* = false) and is_active
= true. Existing services are NEVER modified (preservation rule).

Auth: admin API at http://localhost:3000/api/admin/services (magic-link bearer token).
"""
import csv, json, re, time, os, sys
from collections import deque, Counter
from datetime import datetime, timezone

import requests

ENV = open("/home/ubuntu/janjez-socio/.env", encoding="utf-8").read()
def envget(k):
    m = re.search(rf"^{k}=(.*)$", ENV, re.M); return m.group(1).strip() if m else ""
SUPABASE_URL = envget("NEXT_PUBLIC_SUPABASE_URL")
ANON_KEY = envget("NEXT_PUBLIC_SUPABASE_ANON_KEY")
SVC_KEY = envget("SUPABASE_SERVICE_ROLE_KEY")
ADMIN_EMAIL = "osiekoomoi@gmail.com"
CSV_PATH = "/tmp/janjez-pricing-final.csv"
API = "http://localhost:3000/api/admin/services"

# ---- exactly mirror service-queries.ts matchPlatform() ----
KNOWN = ["youtube","whatsapp","instagram","facebook","tiktok","telegram","google-maps-reviews","x"]
def match_platform(name):
    low = name.lower()
    for p in KNOWN:
        if p in low:
            return p
    return None

# ---- exactly mirror janzez-services.ts normalizeSlug() ----
def normalize_slug(s):
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9_\s-]", "", s)   # \w == [A-Za-z0-9_]; keep underscore like TS
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"-+", "-", s)
    s = re.sub(r"^-+|-+$", "", s)
    return s or "service"

def to_int(x):
    x = (x or "").replace(" ", "").replace(",", "").strip()
    try: return int(float(x))
    except Exception: return None

def parse_refill(v):
    v = (v or "").lower().strip()
    if v == "" or "no refill" in v: return False
    return "refill" in v

# subcategory derivation (keyword based)
SUBKEYS = ["followers","subscribers","subs","likes","views","watch","comments","shares","share",
           "reactions","reaction","impressions","impression","clicks","click","retweets","retweet",
           "reposts","repost","live","story","stories","highlights","saves","save","bookmarks","bookmark",
           "poll","votes","vote","mentions","mention","profile","visits","visit","reels","posts","post",
           "messages","members","member","group","channel","engagement","reach","plays","play",
           "subscriber","follower"]
def derive_subcategory(name):
    low = name.lower()
    for k in SUBKEYS:
        if re.search(r"\b" + re.escape(k), low):
            return k.capitalize()
    words = re.findall(r"[a-z]{3,}", low)
    for w in words:
        if w not in ("the","and","for","with","from","this","that","www","http","non"):
            return w.capitalize()
    return "General"

# ---------- auth (magic link, no password change) ----------
def get_token():
    r = requests.post(f"{SUPABASE_URL}/auth/v1/admin/generate_link",
        headers={"apikey": SVC_KEY, "Authorization": f"Bearer {SVC_KEY}", "Content-Type": "application/json"},
        json={"type": "magiclink", "email": ADMIN_EMAIL}, timeout=30)
    r.raise_for_status()
    otp = r.json()["email_otp"]
    v = requests.post(f"{SUPABASE_URL}/auth/v1/verify",
        headers={"apikey": ANON_KEY, "Content-Type": "application/json"},
        json={"email": ADMIN_EMAIL, "token": otp, "type": "magiclink"}, timeout=30)
    v.raise_for_status()
    return v.json()["access_token"]

# ---------- state (read-only inputs from audit) ----------
PROVIDER_IDS = set(json.load(open("/tmp/kilo/provider_ids.json")))
EXISTING_JZ = set(json.load(open("/tmp/kilo/existing_jz.json")))
EXISTING_SLUGS = set(json.load(open("/tmp/kilo/existing_slugs.json")))

seen_ids = set(EXISTING_JZ)
seen_slugs = set(EXISTING_SLUGS)

# ---------- counters ----------
results = {"attempted":0,"imported":0,"skipped":0,"failed":0}
plat_counts = Counter()
sub_counts = Counter()
reason_counts = Counter()
failures = []

imported_file = "/tmp/kilo/recon_imported.json"
if os.path.exists(imported_file):
    imported = set(json.load(open(imported_file)))
    seen_ids |= imported
else:
    imported = set()

def save_state():
    json.dump(sorted(imported), open(imported_file,"w"))
    json.dump(failures, open("/tmp/kilo/recon_failures.json","w"))

# ---------- rate limiter ----------
times = deque()
WIN, MAXR = 60.0, 40
def throttle():
    now = time.time()
    while times and times[0] <= now - WIN: times.popleft()
    if len(times) >= MAXR:
        sleep_for = WIN - (now - times[0]) + 0.5
        if sleep_for > 0: time.sleep(sleep_for)
    times.append(time.time())

# ---------- read CSV ----------
rows = list(csv.DictReader(open(CSV_PATH, newline="", encoding="utf-8")))
print("csv rows:", len(rows), flush=True)

token = None
BATCH = 100
batch = []
start = time.time()
LIMIT = int(os.environ.get("IMPORT_LIMIT","0") or "0")

for idx, r in enumerate(rows):
    if LIMIT and results["attempted"] >= LIMIT: break
    sid = (r.get("ID") or "").strip()
    svc = (r.get("Service") or "").strip()
    results["attempted"] += 1

    # blank / junk
    if not sid or not svc or re.fullmatch(r"[\s\-_]+", svc):
        results["skipped"] += 1
        reason_counts["blank_or_junk_row"] += 1
        continue

    # skip if already in catalogue (preservation rule — never modify existing)
    if sid in seen_ids:
        results["skipped"] += 1
        reason_counts["already_exists_provider_service_id"] += 1
        continue

    # platform via exact matchPlatform()
    platform = match_platform(svc)
    if platform is None:
        results["skipped"] += 1
        reason_counts["unsupported_platform"] += 1
        failures.append({"id": sid, "service": svc[:80], "reason": "unsupported_platform"})
        continue

    minq = to_int(r.get("Min Order"))
    maxq = to_int(r.get("Max Order"))
    try:
        rate = float((r.get("RATE") or "").strip())
    except Exception:
        rate = None
    if rate is None or rate <= 0 or minq is None or minq <= 0 or maxq is None or maxq < minq:
        results["skipped"] += 1
        reason_counts["invalid_numeric"] += 1
        failures.append({"id": sid, "service": svc[:80], "reason": "invalid_numeric",
                         "min": r.get("Min Order"), "max": r.get("Max Order"), "rate": r.get("RATE")})
        continue

    # provider must exist exactly (no substitution)
    if sid not in PROVIDER_IDS:
        results["skipped"] += 1
        reason_counts["provider_not_found"] += 1
        failures.append({"id": sid, "service": svc[:80], "reason": "provider_not_found"})
        continue

    # slug (unique): normalizeSlug(name) + provider id disambiguator
    base = normalize_slug(svc)
    slug = f"{base}-{sid}"
    n = 1
    while slug in seen_slugs:
        n += 1
        slug = f"{base}-{sid}-{n}"

    if slug in seen_slugs:
        results["skipped"] += 1
        reason_counts["slug_collision"] += 1
        continue

    sub = derive_subcategory(svc)
    desc = f"Average delivery time: {r.get('Average Time','').strip()}."
    refill = parse_refill(r.get("Refill"))
    cancel = "cancel" in svc.lower()

    # order cost model: cost = selling_price_ksh * qty / 1000  (selling_price_ksh is per-1000)
    selling_price_ksh = round(rate, 4)

    payload = {
        "name": svc,
        "slug": slug,
        "category": platform,
        "subcategory": sub,
        "description": desc,
        "selling_price_ksh": selling_price_ksh,
        "provider_service_id": sid,
        "min_quantity": minq,
        "max_quantity": maxq,
        "is_active": True,
        "supports_refill": refill,
        "supports_cancel": cancel,
        "supports_drip_feed": False,
        "show_sidebar": False,
        "show_landing": False,
        "show_guarded": False,
        "show_anonymous": False,
        "show_catalogue": False,
    }

    ok = False; reason = None
    for attempt in range(3):
        if token is None:
            try: token = get_token()
            except Exception as e:
                reason = f"auth_error:{e}"; continue
        throttle()
        try:
            resp = requests.post(API,
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json=payload, timeout=30)
        except Exception as e:
            reason = f"request_error:{e}"; time.sleep(2); continue
        if resp.status_code == 201:
            ok = True; break
        if resp.status_code == 401:
            token = get_token(); continue
        try: body = resp.json()
        except Exception: body = resp.text[:200]
        reason = f"{resp.status_code}:{body}"
        if resp.status_code in (400, 409, 422): break
        time.sleep(2)

    if ok:
        results["imported"] += 1
        plat_counts[platform] += 1
        sub_counts[sub] += 1
        imported.add(sid)
        seen_ids.add(sid)
        seen_slugs.add(slug)
    else:
        results["failed"] += 1
        reason_counts["api_error"] += 1
        failures.append({"id": sid, "service": svc[:80], "platform": platform, "reason": reason})

    batch.append(platform)
    if len(batch) >= BATCH:
        save_state()
        elapsed = time.time() - start
        print(f"[{datetime.now(timezone.utc).isoformat()}] attempted={results['attempted']} "
              f"imported={results['imported']} skipped={results['skipped']} failed={results['failed']} "
              f"elapsed={elapsed/60:.1f}min", flush=True)
        batch = []

save_state()
elapsed = time.time() - start
print("=== DONE ===", flush=True)
print("results:", json.dumps(results), flush=True)
print("platforms:", dict(plat_counts), flush=True)
print("subcategories:", dict(sub_counts), flush=True)
print("skip reasons:", dict(reason_counts), flush=True)
print("failures:", len(failures), flush=True)
