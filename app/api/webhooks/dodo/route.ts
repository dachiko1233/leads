// POST /api/webhooks/dodo — Dodo Payments webhook.
//
// MANUAL FULFILLMENT: on a successful payment we do NOT auto-generate or send
// leads. Instead we email the admin (ADMIN_EMAIL) an order notification with
// everything needed to fulfill by hand, and email the customer a confirmation
// that their leads will arrive within 24h. The lead generation + CSV emailing
// code still exists (lib/leads, lib/csv, sendLeadsEmail) for manual runs via
// scripts/run-leads.ts — it is simply no longer called from this path.
//
// IMPORTANT: we must read the RAW request body for signature verification, so
// this route does its own JSON parsing after verifying.

import { NextResponse, after } from "next/server";
import { verifyDodoWebhook } from "@/lib/dodo";
import { sendOrderNotificationEmail, sendOrderConfirmationEmail } from "@/lib/email";

// A subset of the Dodo webhook payload shape we rely on.
interface DodoEvent {
  type?: string;
  data?: {
    metadata?: Record<string, string>;
    customer?: { email?: string };
    payment_id?: string;
    total_amount?: number; // in the currency's lowest unit (cents)
    currency?: string;
    created_at?: string;
  };
}

export async function POST(request: Request): Promise<Response> {
 try {
  // Read the request framing up front so we can report it if the body read
  // fails or the payload arrives truncated.
  const contentType = request.headers.get("content-type");
  const contentLength = request.headers.get("content-length");

  // Read the RAW body inside its own try/catch. A client that drops the
  // connection mid-transfer (the ECONNRESET / "aborted" case) throws here
  // rather than returning a partial string, so we surface it explicitly
  // instead of letting the connection abort with no HTTP response.
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    console.error("webhook: failed to read request body (aborted/incomplete):", {
      error: err instanceof Error ? err.message : String(err),
      contentType,
      contentLength,
    });
    // The body is gone — nothing to verify. Reply so the socket closes cleanly.
    return NextResponse.json({ error: "Could not read request body." }, { status: 400 });
  }

  // TEMPORARY DIAGNOSTIC — how many bytes we actually read vs what was
  // declared. A mismatch means the body arrived incomplete (a symptom of the
  // connection being reset mid-request).
  const bytesRead = Buffer.byteLength(rawBody, "utf8");
  if (contentLength && Number(contentLength) !== bytesRead) {
    console.warn("webhook: body size mismatch (possible truncated body):", {
      declaredContentLength: contentLength,
      bytesRead,
      contentType,
    });
  }

  const signature = request.headers.get("webhook-signature");

  // This is a public URL, so bots/scanners constantly POST junk here. A genuine
  // Dodo webhook always carries a `webhook-signature` header; requests without
  // one are pure noise, so reject them silently and never log.
  if (!signature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const webhookTimestamp = request.headers.get("webhook-timestamp") ?? "";

  let event: DodoEvent;
  try {
    event = verifyDodoWebhook(rawBody, {
      id: request.headers.get("webhook-id") ?? "",
      signature,
      timestamp: webhookTimestamp,
    }) as DodoEvent;
  } catch (err) {
    // A signed-but-invalid payload is worth a single concise line (no stack
    // trace) so a real misconfiguration stays visible while logs stay readable.
    const message = err instanceof Error ? err.message : String(err);
    console.warn("webhook rejected (invalid signature):", message);

    // TEMPORARY DIAGNOSTIC — remove once the webhook failure is diagnosed.
    // Distinguishes a stale-timestamp rejection from a true signature mismatch,
    // and surfaces the request framing + which environment we're running as.
    // Nothing here exposes the secret or payload contents.
    const nowSeconds = Math.floor(Date.now() / 1000);
    const receivedSeconds = Number.parseInt(webhookTimestamp, 10);
    const deltaSeconds = Number.isNaN(receivedSeconds) ? null : nowSeconds - receivedSeconds;
    console.warn("webhook verify DIAGNOSTIC:", {
      reason: message,
      webhookTimestamp,
      serverTimeISO: new Date().toISOString(),
      serverTimeUnix: nowSeconds,
      deltaSeconds, // (now - webhook-timestamp); positive means the request is old
      contentType: request.headers.get("content-type"),
      contentLength: request.headers.get("content-length"),
      dodoEnvironment: process.env.DODO_ENVIRONMENT === "live" ? "live" : "test",
    });

    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  // Only act on a successful payment. Dodo uses `payment.succeeded`.
  if (event.type !== "payment.succeeded") {
    return NextResponse.json({ received: true, ignored: event.type ?? "unknown" });
  }

  const metadata = event.data?.metadata ?? {};
  const email = metadata.email ?? event.data?.customer?.email ?? "";
  const query = metadata.query ?? "";
  const location = metadata.location ?? "";
  const leadCount = Number(metadata.leads) || 0;

  if (!email || !query || leadCount <= 0) {
    console.error("webhook: missing order metadata", metadata);
    // Ack so Dodo does not retry a payload we can never fulfill.
    return NextResponse.json({ received: true, error: "missing order metadata" });
  }

  // Format the amount actually charged. Dodo sends `total_amount` in the
  // currency's lowest unit (cents); fall back to €1/lead if it is absent.
  const currency = event.data?.currency ?? "EUR";
  const amountCents = event.data?.total_amount ?? leadCount * 100;
  const amountPaid = formatAmount(amountCents, currency);
  const paymentId = event.data?.payment_id ?? "";
  const timestamp = event.data?.created_at ?? new Date().toISOString();

  // Respond to Dodo IMMEDIATELY, then do the slow work (two external Resend API
  // calls) after the response is sent. Sending email inline kept the connection
  // open for the duration of two network round-trips; if the client gave up
  // waiting the socket was reset (ECONNRESET) and Dodo saw a failed delivery.
  // `after()` runs the callback once the response has flushed — Next keeps the
  // invocation alive until it completes, so nothing is lost.
  after(async () => {
    // Manual fulfillment: notify the admin and confirm to the customer. Send
    // both independently so one failing doesn't block the other. Errors here
    // are logged, never thrown — the 200 has already been sent.
    const results = await Promise.allSettled([
      sendOrderNotificationEmail({
        customerEmail: email,
        query,
        location,
        leadCount,
        amountPaid,
        paymentId,
        timestamp,
      }),
      sendOrderConfirmationEmail(email),
    ]);

    results.forEach((result, i) => {
      if (result.status === "rejected") {
        const which = i === 0 ? "admin notification" : "customer confirmation";
        console.error(`webhook: ${which} email failed:`, result.reason);
      }
    });

    if (results.every((r) => r.status === "fulfilled")) {
      console.log(`Order received: ${leadCount} leads for ${email} — admin notified.`);
    }
  });

  return NextResponse.json({ received: true });
 } catch (err) {
  // Top-level safety net: any unexpected throw still returns a real HTTP
  // response instead of leaving the connection to abort. A 500 tells Dodo to
  // retry the delivery.
  console.error(
    "webhook: unhandled error:",
    err instanceof Error ? (err.stack ?? err.message) : String(err),
  );
  return NextResponse.json({ error: "Internal error." }, { status: 500 });
 }
}

/** Format a lowest-unit (cents) amount as a currency string, e.g. 5000 -> "€50.00". */
function formatAmount(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(cents / 100);
  } catch {
    // Unknown/invalid currency code — fall back to a plain formatted number.
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}
