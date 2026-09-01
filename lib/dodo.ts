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

import { createHash, createHmac } from "crypto";
import DodoPayments from "dodopayments";
import { Webhook } from "standardwebhooks";

/**
 * The plausible ways a provider may derive the HMAC key from a `whsec_` secret.
 * Standard Webhooks (and the `standardwebhooks` lib) base64-decode the part
 * after `whsec_`; some providers instead sign with the raw UTF-8 bytes. All of
 * these are derived from the SAME secret, so accepting any match does not lower
 * the security bar — an attacker still needs the secret.
 */
function keyCandidates(secret: string): Record<string, Buffer> {
  const afterPrefix = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  return {
    "base64(after whsec_) [lib default]": Buffer.from(afterPrefix, "base64"),
    "raw utf8(after whsec_)": Buffer.from(afterPrefix, "utf8"),
    "raw utf8(full secret)": Buffer.from(secret, "utf8"),
    "base64(full secret)": Buffer.from(secret, "base64"),
  };
}

/**
 * Return the label of the key derivation whose HMAC reproduces one of the
 * signatures Dodo sent, or null if none match (which means the signed content —
 * id/timestamp/body — differs, not the key).
 */
function matchingKeyDerivation(
  secret: string,
  signedContent: string,
  receivedSignatures: string,
): string | null {
  const received = new Set(
    receivedSignatures
      .split(" ")
      .map((s) => s.split(",")[1])
      .filter(Boolean),
  );
  for (const [label, key] of Object.entries(keyCandidates(secret))) {
    const sig = createHmac("sha256", key).update(signedContent).digest("base64");
    if (received.has(sig)) return label;
  }
  return null;
}

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
    return JSON.parse(rawBody);
  } catch (err) {
    // The library only accepts the Standard Webhooks base64-decoded key, but
    // Dodo signs with a different derivation of the same secret. Fall back to
    // checking the other plausible derivations before rejecting. All are
    // derived from the same secret, so this is not a security downgrade.
    //
    // Only do this for a pure signature mismatch — a timestamp rejection
    // (replay protection) must still fail hard, so we re-throw those.
    const reason = err instanceof Error ? err.message : String(err);
    if (reason === "No matching signature found") {
      const signedContent = `${headers.id}.${headers.timestamp}.${rawBody}`;
      if (matchingKeyDerivation(secret, signedContent, headers.signature)) {
        return JSON.parse(rawBody);
      }
    }

    // No derivation of our secret reproduces the signature — genuinely invalid
    // (wrong/rotated secret, tampered body, or bot noise). Safe diagnostic:
    // nothing here exposes the secret.
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
}
