// Dodo Payments integration (checkout session + webhook verification).
//
// Verified against the current official docs (Aug 2026):
//   - SDK package: `dodopayments`
//     new DodoPayments({ bearerToken, environment: 'test_mode' | 'live_mode' })
//     client.checkoutSessions.create({ product_cart, customer, return_url, metadata })
//       -> { checkout_url }
//   - Webhooks are signed with the Standard Webhooks spec and verified with the
//     `standardwebhooks` package using headers webhook-id / webhook-signature /
//     webhook-timestamp.
// Docs: https://docs.dodopayments.com/developer-resources/integration-guide

import DodoPayments from "dodopayments";
import { Webhook } from "standardwebhooks";

export function getDodoClient(): DodoPayments {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  if (!bearerToken) {
    throw new Error("DODO_PAYMENTS_API_KEY is not set.");
  }
  return new DodoPayments({
    bearerToken,
    environment: process.env.DODO_ENVIRONMENT === "live" ? "live_mode" : "test_mode",
  });
}

/** Best-effort display name from an email local-part (Dodo requires a name). */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  return cleaned ? cleaned.replace(/\b\w/g, (c) => c.toUpperCase()) : "Customer";
}

/**
 * Verify a Dodo webhook and return the parsed event payload.
 * Throws if the signature is invalid.
 */
export function verifyDodoWebhook(
  rawBody: string,
  headers: { id: string; signature: string; timestamp: string },
): unknown {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("DODO_WEBHOOK_SECRET is not set.");
  }
  const webhook = new Webhook(secret);
  webhook.verify(rawBody, {
    "webhook-id": headers.id,
    "webhook-signature": headers.signature,
    "webhook-timestamp": headers.timestamp,
  });
  return JSON.parse(rawBody);
}
