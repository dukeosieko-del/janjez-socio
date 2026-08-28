#!/usr/bin/env python3
"""
Janjez CSV -> /api/admin/services importer.
- Authenticates as admin via Supabase magic-link (no password change, no schema alteration).
- Maps each service to one of the 8 Janjez platforms.
- Imports in batches of 100, rate-limited, resumable.
"""
import csv, json, re, time, os, sys
from collections import deque, Counter
from datetime import datetime, timezone

import requests

# ---------- config ----------
ENV = open(".env", encoding="utf-8").read()
def envget(k):
    m = re.search(rf"^{k}=(.*)$", ENV, re.M)
    return m.group(1).strip() if m else ""
SUPABASE_URL = envget("NEXT_PUBLIC_SUPABASE_URL")
ANON_KEY = envget("NEXT_PUBLIC_SUPABASE_ANON_KEY")
SVC_KEY = envget("SUPABASE_SERVICE_ROLE_KEY")
ADMIN_EMAIL = "osiekoomoi@gmail.com"
CSV_PATH = "/tmp/kilo/pricing.csv"
API = "http://localhost:3000/api/admin/services"
PROVIDER_IDS = set(json.load(open("/tmp/kilo/provider_ids.json")))
EXISTING_JZ_IDS = set(json.load(open("/tmp/kilo/existing_jz.json")))
EXISTING_SLugs = set(json.load(open("/tmp/kilo/existing_slugs.json")))

KNOWN = ["youtube","whatsapp","instagram","facebook","tiktok","telegram","google-maps-reviews","x"]
SUBKEYS = ["followers","subscribers","likes","views","watch","comments","shares","share",
           "reactions","reaction","impressions","impression","clicks","click","retweets","retweet",
           "reposts","repost","live","story","highlights","saves","save","bookmarks","bookmark",
           "poll","votes","vote","mentions","mention","profile","visits","visit","reels","posts",
           "messages","members","group","channel","subs","engagement","reach","plays","play"]

# ---------- helpers ----------
def match_platform(name):
    low = name.lower()
    for p in KNOWN:
        if p in low:
            return p
    # rebrand / spacing fallbacks so all 8 platforms are reachable
    if "twitter" in low:
        return "x"
    if "google map" in low or "googlemap" in low or "gmb" in low or "maps review" in low:
        return "google-maps-reviews"
    return None

def normalize_slug(s):
    s = s.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"-+", "-", s)
    s = s.strip("-") or "service"
    return s

def to_int(x):
    x = (x or "").replace(" ", "").replace(",", "").strip()
    try:
        return int(float(x))
    except Exception:
        return None

def parse_refill(v):
    v = (v or "").lower().strip()
    if v == "" or "no refill" in v:
        return False
    if "refill" in v:
        return True
    return False

def derive_subcategory(name):
    low = name.lower()
    for k in SUBKEYS:
        if re.search(r"\b" + re.escape(k), low):
            return k.capitalize()
    # fall back to first meaningful word after stripping emoji/platform
    words = re.findall(r"[a-z]{3,}", low)
    for w in words:
        if w not in ("the","and","for","with","from","this","that","www","http"):
            return w.capitalize()
    return "General"

# ---------- auth (magic link, no password change) ----------
def get_token():
    # generate magic link
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

token = get_token()
print("token acquired len", len(token), flush=True)

# ---------- rate limiter (<=50/min) ----------
REQ_WINDOW = 60.0
REQ_MAX = 42
times = deque()

def throttle():
    now = time.time()
    while times and times[0] <= now - REQ_WINDOW:
        times.popleft()
    if len(times) >= REQ_MAX:
        sleep_for = REQ_WINDOW - (now - times[0]) + 0.5
        if sleep_for > 0:
            time.sleep(sleep_for)
    times.append(time.time())

# ---------- state / logging ----------
imported_file = "/tmp/kilo/imported.json"
failures_file = "/tmp/kilo/failures.json"
if os.path.exists(imported_file):
    imported = set(json.load(open(imported_file)))
else:
    imported = set()
failures = []
if os.path.exists(failures_file):
    failures = json.load(open(failures_file))
seen_slugs = set(EXISTING_SLugs)
seen_ids = set(EXISTING_JZ_IDS) | imported

results = {"attempted":0,"imported":0,"skipped":0,"failed":0}
plat_counts = Counter()
reason_counts = Counter()

