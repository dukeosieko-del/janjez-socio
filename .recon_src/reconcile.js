const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const CLEANED = "/tmp/cleaned";
const REPORT_PATH = "/tmp/reconciliation_report.json";
const PUBLIC_URL = "https://snkgkcdnmhqaejpqftxn.supabase.co";

// ---- Category presentation metadata (platform-defined) ----
const CATEGORY_META = {
  facebook:  { id: "facebook",  name: "Facebook",  icon: "Facebook",   color: "#1877F2" },
  instagram: { id: "instagram", name: "Instagram", icon: "Instagram",  color: "#E4405F" },
  linkedin:  { id: "linkedin",  name: "LinkedIn",  icon: "Linkedin",   color: "#0A66C2" },
  snapchat:  { id: "snapchat",  name: "Snapchat",  icon: "Camera",     color: "#FFFC00" },
  telegram:  { id: "telegram",  name: "Telegram",  icon: "Send",       color: "#229ED9" },
  tiktok:    { id: "tiktok",    name: "TikTok",    icon: "Music2",     color: "#FE2C55" },
  x:         { id: "x",         name: "X",         icon: "Twitter",    color: "#1DA1F2" },
  whatsapp:  { id: "whatsapp",  name: "WhatsApp",  icon: "MessageCircle", color: "#25D366" },
  youtube:   { id: "youtube",   name: "YouTube",   icon: "Youtube",    color: "#FF0000" },
};

// Quote-aware CSV parser
function parseCsv(content) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;
  const pushField = () => { row.push(field); field = ""; };
  const pushRow = () => { pushField(); rows.push(row); row = []; };
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (inQuotes) {
      if (c === '"') {
        if (content[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") pushField();
      else if (c === "\n") pushRow();
      else if (c === "\r") { /* ignore */ }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) pushRow();
  return rows;
}

function loadSource() {
  const manifest = JSON.parse(fs.readFileSync(path.join(CLEANED, "manifest.json"), "utf8"));
  const sourceServices = [];
  const sourceById = new Map();
  const sourceCategories = new Set();
  for (const [platform, info] of Object.entries(manifest.platforms)) {
    const file = path.join(CLEANED, info.file);
    const rows = parseCsv(fs.readFileSync(file, "utf8"));
    const header = rows[0].map((h) => h.trim());
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r];
      if (cells.length < header.length) continue;
      const rec = {};
      header.forEach((h, idx) => (rec[h] = (cells[idx] ?? "").trim()));
      const svc = {
        provider_service_id: rec.provider_service_id || rec.id,
        name: rec.name,
        category: rec.category,
        subcategory: rec.subcategory || null,
        slug: rec.slug,
        rate: parseFloat(rec.rate),
        min_quantity: parseInt(rec.min_quantity, 10),
        max_quantity: parseInt(String(rec.max_quantity).replace(/\s/g, ""), 10),
        refill: rec.refill,
        average_time: rec.average_time || null,
        display_order: parseInt(rec.display_order, 10) || 0,
        platform,
      };
      sourceServices.push(svc);
      sourceById.set(String(svc.provider_service_id), svc);
      sourceCategories.add(svc.category);
    }
  }
  return { manifest, sourceServices, sourceById, sourceCategories };
}

async function queryDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PUBLIC_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    return { status: "unavailable", reason: "SUPABASE_SERVICE_ROLE_KEY not set (no .env / credentials present in sandbox)" };
  }
  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  try {
    const { data, error } = await supabase
      .from("janjez_services")
      .select("id, name, category, subcategory, slug, selling_price_ksh, provider_service_id, min_quantity, max_quantity, supports_refill, supports_drip_feed, supports_cancel, is_active");
    if (error) return { status: "error", reason: error.message };
    const categories = new Set();
    const byProviderId = new Map();
    for (const s of data || []) {
      if (s.category) categories.add(s.category);
      if (s.provider_service_id != null) byProviderId.set(String(s.provider_service_id), s);
    }
    return { status: "ok", services: data || [], categories, byProviderId };
  } catch (e) {
    return { status: "error", reason: e.message };
  }
}

function num(v) { return Number.isFinite(v) ? v : null; }

