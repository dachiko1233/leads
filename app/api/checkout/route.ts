// POST /api/checkout — create a Dodo Payments checkout session for a lead package.
//
// Pricing is €1 per lead and is fixed *server-side*: we pass the exact total to
// Dodo as `product_cart[].amount` (in cents). Because the amount is set, the
// customer cannot edit the price on Dodo's hosted page, and currency selection
// is disabled so the charge stays in EUR.

import { NextResponse } from "next/server";
import { getDodoClient, nameFromEmail } from "@/lib/dodo";

interface CheckoutBody {
  leads?: number;
  email?: string;
  query?: string;
  location?: string;
}

const MIN_LEADS = 100;
const MAX_LEADS = 1000;
const PRICE_PER_LEAD_CENTS = 100; // €1.00 per lead, in the currency's lowest unit.

export async function POST(request: Request): Promise<Response> {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const leads = Number(body.leads);
  const email = (body.email ?? "").trim();
  const query = (body.query ?? "").trim();
  const location = (body.location ?? "").trim();

  // (3) Validate leads server-side; the price is derived from this, never trusted from the client.
  if (!Number.isInteger(leads) || leads < MIN_LEADS || leads > MAX_LEADS) {
    return NextResponse.json(
      { error: `"leads" must be an integer between ${MIN_LEADS} and ${MAX_LEADS}.` },
      { status: 400 },
    );
  }
  if (!/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!query) {
    return NextResponse.json({ error: "A business category/query is required." }, { status: 400 });
  }

  const productId = process.env.DODO_LEAD_PRODUCT_ID;
  if (!productId) {
    return NextResponse.json(
      { error: "Server misconfigured: DODO_LEAD_PRODUCT_ID is not set." },
      { status: 500 },
    );
  }

  const origin = new URL(request.url).origin;

  try {
    const client = getDodoClient();
    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
          // (1) Fix the total server-side: N leads × €1 = N * 100 cents.
          // (2) Because `amount` is set on a pay-what-you-want product, the customer
          //     cannot change the price on the hosted checkout page.
          amount: leads * PRICE_PER_LEAD_CENTS,
        },
      ],
      // Dodo requires a customer name; we only collect an email, so derive one.
      customer: { email, name: nameFromEmail(email) },
      // (4) Keep the charge in EUR — the product is EUR-priced and we forbid switching currency.
      feature_flags: { allow_currency_selection: false },
      return_url: `${origin}/checkout/success`,
      // (5) Ride-along order details for the payment.succeeded webhook.
      metadata: {
        email,
        query,
        location,
        leads: String(leads),
      },
    });

    // Frontend redirects to this. Return both keys so either `url` or `checkoutUrl` works.
    return NextResponse.json({ url: session.checkout_url, checkoutUrl: session.checkout_url });
  } catch (err) {
    console.error("checkout error:", err);
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
