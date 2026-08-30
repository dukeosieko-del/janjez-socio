import { createClient } from "@supabase/supabase-js";
import https from "https";
import { URL } from "url";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const REPO = "dukeosieko-del/services-the-only-source-of-truth-";

const PLATFORMS = [
  { branch: "snapchat", file: "snapchat - Sheet1.csv", category: "snapchat" },
  { branch: "whatsapp", file: "whatsapp - Sheet1.csv", category: "whatsapp" },
  { branch: "linkedin", file: "linkedin - Sheet1.csv", category: "linkedin" },
  { branch: "telegram", file: "telegram - Sheet1.csv", category: "telegram" },
  { branch: "facebook", file: "facebook - Sheet1.csv", category: "facebook" },
  { branch: "twitter", file: "twitter  - Sheet1.csv", category: "x" },
  { branch: "tiktok", file: "tiktok dedicated  - Sheet1.csv", category: "tiktok" },
  { branch: "youtube-dedicated", file: "you tube  - Sheet1.csv", category: "youtube" },
  { branch: "instagram", file: "instagram - Sheet1 (1).tsv", category: "instagram" },
];

function fetchGitHubRaw(path: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${REPO}/${path}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchGitHubRaw(new URL(res.headers.location, url).pathname.slice(1)).then(resolve, reject);
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (d) => chunks.push(Buffer.from(d)));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    }).on("error", reject);
  });
}

function parseCsv(text: string, delimiter = ",") {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
  const rows: string[][] = [];
  for (const line of lines) {
    const row: string[] = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        row.push(cell);
        cell = "";
      } else {
        cell += char;
      }
    }
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