(async () => {
  const src = loadSource();
  const db = await queryDb();

  const report = {
    generated_at: new Date().toISOString(),
    db_query: {
      status: db.status,
      reason: db.reason || null,
      note: "Read-only reconciliation. Database was NOT modified.",
    },
    summary: {
      total_db_services: db.status === "ok" ? db.services.length : null,
      total_source_services: src.sourceServices.length,
      services_to_add: null,
      services_to_update: null,
      services_to_remove: null,
      categories_to_add: null,
    },
    services_to_add: [],
    services_to_update: [],
    services_to_remove: [],
    new_categories: [],
  };

  if (db.status === "ok") {
    // ---- Full reconciliation ----
    const sourceIdSet = new Set(src.sourceById.keys());
    const toAdd = [], toUpdate = [], toRemove = [];
    const dbCategorySet = db.categories;

    // Source -> DB matching
    for (const svc of src.sourceServices) {
      const key = String(svc.provider_service_id);
      const existing = db.byProviderId.get(key);
      if (!existing) {
        toAdd.push({
          provider_service_id: svc.provider_service_id,
          name: svc.name,
          category: svc.category,
          subcategory: svc.subcategory,
          slug: svc.slug,
          rate: svc.rate,
          min_quantity: svc.min_quantity,
          max_quantity: svc.max_quantity,
          refill: svc.refill,
          average_time: svc.average_time,
        });
      } else {
        const changes = {};
        // price compared via selling_price_ksh vs source rate (note: different units; provider rate is source-of-truth cost)
        if (num(existing.selling_price_ksh) != null && Math.abs((existing.selling_price_ksh) - svc.rate) > 1e-6) {
          changes.selling_price_ksh = { old: existing.selling_price_ksh, new: svc.rate };
        }
        if (num(existing.min_quantity) !== svc.min_quantity) {
          changes.min_quantity = { old: existing.min_quantity, new: svc.min_quantity };
        }
        if (num(existing.max_quantity) !== svc.max_quantity) {
          changes.max_quantity = { old: existing.max_quantity, new: svc.max_quantity };
        }
        const dbRefill = existing.supports_refill ? "Refill" : "No Refill";
        if (dbRefill !== svc.refill) {
          changes.refill = { old: dbRefill, new: svc.refill };
        }
        if (Object.keys(changes).length > 0) {
          toUpdate.push({ id: existing.id, provider_service_id: svc.provider_service_id, changes });
        }
      }
    }

    // DB -> Source (orphans)
    for (const s of db.services) {
      if (s.provider_service_id == null) continue;
      if (!sourceIdSet.has(String(s.provider_service_id))) {
        toRemove.push({ id: s.id, provider_service_id: s.provider_service_id, name: s.name });
      }
    }

    // New categories
    const newCats = [];
    for (const cat of src.sourceCategories) {
      if (!dbCategorySet.has(cat)) {
        const meta = CATEGORY_META[cat] || { id: cat, name: cat, icon: "Tag", color: "#64748B" };
        newCats.push(meta);
      }
    }

    report.summary.services_to_add = toAdd.length;
    report.summary.services_to_update = toUpdate.length;
    report.summary.services_to_remove = toRemove.length;
    report.summary.categories_to_add = newCats.map((c) => c.id);
    report.services_to_add = toAdd;
    report.services_to_update = toUpdate;
    report.services_to_remove = toRemove;
    report.new_categories = newCats;
  } else {
    // ---- DB unavailable: source-only reconciliation ----
    // We can still enumerate candidate new categories (platforms present in source).
    const newCats = [];
    for (const cat of src.sourceCategories) {
      const meta = CATEGORY_META[cat] || { id: cat, name: cat, icon: "Tag", color: "#64748B" };
      newCats.push(meta);
    }
    report.new_categories = newCats;
    report.summary.categories_to_add = newCats.map((c) => c.id);
    // All source services are candidate additions (cannot confirm existing without DB).
    report.services_to_add = src.sourceServices.map((s) => ({
      provider_service_id: s.provider_service_id,
      name: s.name,
      category: s.category,
      subcategory: s.subcategory,
      slug: s.slug,
      rate: s.rate,
      min_quantity: s.min_quantity,
      max_quantity: s.max_quantity,
      refill: s.refill,
      average_time: s.average_time,
      _candidate: true,
    }));
    report.summary.services_to_add = report.services_to_add.length;
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log("WROTE", REPORT_PATH);
  console.log("db_status:", db.status, db.reason || "");
  console.log("total_source_services:", report.summary.total_source_services);
  console.log("total_db_services:", report.summary.total_db_services);
  console.log("services_to_add:", report.summary.services_to_add);
  console.log("services_to_update:", report.summary.services_to_update);
  console.log("services_to_remove:", report.summary.services_to_remove);
  console.log("new_categories:", report.summary.categories_to_add);
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