def save_state():
    json.dump(sorted(imported), open(imported_file,"w"))
    json.dump(failures, open(failures_file,"w"))

# ---------- read CSV ----------
rows = list(csv.DictReader(open(CSV_PATH, newline="", encoding="utf-8")))
print("csv rows:", len(rows), flush=True)

def is_junk(r):
    svc = (r.get("Service") or "").strip()
    sid = (r.get("ID") or "").strip()
    if not sid or not svc:
        return True
    if re.fullmatch(r"[\s\-_]+", svc):
        return True
    return False

batch = []
BATCH_SIZE = 100
total = 0
start = time.time()
LIMIT = int(os.environ.get("IMPORT_LIMIT", "0") or "0")

for idx, r in enumerate(rows):
    if LIMIT and total >= LIMIT:
        break
    sid = (r.get("ID") or "").strip()
    svc = (r.get("Service") or "").strip()
    total += 1

    if is_junk(r):
        results["skipped"] += 1
        reason_counts["junk_or_blank_row"] += 1
        continue

    if sid in seen_ids:
        results["skipped"] += 1
        reason_counts["duplicate_provider_service_id"] += 1
        continue

    platform = match_platform(svc)
    if platform is None:
        results["skipped"] += 1
        reason_counts["unsupported_platform_not_in_8"] += 1
        failures.append({"id": sid, "service": svc[:80], "reason": "unsupported_platform"})
        continue

    minq = to_int(r["Min Order"])
    maxq = to_int(r["Max Order"])
    try:
        price = float((r["RATE"] or "").strip())
    except Exception:
        price = None
    if minq is None or maxq is None or price is None or price <= 0 or minq <= 0 or maxq < minq:
        results["skipped"] += 1
        reason_counts["invalid_numeric"] += 1
        failures.append({"id": sid, "service": svc[:80], "reason": "invalid_numeric",
                         "min": r["Min Order"], "max": r["Max Order"], "rate": r["RATE"]})
        continue

    # slug (unique). base + id; disambiguate if needed
    base = normalize_slug(svc)
    slug = f"{base}-{sid}"
    n = 1
    while slug in seen_slugs:
        n += 1
        slug = f"{base}-{sid}-{n}"

    sub = derive_subcategory(svc)
    desc = f"Average delivery time: {r['Average Time'].strip()}."
    refill = parse_refill(r["Refill"])
    cancel = "cancel" in svc.lower()

    payload = {
        "name": svc,
        "slug": slug,
        "category": platform,
        "subcategory": sub,
        "description": desc,
        "selling_price_ksh": round(price, 4),
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

    # ---- POST (with rate limit + auth retry) ----
    ok = False
    reason = None
    for attempt in range(3):
        throttle()
        try:
            resp = requests.post(API,
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json=payload, timeout=30)
        except Exception as e:
            reason = f"request_error:{e}"
            time.sleep(2)
            continue
        if resp.status_code == 201:
            ok = True
            break
        if resp.status_code == 401:
            token = get_token()
            continue
        # other error
        try:
            body = resp.json()
        except Exception:
            body = resp.text[:200]
        reason = f"{resp.status_code}:{body}"
        # do not retry validation/duplicate errors
        if resp.status_code in (400, 409, 422):
            break
        time.sleep(2)

    if ok:
        results["imported"] += 1
        plat_counts[platform] += 1
        imported.add(sid)
        seen_ids.add(sid)
        seen_slugs.add(slug)
    else:
        results["failed"] += 1
        reason_counts["api_error"] += 1
        failures.append({"id": sid, "service": svc[:80], "platform": platform, "reason": reason})

    batch.append(platform)
    if len(batch) >= BATCH_SIZE:
        save_state()
        elapsed = time.time() - start
        print(f"[{datetime.now(timezone.utc).isoformat()}] processed={total} imported={results['imported']} "
              f"skipped={results['skipped']} failed={results['failed']} elapsed={elapsed/60:.1f}min", flush=True)
        batch = []

save_state()
elapsed = time.time() - start
print("=== DONE ===", flush=True)
print("results:", json.dumps(results), flush=True)
print("platforms:", dict(plat_counts), flush=True)
print("skip reasons:", dict(reason_counts), flush=True)
print("failures:", len(failures), flush=True)
