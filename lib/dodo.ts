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

import { createHash } from "crypto";
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
  const rawSecret = process.env.DODO_WEBHOOK_SECRET;
  if (!rawSecret) {
    throw new Error("DODO_WEBHOOK_SECRET is not set.");
  }
  // Defensive: env values pasted into dashboards (Railway etc.) often carry a
  // trailing newline or surrounding quotes, which corrupts the derived key and
  // makes every signature "not match". Strip them before use.
  const secret = rawSecret.trim().replace(/^["']|["']$/g, "");

  const webhook = new Webhook(secret);
  try {
    webhook.verify(rawBody, {
      "webhook-id": headers.id,
      "webhook-signature": headers.signature,
      "webhook-timestamp": headers.timestamp,
    });
  } catch (err) {
    // Safe diagnostic: none of this exposes the secret. A `secretFingerprint`
    // (hash prefix) lets you compare against the value in the Dodo dashboard —
    // if the fingerprints differ, Railway simply has the wrong/rotated secret
    // (commonly a test-mode secret on a live endpoint, or vice versa).
    console.warn("dodo webhook verify failed:", {
      reason: err instanceof Error ? err.message : String(err),
      secretFingerprint: createHash("sha256").update(secret).digest("hex").slice(0, 10),
      secretLen: secret.length,
      hadWhitespaceOrQuotes: secret !== rawSecret,
      bodyLen: rawBody.length,
      hasId: Boolean(headers.id),
      hasSignature: Boolean(headers.signature),
      hasTimestamp: Boolean(headers.timestamp),
    });
    throw err;
  }
  return JSON.parse(rawBody);
}
