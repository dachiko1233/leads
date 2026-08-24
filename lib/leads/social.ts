// Social-presence discovery + activity assessment.
//
// Google Places gives us a website but NOT the Instagram/Facebook link or the
// date of the last post. So we discover social handles from the business
// website's HTML (best-effort), and leave post-recency as a marked TODO because
// Instagram/Facebook restrict scraping and the Graph API generally requires the
// page owner's permission to read its posts.

import type { Business, SocialPresence } from "./types";

const INSTAGRAM_RE = /https?:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9_.]+)/i;
const FACEBOOK_RE = /https?:\/\/(?:www\.)?facebook\.com\/([A-Za-z0-9_.\-/]+)/i;
const EMAIL_RE = /mailto:([^"'?\s>]+)/i;

// Handles/paths that are navigation chrome, not the business's own page.
const IG_BLOCKLIST = new Set(["p", "explore", "accounts", "reel", "reels", "stories"]);
const FB_BLOCKLIST = new Set([
  "sharer",
  "sharer.php",
  "share.php",
  "dialog",
  "plugins",
  "tr",
  "profile.php",
]);

const FETCH_TIMEOUT_MS = 8000;

/**
 * Discover a business's social presence by scanning its website HTML.
 * Never throws — on any failure it returns an "empty" presence so the pipeline
 * keeps going (and an empty presence is itself a strong "hot" signal).
 */
export async function discoverSocial(business: Business): Promise<SocialPresence> {
  const empty: SocialPresence = {
    instagram: null,
    facebook: null,
    email: null,
    lastPost: "unknown",
  };

  if (!business.website) return empty;

  const html = await fetchHtml(business.website);
  if (!html) return empty;

  return {
    instagram: extractInstagram(html),
    facebook: extractFacebook(html),
    email: extractEmail(html),
    // TODO: determine real last-post recency. Requires the page owner's Graph API
    // permission (or a compliant third-party provider). For the MVP we keep this
    // "unknown"; the scorer treats a missing social link as the hottest signal.
    lastPost: "unknown",
  };
}

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "NearoLeadsBot/1.0 (+lead discovery)" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("text/html")) return null;
    return await res.text();
  } catch {
    return null; // timeout, DNS failure, TLS error, etc. — treat as no social found
  } finally {
    clearTimeout(timer);
  }
}

function extractInstagram(html: string): string | null {
  const m = html.match(INSTAGRAM_RE);
  if (!m) return null;
  const handle = m[1].replace(/\/$/, "");
  if (!handle || IG_BLOCKLIST.has(handle.toLowerCase())) return null;
  return `@${handle}`;
}

function extractFacebook(html: string): string | null {
  const m = html.match(FACEBOOK_RE);
  if (!m) return null;
  const path = m[1].replace(/\/$/, "");
  const first = path.split("/")[0].toLowerCase();
  if (!path || FB_BLOCKLIST.has(first)) return null;
  return `fb.com/${path}`;
}

function extractEmail(html: string): string | null {
  const m = html.match(EMAIL_RE);
  if (!m) return null;
  const email = decodeURIComponent(m[1]).trim();
  return /.+@.+\..+/.test(email) ? email : null;
}
