#!/usr/bin/env python3
"""Retry only transiently-failed rows from failures.json (429/5xx/network).
Permanent skips (unsupported_platform, invalid_numeric) are NOT retried.
Resumable: uses imported.json so already-imported rows are skipped."""
import json, re, time, os
import requests

ENV = open(".env", encoding="utf-8").read()
def envget(k):
    m = re.search(rf"^{k}=(.*)$", ENV, re.M); return m.group(1).strip() if m else ""
SUPABASE_URL = envget("NEXT_PUBLIC_SUPABASE_URL")
ANON_KEY = envget("NEXT_PUBLIC_SUPABASE_ANON_KEY")
SVC_KEY = envget("SUPABASE_SERVICE_ROLE_KEY")
ADMIN_EMAIL = "osiekoomoi@gmail.com"
API = "http://localhost:3000/api/admin/services"
EXISTING_JZ_IDS = set(json.load(open("/tmp/kilo/existing_jz.json")))
imported = set(json.load(open("/tmp/kilo/imported.json")))
failures = json.load(open("/tmp/kilo/failures.json"))

# only retry transient errors
RETRYABLE = lambda r: r.get("reason") and ("429" in r["reason"] or "500" in r["reason"]
    or "request_error" in r["reason"] or "timeout" in r["reason"].lower())
todo = [f for f in failures if RETRYABLE(f) and f.get("id") not in imported]
print(f"failures total={len(failures)} retryable={len(todo)}", flush=True)

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

token = get_token()
times = []
WIN, MAXR = 60.0, 30
ok=0; still_fail=0
for f in todo:
    # rebuild minimal payload from stored fields is not possible; we only have id+service+reason.
    # Instead, re-read from CSV by id.
    pass

# Re-read CSV to rebuild payloads for retryable ids
import csv
rows = list(csv.DictReader(open("/tmp/kilo/pricing.csv", newline="", encoding="utf-8")))
by_id = {(r.get("ID") or "").strip(): r for r in rows}
# reuse mapping helpers from import script
import importlib.util
spec = importlib.util.spec_from_file_location("imp", "/home/ubuntu/janjez-socio/import_services.py")
# do not execute (would start import); instead redefine minimal helpers here
KNOWN=["youtube","whatsapp","instagram","facebook","tiktok","telegram","google-maps-reviews","x"]
def match_platform(name):
    low=name.lower()
    for p in KNOWN:
        if p in low: return p
    if "twitter" in low: return "x"
    if "google map" in low or "googlemap" in low or "gmb" in low or "maps review" in low: return "google-maps-reviews"
    return None
def normalize_slug(s):
    s=s.lower().strip(); s=re.sub(r"[^\w\s-]","",s); s=re.sub(r"\s+","-",s); s=re.sub(r"-+","-",s); return s.strip("-") or "service"
def to_int(x):
    x=(x or "").replace(" ","").replace(",","").strip()
    try: return int(float(x))
    except: return None
def parse_refill(v):
    v=(v or "").lower().strip()
    if v=="" or "no refill" in v: return False
    return "refill" in v
SUBKEYS=["followers","subscribers","likes","views","watch","comments","shares","share","reactions","reaction","impressions","impression","clicks","click","retweets","retweet","reposts","repost","live","story","highlights","saves","save","bookmarks","bookmark","poll","votes","vote","mentions","mention","profile","visits","visit","reels","posts","messages","members","group","channel","subs","engagement","reach","plays","play"]
def derive_subcategory(name):
    low=name.lower()
    for k in SUBKEYS:
        if re.search(r"\b"+re.escape(k),low): return k.capitalize()
    words=re.findall(r"[a-z]{3,}",low)
    for w in words:
        if w not in ("the","and","for","with","from","this","that","www","http"): return w.capitalize()
    return "General"

seen_slugs=set(json.load(open("/tmp/kilo/existing_slugs.json"))) | imported
for f in todo:
    sid=f.get("id")
    if not sid or sid in imported: 
        continue
    r=by_id.get(sid)
    if not r: 
        still_fail+=1; continue
    svc=(r.get("Service") or "").strip()
    platform=match_platform(svc)
    if platform is None:
        still_fail+=1; continue
    minq=to_int(r["Min Order"]); maxq=to_int(r["Max Order"])
    try: price=float((r["RATE"] or "").strip())
    except: price=None
    if minq is None or maxq is None or price is None or price<=0 or minq<=0 or maxq<minq:
        still_fail+=1; continue
    base=normalize_slug(svc); slug=f"{base}-{sid}"; n=1
    while slug in seen_slugs:
        n+=1; slug=f"{base}-{sid}-{n}"
    payload={"name":svc,"slug":slug,"category":platform,"subcategory":derive_subcategory(svc),
        "description":f"Average delivery time: {r['Average Time'].strip()}.",
        "selling_price_ksh":round(price,4),"provider_service_id":sid,"min_quantity":minq,"max_quantity":maxq,
        "is_active":True,"supports_refill":parse_refill(r["Refill"]),"supports_cancel":"cancel" in svc.lower(),
        "supports_drip_feed":False,"show_sidebar":False,"show_landing":False,"show_guarded":False,
        "show_anonymous":False,"show_catalogue":False}
    done=False; reason=None
    for attempt in range(5):
        while len(times)>=MAXR and time.time()-times[0]<WIN: time.sleep(1)
        times=[t for t in times if time.time()-t<WIN]
        try:
            resp=requests.post(API,headers={"Authorization":f"Bearer {token}","Content-Type":"application/json"},json=payload,timeout=30)
        except Exception as e:
            reason=str(e); time.sleep(3); continue
        if resp.status_code==201: done=True; break
        if resp.status_code==401: token=get_token(); continue
        if resp.status_code==429:
            token=get_token(); time.sleep(20); continue
        reason=f"{resp.status_code}:{resp.text[:200]}"; 
        if resp.status_code in (400,409,422): break
        time.sleep(3)
    if done:
        ok+=1; imported.add(sid); seen_slugs.add(slug)
    else:
        still_fail+=1
        f["retry_reason"]=reason
json.dump(sorted(imported), open("/tmp/kilo/imported.json","w"))
# rewrite failures without the retried ones
remaining=[f for f in failures if not (RETRYABLE(f) and f.get("id") in imported)]
json.dump(remaining, open("/tmp/kilo/failures.json","w"))
print(f"retry OK={ok} still_fail={still_fail}", flush=True)
