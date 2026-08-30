import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const CLEANED_DIR = "/tmp/cleaned";
const PLATFORMS = [
  { file: "snapchat.csv", category: "snapchat" },
  { file: "whatsapp.csv", category: "whatsapp" },
  { file: "linkedin.csv", category: "linkedin" },
  { file: "telegram.csv", category: "telegram" },
  { file: "facebook.csv", category: "facebook" },
  { file: "twitter.csv", category: "x" },
  { file: "tiktok.csv", category: "tiktok" },
  { file: "youtube.csv", category: "youtube" },
  { file: "instagram.csv", category: "instagram" },
];

async function loadCsv(filename) {
  const filePath = path.join(CLEANED_DIR, filename);
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.trim().splitlines();
  const reader = lines.map((line) => line.split(","));
  return reader.slice(1); // skip header
}

function parseCsvValue(val) {
  const trimmed = (val || "").trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : trimmed;
}

async function reconcile() {
  console.log("=== Starting Reconciliation & Import ===\n");

  // 1. Get existing DB state
  const { data: existingServices, error: fetchError } = await admin
    .from("janjez_services")
    .select("id, provider_service_id, name, category, is_active");

  if (fetchError) {
    console.error("Failed to fetch existing services:", fetchError);
    process.exit(1);
  }

  const existingByProviderId = new Map();
  const existingById = new Map();
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
  const servicesToRemove = [];

  // 2. Identify orphaned services (in DB but not in any source file)
  const sourceProviderIds = new Set();
  for (const platform of PLATFORMS) {
    const rows = await loadCsv(platform.file);
    for (const row of rows) {
      if (row[0]) sourceProviderIds.add(row[0].trim());
    }
  }

  for (const [providerId, svc] of existingByProviderId) {
    if (!sourceProviderIds.has(providerId)) {
      servicesToRemove.push(svc);
    }
  }

  console.log(`Orphaned services to remove: ${servicesToRemove.length}`);

  // 3. Process each platform
  for (const platform of PLATFORMS) {
    console.log(`\n--- Processing ${platform.category} ---`);
    const rows = await loadCsv(platform.file);
    let added = 0;
    let updated = 0;

    for (const row of rows) {
      if (!row[0] || !row[1]) continue;

      const providerServiceId = row[0].trim();
      const name = row[1].trim();
      const category = platform.category;
      const subcategory = (row[2] || "").trim() || category;
      const slug = `${category}-${subcategory}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
      const rate = parseCsvValue(row[3]);
      const minQuantity = parseCsvValue(row[4]);
      const maxQuantity = parseCsvValue(row[5]);
      const refill = (row[6] || "").trim();
      const averageTime = (row[7] || "").trim();
      const displayOrder = parseInt(row[8]) || 1;

      const sellingPriceKsh = Number.isFinite(rate) ? rate : null;
      const minQtyInt = Number.isFinite(minQuantity) ? Math.max(1, Math.floor(minQuantity)) : 1;
      const maxQtyInt = Number.isFinite(maxQuantity) ? Math.max(minQtyInt, Math.floor(maxQuantity)) : minQtyInt;

      const existing = existingByProviderId.get(providerServiceId);

      if (existing) {
        const updates: any = {
          name,
          category,
          subcategory,
          slug,
          selling_price_ksh: sellingPriceKsh,
          min_quantity: minQtyInt,
          max_quantity: maxQtyInt,
          supports_refill: refill && refill.toLowerCase().includes("refill"),
          supports_drip_feed: true,
          provider_service_id: providerServiceId,
          display_order: displayOrder,
          average_time: averageTime || null,
        };

        const { error: updateError } = await admin
          .from("janjez_services")
          .update(updates)
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
          selling_price_ksh: sellingPriceKsh,
          min_quantity: minQtyInt,
          max_quantity: maxQtyInt,
          supports_refill: refill && refill.toLowerCase().includes("refill"),
          supports_drip_feed: true,
          display_order: displayOrder,
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

  // 4. Remove orphaned services
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

reconcile().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
