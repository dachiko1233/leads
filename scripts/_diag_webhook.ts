import DodoPayments from "dodopayments";
import { createHash } from "crypto";

function fp(s: string) { return createHash("sha256").update(s).digest("hex").slice(0,10); }

const envSecret = (process.env.DODO_WEBHOOK_SECRET ?? "").trim().replace(/^["']|["']$/g, "");
console.log("Railway env DODO_WEBHOOK_SECRET  len:", envSecret.length, "fp:", fp(envSecret));
console.log("DODO_ENVIRONMENT:", process.env.DODO_ENVIRONMENT);

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: process.env.DODO_ENVIRONMENT === "live" ? "live_mode" : "test_mode",
});

(async () => {
  const eps = await client.webhooks.list();
  const data: any[] = (eps as any).data ?? [];
  console.log(`\nWebhook endpoints on Dodo (${data.length}):`);
  for (const ep of data) {
    console.log(`  id=${ep.id}  url=${ep.url}  disabled=${ep.disabled}`);
    try {
      const s = await client.webhooks.retrieveSecret(ep.id);
      const real = (s as any).secret as string;
      const match = real.trim() === envSecret;
      console.log(`     signing secret len:${real.length} fp:${fp(real.trim())}  MATCHES_ENV:${match}`);
    } catch (e:any) {
      console.log("     (could not read secret:", e.message, ")");
    }
  }
})().catch(e => { console.error("API error:", e.status, e.message); process.exit(1); });
