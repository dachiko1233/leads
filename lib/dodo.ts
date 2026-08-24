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

export interface CreateCheckoutParams {
  leads: number;
  email: string;
  query: string;
  location: string;
  returnUrl: string;
}

/**
 * Create a Dodo checkout session for a lead package and return its hosted URL.
 *
 * Pricing is €1/lead. Dodo prices are configured on the Product in the Dodo
 * dashboard; we set the quantity to the number of leads so the total is
 * leads x €1. The order details (query/location/leads) ride along in metadata so
 * the webhook can run the engine for exactly what was purchased.
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams,
): Promise<string> {
  const productId = process.env.DODO_LEAD_PRODUCT_ID;
  if (!productId) {
    throw new Error(
      "DODO_LEAD_PRODUCT_ID is not set. Create a €1 'lead' product in the Dodo dashboard and put its id here.",
    );
  }

  const client = getDodoClient();
  const session = await client.checkoutSessions.create({
    // quantity = number of leads; product unit price is €1 in the dashboard.
    product_cart: [{ product_id: productId, quantity: params.leads }],
    // Dodo requires a customer name; we only collect an email, so derive one.
    customer: { email: params.email, name: nameFromEmail(params.email) },
    return_url: params.returnUrl,
    metadata: {
      leads: String(params.leads),
      email: params.email,
      query: params.query,
      location: params.location,
    },
  });

  return session.checkout_url;
}

/** Best-effort display name from an email local-part (Dodo requires a name). */
function nameFromEmail(email: string): string {
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
