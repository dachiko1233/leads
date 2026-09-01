// Social-presence + contact discovery from a business website.
//
// Google Places gives us a website but NOT the Instagram/Facebook/LinkedIn link,
// an email, or the date of the last post. So we scan the business website's HTML
// (homepage + a few likely contact pages) to discover handles and emails,
// best-effort. Post-recency stays a marked TODO because Instagram/Facebook
// restrict scraping and their Graph API generally needs the page owner's
// permission to read posts.

import type { Business, SocialPresence } from "./types";

const INSTAGRAM_RE = /https?:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9_.]+)/i;
const FACEBOOK_RE = /https?:\/\/(?:www\.)?facebook\.com\/([A-Za-z0-9_.\-/]+)/i;
const LINKEDIN_RE =
  /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(company|school|in|pub)\/([A-Za-z0-9_%\-.]+)/i;
const MAILTO_RE = /mailto:([^"'?\s>]+)/gi;
// Plain-text emails anywhere in the HTML (contact pages often list them as text).
const TEXT_EMAIL_RE = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;

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

// Email domains that are trackers/placeholders/vendors, never a real lead.
const EMAIL_DOMAIN_BLOCKLIST = [
  "sentry.io",
  "sentry-next.wixpress.com",
  "wixpress.com",
  "example.com",
  "example.org",
  "domain.com",
  "email.com",
  "yourdomain.com",
  "sentry.wixpress.com",
];
// Image/asset extensions that the plain-text email regex can false-match on.
const ASSET_EXT_RE = /\.(png|jpe?g|gif|webp|svg|css|js|ico)$/i;

// Local-parts that indicate an owner/decision-maker, most desirable first.
const OWNER_LOCALPARTS = ["owner", "founder", "ceo", "president", "director"];
// Generic-but-useful role addresses, in preference order.
const ROLE_LOCALPARTS = ["hello", "contact", "info", "sales", "team", "office", "admin"];

// Same-origin paths most likely to carry contact details.
const CONTACT_PATHS = ["/contact", "/contact-us", "/about", "/about-us", "/team"];

const FETCH_TIMEOUT_MS = 8000;
// Cap total page fetches per business so one site can't stall the pipeline.
const MAX_PAGES = 4;

/**
 * Discover a business's social presence + contact email by scanning its website.
 * Never throws — on any failure it returns an "empty" presence so the pipeline
 * keeps going (and an empty presence is itself a strong "hot" signal).
 */
export async function discoverSocial(business: Business): Promise<SocialPresence> {
  const empty: SocialPresence = {
    instagram: null,
    facebook: null,
    linkedin: null,
    email: null,
    lastPost: "unknown",
  };

  if (!business.website) return empty;

  const html = await fetchSiteHtml(business.website);
  if (!html) return empty;

  return {
    instagram: extractInstagram(html),
    facebook: extractFacebook(html),
    linkedin: extractLinkedin(html),
    email: pickBestEmail(extractEmails(html), business.website),
    // TODO: determine real last-post recency. Requires the page owner's Graph API
    // permission (or a compliant third-party provider). For the MVP we keep this
    // "unknown"; the scorer treats a missing social link as the hottest signal.
    lastPost: "unknown",
  };
}

/**
 * Fetch the homepage plus a few likely contact pages (same origin) and return
 * their concatenated HTML. Stops early once enough pages are fetched.
 */
async function fetchSiteHtml(website: string): Promise<string | null> {
  let origin: string;
  try {
    origin = new URL(website).origin;
  } catch {
    return null;
  }

  const urls = [website, ...CONTACT_PATHS.map((p) => origin + p)].slice(0, MAX_PAGES);
  const results = await Promise.all(urls.map((u) => fetchHtml(u)));
  const combined = results.filter((h): h is string => Boolean(h)).join("\n");
  return combined || null;
}

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "GhostLeadsBot/1.0 (+lead discovery)" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("text/html")) return null;
    return await res.text();
  } catch {
    return null; // timeout, DNS failure, TLS error, 404, etc. — treat as no data
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

function extractLinkedin(html: string): string | null {
  const m = html.match(LINKEDIN_RE);
  if (!m) return null;
  const kind = m[1].toLowerCase();
  const slug = m[2].replace(/\/$/, "");
  if (!slug) return null;
  return `linkedin.com/${kind}/${slug}`;
}

/** Collect every plausible email from the HTML (mailto: links + plain text). */
function extractEmails(html: string): string[] {
  const found = new Set<string>();

  for (const m of html.matchAll(MAILTO_RE)) {
    const email = decodeURIComponent(m[1]).trim().toLowerCase();
    if (isUsableEmail(email)) found.add(email);
  }
  for (const m of html.matchAll(TEXT_EMAIL_RE)) {
    const email = m[0].trim().toLowerCase();
    if (isUsableEmail(email)) found.add(email);
  }
  return [...found];
}

function isUsableEmail(email: string): boolean {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return false;
  if (ASSET_EXT_RE.test(email)) return false; // e.g. logo@2x.png false-matches
  const domain = email.split("@")[1] ?? "";
  if (EMAIL_DOMAIN_BLOCKLIST.includes(domain)) return false;
  return true;
}

/**
 * Choose the single best email for the lead:
 *   1. prefer addresses on the business's own website domain,
 *   2. among those, prefer owner/decision-maker local-parts, then role inboxes,
 *   3. otherwise fall back to the first usable address found.
 */
function pickBestEmail(emails: string[], website: string): string | null {
  if (emails.length === 0) return null;

  let siteDomain = "";
  try {
    siteDomain = new URL(website).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    /* ignore — siteDomain stays empty */
  }

  const onDomain = siteDomain
    ? emails.filter((e) => e.endsWith("@" + siteDomain))
    : [];
  const pool = onDomain.length > 0 ? onDomain : emails;

  const localPart = (e: string) => e.split("@")[0];
  const rank = (e: string): number => {
    const lp = localPart(e);
    const owner = OWNER_LOCALPARTS.findIndex((p) => lp.includes(p));
    if (owner !== -1) return owner; // 0..N — best
    const role = ROLE_LOCALPARTS.findIndex((p) => lp.includes(p));
    if (role !== -1) return 100 + role;
    return 500;
  };

  return [...pool].sort((a, b) => rank(a) - rank(b))[0];
}
