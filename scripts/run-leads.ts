// CLI runner for the data engine — test the Google Places + scoring pipeline
// from the terminal, without going through payment.
//
//   npx tsx scripts/run-leads.ts "hair salon" "Austin, TX" 10
//   USE_SAMPLE_DATA=true npx tsx scripts/run-leads.ts
//
// Loads .env.local if present so GOOGLE_PLACES_API_KEY / USE_SAMPLE_DATA apply.

import { promises as fs } from "node:fs";
import path from "node:path";

import { generateLeads } from "../lib/leads";
import { leadsToCsv } from "../lib/csv";

async function loadEnvLocal(): Promise<void> {
  const file = path.join(process.cwd(), ".env.local");
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    return; // no .env.local — rely on the ambient environment
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main(): Promise<void> {
  await loadEnvLocal();

  const [query = "hair salon", location = "Austin, TX", limitArg = "10"] =
    process.argv.slice(2);
  const limit = Number(limitArg) || 10;

  console.log(
    `\nRunning data engine  (sample=${process.env.USE_SAMPLE_DATA === "true"})`,
  );
  console.log(`  query="${query}"  location="${location}"  limit=${limit}\n`);

  const leads = await generateLeads({ query, location, limit });

  for (const [i, lead] of leads.entries()) {
    const social = lead.instagram ?? lead.facebook ?? "— no social found —";
    console.log(
      `${String(i + 1).padStart(2)}. [${String(lead.hotScore).padStart(3)}] ` +
        `${lead.name}  (${lead.category})  ${social}  last post: ${lead.lastPost}`,
    );
  }

  // Also drop a CSV next to the fixture so you can eyeball the export format.
  const out = path.join(process.cwd(), "data", "leads.out.csv");
  await fs.writeFile(out, leadsToCsv(leads), "utf8");
  console.log(`\nWrote ${leads.length} leads -> ${out}\n`);
}

main().catch((err) => {
  console.error("\nrun-leads failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