async function reconcile() {
  console.log("=== Starting Reconciliation & Import ===\n");

  const { data: existingServices, error: fetchError } = await admin
    .from("janjez_services")
    .select("id, provider_service_id, name, category, is_active, slug");

  if (fetchError) {
    console.error("Failed to fetch existing services:", fetchError);
    process.exit(1);
  }

  const existingByProviderId = new Map<string, any>();
  const existingById = new Map<string, any>();
  for (const svc of existingServices || []) {
    if (svc.provider_service_id) {
      existingByProviderId.set(String(svc.provider_service_id), svc);
    }
    existingById.set(svc.id, svc);
  }

  console.log(`DB state: ${existingServices?.length || 0} total services`);
  console.log(`DB services with provider_service_id: ${existingByProviderId.size}`);
  console.log();

  let totalAdded = 0;
  let totalUpdated = 0;
  let totalRemoved = 0;
  const servicesToRemove: any[] = [];

  // Build expected slugs/names from source
  const sourceProviderIds = new Set<string>();
  const sourceSlugs = new Set<string>();
  const sourceNames = new Set<string>();
  for (const platform of PLATFORMS) {
    const raw = await fetchGitHubRaw(`${platform.branch}/${encodeURIComponent(platform.file)}`);
    const delim = platform.file.endsWith(".tsv") ? "\t" : ",";
    const rows = parseCsv(raw, delim);
    const dataRows = rows.slice(1);
    for (const row of dataRows) {
      if (!row[0] || !row[1]) continue;
      const providerServiceId = row[0].trim();
      const name = row[1].trim();
      const category = platform.category;
      const subcategory = extractSubcategory(name, category);
      const slug = makeSlug(category, subcategory);
      sourceProviderIds.add(providerServiceId);
      sourceSlugs.add(slug);
      sourceNames.add(name.toLowerCase());
    }
  }

  for (const [providerId, svc] of existingByProviderId) {
    if (!sourceProviderIds.has(providerId)) {
      servicesToRemove.push(svc);
    }
  }

  for (const svc of existingServices || []) {
    if (svc.provider_service_id) continue;
    const slug = String(svc.slug || "").toLowerCase();
    const name = String(svc.name || "").toLowerCase();
    if (!sourceSlugs.has(slug) && !sourceNames.has(name)) {
      servicesToRemove.push(svc);
    }
  }

  console.log(`Orphaned services to remove: ${servicesToRemove.length}`);

  for (const platform of PLATFORMS) {
    console.log(`\n--- Processing ${platform.category} ---`);
    const raw = await fetchGitHubRaw(`${platform.branch}/${encodeURIComponent(platform.file)}`);
    const delim = platform.file.endsWith(".tsv") ? "\t" : ",";
    const rows = parseCsv(raw, delim);
    const dataRows = rows.slice(1);
    let added = 0;
    let updated = 0;

    for (const row of dataRows) {
      if (!row[0] || !row[1]) continue;

      const providerServiceId = row[0].trim();
      const name = row[1].trim();
      const category = platform.category;
      const subcategory = extractSubcategory(name, category);
      const slug = makeSlug(category, subcategory);
      const rate = parseFloat(row[2] || "0") || 0;
      const minQuantity = parseInt(row[3]?.replace(/[\s,]/g, "") || "1", 10) || 1;
      const maxQuantity = parseInt(row[4]?.replace(/[\s,]/g, "") || "1", 10) || minQuantity;
      const refill = (row[5] || "").trim();
      const averageTime = (row[6] || "").trim();

      const existing = existingByProviderId.get(providerServiceId);

      if (existing) {
        const { error: updateError } = await admin
          .from("janjez_services")
          .update({
            name,
            category,
            subcategory,
            slug,
            selling_price_ksh: rate,
            min_quantity: Math.max(1, minQuantity),
            max_quantity: Math.max(Math.max(1, minQuantity), maxQuantity),
            supports_refill: /refill/i.test(refill),
            supports_drip_feed: true,
            provider_service_id: providerServiceId,
            average_time: averageTime || null,
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error(`  Failed to update ${providerServiceId}:`, updateError.message);
        } else {
          updated++;
        }
      } else {
        const { error: insertError } = await admin.from("janjez_services").insert({
          name,
          category,
          subcategory,
          slug,
          provider_service_id: providerServiceId,
          selling_price_ksh: rate,
          min_quantity: Math.max(1, minQuantity),
          max_quantity: Math.max(Math.max(1, minQuantity), maxQuantity),
          supports_refill: /refill/i.test(refill),
          supports_drip_feed: true,
          average_time: averageTime || null,
          is_active: true,
          show_sidebar: false,
          show_landing: true,
          show_guarded: true,
          show_anonymous: true,
          show_catalogue: true,
        });

        if (insertError) {
          console.error(`  Failed to insert ${providerServiceId}:`, insertError.message);
        } else {
          added++;
        }
      }
    }

    console.log(`  Added: ${added}, Updated: ${updated}`);
    totalAdded += added;
    totalUpdated += updated;
  }

  console.log(`\n--- Removing ${servicesToRemove.length} orphaned services ---`);
  for (const svc of servicesToRemove) {
    const { error: deleteError } = await admin
      .from("janjez_services")
      .delete()
      .eq("id", svc.id);

    if (deleteError) {
      console.error(`  Failed to delete ${svc.id}:`, deleteError.message);
    } else {
      totalRemoved++;
    }
  }

  console.log(`\n=== Reconciliation Complete ===`);
  console.log(`Total added: ${totalAdded}`);
  console.log(`Total updated: ${totalUpdated}`);
  console.log(`Total removed: ${totalRemoved}`);
  console.log(`Final DB count: ${(existingServices?.length || 0) - totalRemoved + totalAdded}`);
}

function extractSubcategory(name: string, category: string): string {
  const parts = name.split(" ");
  if (parts.length >= 3 && name.includes("|")) {
    const pipeIdx = name.indexOf("|");
    return name.slice(parts[0].length, pipeIdx).replace("|", "").trim();
  }
  if (parts.length >= 3) return parts.slice(1, 4).join(" ");
  if (parts.length >= 2) return parts[1];
  return category;
}

function makeSlug(category: string, subcategory: string): string {
  const raw = `${category}-${subcategory}`.toLowerCase();
  return raw.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

reconcile().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
