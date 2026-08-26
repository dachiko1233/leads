// One-off maintenance script: align the Dodo dynamic-price product with our
// 20–1000 lead range (€1/lead).
//
// The 422 "Amount cannot be less than minimum amount specified for the product"
// happens because the pay-what-you-want product still has its MINIMUM price set
// to the old €100. Dodo stores that minimum in the price's `price` field (in
// cents). This script lowers it to €20 so a 20-lead order (€20) is accepted.
//
//   npx tsx scripts/set-dodo-price.ts          # dry run: prints current price
//   npx tsx scripts/set-dodo-price.ts --apply  # writes the new €20 minimum
//
// Reads DODO_PAYMENTS_API_KEY / DODO_ENVIRONMENT / DODO_PRODUCT_ID from the
// environment or .env.local.

import { promises as fs } from "node:fs";
import path from "node:path";

import { getDodoClient } from "../lib/dodo";

// New pay-what-you-want minimum: €20 in cents. Keep in sync with MIN_LEADS * €1.
const MIN_PRICE_CENTS = 20 * 100;

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
  const apply = process.argv.includes("--apply");

  const productId = process.env.DODO_PRODUCT_ID ?? process.env.DODO_LEAD_PRODUCT_ID;
  if (!productId) throw new Error("DODO_PRODUCT_ID is not set.");

  const client = getDodoClient();
  const product = await client.products.retrieve(productId);
  const price = product.price;

  console.log(`Product ${productId}`);
  console.log(`  type:            ${price.type}`);
  console.log(`  current minimum: ${"price" in price ? price.price : "n/a"} cents`);
  console.log(
    `  pay_what_you_want: ${"pay_what_you_want" in price ? price.pay_what_you_want : "n/a"}`,
  );

  if (price.type !== "one_time_price") {
    throw new Error(
      `Expected a one_time_price product; got "${price.type}". Update it in the Dodo dashboard instead.`,
    );
  }

  if (!apply) {
    console.log(
      `\nDry run. Re-run with --apply to set the minimum to ${MIN_PRICE_CENTS} cents (€20).`,
    );
    return;
  }

  // Preserve every existing field; only lower the minimum and ensure PWYW is on.
  await client.products.update(productId, {
    price: {
      ...price,
      price: MIN_PRICE_CENTS,
      pay_what_you_want: true,
    },
  });

  const after = await client.products.retrieve(productId);
  console.log(
    `\nUpdated. New minimum: ${"price" in after.price ? after.price.price : "n/a"} cents (€20).`,
  );
}

main().catch((err) => {
  console.error("\nset-dodo-price failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
