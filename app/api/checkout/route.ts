// POST /api/checkout — create a Dodo Payments checkout session for a lead package.

import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/dodo";

interface CheckoutBody {
  leads?: number;
  email?: string;
  query?: string;
  location?: string;
}

const MIN_LEADS = 100;
const MAX_LEADS = 1000;

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

  if (!Number.isFinite(leads) || leads < MIN_LEADS || leads > MAX_LEADS) {
    return NextResponse.json(
      { error: `"leads" must be between ${MIN_LEADS} and ${MAX_LEADS}.` },
      { status: 400 },
    );
  }
  if (!/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!query) {
    return NextResponse.json({ error: "A business category/query is required." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;

  try {
    const checkoutUrl = await createCheckoutSession({
      leads,
      email,
      query,
      location,
      returnUrl: `${origin}/checkout/success`,
    });
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("checkout error:", err);
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
