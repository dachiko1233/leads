// One-off: generate real leads and email them as a CSV. Mirrors the webhook
// fulfillment path (generateLeads -> leadsToCsv -> sendLeadsEmail) but is
// triggered manually. Usage:
//   npx tsx scripts/send-leads-once.ts "<query>" "<location>" <limit> <email>

import { promises as fs } from "node:fs";
import path from "node:path";

import { generateLeads } from "../lib/leads";
import { leadsToCsv } from "../lib/csv";
import { sendLeadsEmail } from "../lib/email";

async function loadEnvLocal(): Promise<void> {
  const file = path.join(process.cwd(), ".env.local");
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Strip inline comments and surrounding quotes.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      const hash = value.indexOf(" #");
      if (hash !== -1) value = value.slice(0, hash).trim();
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main(): Promise<void> {
  await loadEnvLocal();

  const [query, location, limitArg, email] = process.argv.slice(2);
  if (!query || !location || !email) {
    throw new Error('Usage: send-leads-once.ts "<query>" "<location>" <limit> <email>');
  }
  const limit = Number(limitArg) || 20;

  console.log(`Generating ${limit} leads: "${query}" in "${location}" ...`);
  const leads = await generateLeads({ query, location, limit });
  console.log(`Got ${leads.length} leads.`);
  for (const [i, l] of leads.entries()) {
    console.log(
      `${String(i + 1).padStart(2)}. [${String(l.hotScore).padStart(3)}] ${l.name} — ${l.lastPost}`,
    );
  }

  const csv = Buffer.from(leadsToCsv(leads), "utf8");
  console.log(`\nSending to ${email} ...`);
  await sendLeadsEmail({ to: email, leads, csvBuffer: csv });
  console.log("Email sent.");
}

main().catch((err) => {
  console.error("send-leads-once failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
