const fs = require("fs");
const r = JSON.parse(fs.readFileSync("/tmp/reconciliation_report.json", "utf8"));
console.log("db_status:", r.db_query.status, "|", r.db_query.reason);
console.log("\n--- SUMMARY ---");
console.log(JSON.stringify(r.summary, null, 2));
console.log("\n--- SAMPLE services_to_add (first 5) ---");
for (const s of r.services_to_add.slice(0, 5)) {
  console.log(JSON.stringify({ provider_service_id: s.provider_service_id, name: s.name, category: s.category, rate: s.rate, min_quantity: s.min_quantity, max_quantity: s.max_quantity, refill: s.refill }));
}
console.log("\n--- SAMPLE services_to_remove (first 5) ---");
console.log(r.services_to_remove.length ? r.services_to_remove.slice(0,5) : "N/A (DB unavailable)");
console.log("\n--- SAMPLE price mismatches / services_to_update (first 5) ---");
console.log(r.services_to_update.length ? r.services_to_update.slice(0,5) : "N/A (DB unavailable)");
console.log("\n--- new_categories ---");
console.log(JSON.stringify(r.new_categories, null, 2));
