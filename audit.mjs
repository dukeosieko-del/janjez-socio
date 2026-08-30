import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ===== DB QUERIES =====
async function queryDb() {
  const [svcRes, provRes] = await Promise.all([
    supabase.from("janjez_services").select("*"),
    supabase.from("provider_services").select("*"),
  ]);

  if (svcRes.error) throw new Error(`janjez_services error: ${svcRes.error.message}`);
  if (provRes.error) throw new Error(`provider_services error: ${provRes.error.message}`);

  const services = svcRes.data || [];
  const providers = provRes.data || [];

  const total = services.length;

  const categories = {};
  let nullProvider = 0;
  let inactive = 0;
  let showSidebar = 0;
  let showLanding = 0;
  let showGuarded = 0;
  let showAnonymous = 0;
  let showCatalogue = 0;

  const providerIds = new Set(providers.map((p) => p.id));
  let matchingProviderIds = 0;

  for (const s of services) {
    const cat = s.category || "(null)";
    categories[cat] = (categories[cat] || 0) + 1;

    if (s.provider_service_id === null || s.provider_service_id === undefined) nullProvider++;
    else if (providerIds.has(s.provider_service_id)) matchingProviderIds++;

    if (!s.is_active) inactive++;
    if (s.show_sidebar) showSidebar++;
    if (s.show_landing) showLanding++;
    if (s.show_guarded) showGuarded++;
    if (s.show_anonymous) showAnonymous++;
    if (s.show_catalogue) showCatalogue++;
  }

  const platforms = [...new Set(providers.map((p) => p.platform).filter(Boolean))];

  return {
    total,
    categories,
    nullProvider,
    inactive,
    showSidebar,
    showLanding,
    showGuarded,
    showAnonymous,
    showCatalogue,
    platforms,
    providerTotal: providers.length,
    matchingProviderIds,
  };
}

// ===== SOURCE FILES =====
import fs from "fs";

function parseCsv(filePath, delimiter = ",") {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.trim().split(/\r?\n/);
  const rows = [];
  for (const line of lines) {
    const parts = line.split(delimiter);
    if (parts.length >= 2) {
      rows.push({ id: parts[0].trim(), name: parts[1].trim() });
    }
  }
  return rows;
}

function getCategory(name) {
  const firstWord = name.split(/\s+/)[0];
  return firstWord || "(empty)";
}

async function querySourceFiles() {
  const files = [
    { path: "/tmp/snapchat.csv", platform: "snapchat" },
    { path: "/tmp/whatsapp.csv", platform: "whatsapp" },
    { path: "/tmp/linkedin.csv", platform: "linkedin" },
    { path: "/tmp/telegram.csv", platform: "telegram" },
    { path: "/tmp/facebook.csv", platform: "facebook" },
    { path: "/tmp/twitter.csv", platform: "twitter" },
    { path: "/tmp/tiktok.csv", platform: "tiktok" },
    { path: "/tmp/youtube.csv", platform: "youtube" },
    { path: "/tmp/instagram.tsv", platform: "instagram", delimiter: "\t" },
  ];

  const result = {};
  const allSourceIds = new Set();
  const sourceCategoryMap = {};

  for (const file of files) {
    const rows = parseCsv(file.path, file.delimiter || ",");
    const cats = {};
    for (const row of rows) {
      allSourceIds.add(row.id);
      const cat = getCategory(row.name);
      cats[cat] = (cats[cat] || 0) + 1;
      if (!sourceCategoryMap[cat]) sourceCategoryMap[cat] = new Set();
      sourceCategoryMap[cat].add(file.platform);
    }
    result[file.platform] = { total: rows.length, categories: cats };
  }

  return { result, allSourceIds, sourceCategoryMap };
}

// ===== MAIN =====
(async () => {
  try {
    const db = await queryDb();
    const source = await querySourceFiles();

    console.log("=== JANJEZ_SERVICES DB AUDIT ===\n");
    console.log(`Total services in DB: ${db.total}`);
    console.log(`\nCategory distribution:`);
    for (const [cat, count] of Object.entries(db.categories).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${cat}: ${count}`);
    }
    console.log(`\nNull provider_service_id: ${db.nullProvider}`);
    console.log(`Inactive (is_active=false): ${db.inactive}`);
    console.log(`show_sidebar=true: ${db.showSidebar}`);
    console.log(`show_landing=true: ${db.showLanding}`);
    console.log(`show_guarded=true: ${db.showGuarded}`);
    console.log(`show_anonymous=true: ${db.showAnonymous}`);
    console.log(`show_catalogue=true: ${db.showCatalogue}`);

    console.log(`\n=== PROVIDER_SERVICES DB AUDIT ===\n`);
    console.log(`Total providers in DB: ${db.providerTotal}`);
    console.log(`Distinct platforms: ${db.platforms.join(", ")}`);

    console.log(`\n=== SOURCE FILES AUDIT ===\n`);
    for (const [platform, data] of Object.entries(source.result)) {
      console.log(`\n${platform}:`);
      console.log(`  Total: ${data.total}`);
      console.log(`  Categories:`);
      for (const [cat, count] of Object.entries(data.categories).sort((a, b) => b[1] - a[1])) {
        console.log(`    ${cat}: ${count}`);
      }
    }

    const dbCategories = new Set(Object.keys(db.categories));
    const sourceCategories = new Set(Object.keys(source.sourceCategoryMap));

    const inDbNotSource = [...dbCategories].filter((c) => !sourceCategories.has(c));
    const inSourceNotDb = [...sourceCategories].filter((c) => !dbCategories.has(c));

    console.log(`\n=== GAP ANALYSIS ===\n`);
    console.log(`Categories in DB but NOT in source: ${inDbNotSource.length > 0 ? inDbNotSource.join(", ") : "none"}`);
    console.log(`Categories in source but NOT in DB: ${inSourceNotDb.length > 0 ? inSourceNotDb.join(", ") : "none"}`);

    // Count DB services whose provider_service_id is in source files
    const sourceIdSet = source.allSourceIds;
    let dbMatchingSource = 0;
    let dbNotMatchingSource = 0;

    const { data: allServices } = await supabase.from("janjez_services").select("provider_service_id");
    for (const s of allServices || []) {
      if (s.provider_service_id && sourceIdSet.has(String(s.provider_service_id))) {
        dbMatchingSource++;
      } else if (s.provider_service_id !== null && s.provider_service_id !== undefined) {
        dbNotMatchingSource++;
      }
    }

    console.log(`\n=== RECONCILIATION ===\n`);
    console.log(`DB services with provider_service_id matching source IDs: ${dbMatchingSource}`);
    console.log(`DB services with provider_service_id NOT matching source IDs: ${dbNotMatchingSource}`);
    console.log(`DB services with NULL provider_service_id (would need review): ${db.nullProvider}`);
    console.log(`\nServices that would need REMOVAL (DB services not matching source): ${dbNotMatchingSource + db.nullProvider}`);
    console.log(`Services that would need ADDITION (source IDs not in DB): ${sourceIdSet.size - dbMatchingSource}`);
  } catch (err) {
    console.error("ERROR:", err.message);
    process.exit(1);
  }
})();
