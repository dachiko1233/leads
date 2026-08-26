// Google Places API (New) — Text Search.
//
// Verified against the current official docs (Aug 2026):
//   POST https://places.googleapis.com/v1/places:searchText
//   Headers: X-Goog-Api-Key, X-Goog-FieldMask
//   Body:    { textQuery, pageSize, pageToken, locationBias? }
//   Response:{ places: [...], nextPageToken }
// Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
//
// We request every field we need directly in the Text Search field mask, which
// avoids a separate Place Details call per business (saves quota / latency).

import type { Business } from "./types";

const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

// Max page size allowed by the API is 20; we paginate to reach `limit`.
const MAX_PAGE_SIZE = 20;

// Fields we ask Google to return. Note the `places.` prefix required for search.
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.primaryTypeDisplayName",
  "places.types",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
].join(",");

interface PlaceResult {
  id?: string;
  displayName?: { text?: string; languageCode?: string };
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
}

interface PlacesTextSearchResponse {
  places?: PlaceResult[];
  nextPageToken?: string;
}

// A single Text Search query is capped by Google at ~60 results (3 pages of 20),
// so we can never reach a large `limit` from one query. Guard the per-query page
// loop against a stuck token (a page returning a token but no places).
const MAX_PAGES_PER_QUERY = 5;

export interface SearchBusinessesParams {
  query: string;
  location?: string;
  radius?: number; // meters; reserved for lat/lng-biased search (see TODO)
  limit: number;
}

/**
 * Search for real local businesses via Google Places Text Search (New).
 * Returns normalized {@link Business} objects, up to `limit`.
 *
 * Because one Text Search query tops out at ~60 results, we run a series of
 * broadened query variants (deduped by placeId) until we reach `limit` or run
 * out of variants. If Google still returns fewer than requested, we return what
 * we found — the caller decides how to surface the shortfall.
 */
export async function searchBusinesses({
  query,
  location,
  limit,
}: SearchBusinessesParams): Promise<Business[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_PLACES_API_KEY is not set. Set it in .env.local, or set USE_SAMPLE_DATA=true to run offline.",
    );
  }

  // Places API (New) requires paged requests to keep the same params as the
  // first call, so pageSize must stay constant across pages (not shrink).
  const pageSize = Math.min(MAX_PAGE_SIZE, limit);

  // Dedupe across query variants by placeId, preserving first-seen order.
  const seen = new Map<string, Business>();

  for (const textQuery of buildQueryVariants(query, location)) {
    if (seen.size >= limit) break;
    const page = await paginateQuery({ textQuery, apiKey, pageSize, cap: limit - seen.size });
    for (const b of page) {
      // Skip empty placeIds so they can't collide in the dedupe map.
      if (b.placeId && !seen.has(b.placeId)) seen.set(b.placeId, b);
    }
  }

  return Array.from(seen.values()).slice(0, limit);
}

/**
 * Build an ordered list of Text Search queries, widening progressively.
 * The New Text Search understands natural-language location, so we fold the
 * location into the query text (e.g. "hair salon in Austin, TX").
 * TODO: for radius-constrained search, geocode `location` -> lat/lng and pass
 * `locationBias.circle` with `radius`.
 */
function buildQueryVariants(query: string, location?: string): string[] {
  if (!location) return [query];
  // Order matters: most precise first, then broader phrasings and nearby framing
  // to pull additional relevant businesses past the single-query 60-result cap.
  return [
    `${query} in ${location}`,
    `${query} near ${location}`,
    `best ${query} in ${location}`,
    `${query} services in ${location}`,
    `local ${query} ${location}`,
  ];
}

/**
 * Paginate a single Text Search query via `nextPageToken` until we collect `cap`
 * businesses or Google runs out of pages. Returns normalized businesses.
 */
async function paginateQuery({
  textQuery,
  apiKey,
  pageSize,
  cap,
}: {
  textQuery: string;
  apiKey: string;
  pageSize: number;
  cap: number;
}): Promise<Business[]> {
  const businesses: Business[] = [];
  let pageToken: string | undefined;

  for (let pages = 0; businesses.length < cap && pages < MAX_PAGES_PER_QUERY; pages++) {
    const body: Record<string, unknown> = { textQuery, pageSize };
    if (pageToken) body.pageToken = pageToken;

    const res = await fetch(TEXT_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Google Places Text Search failed (${res.status}): ${detail}`);
    }

    const data = (await res.json()) as PlacesTextSearchResponse;
    const places = data.places ?? [];
    for (const p of places) {
      businesses.push(normalizePlace(p));
    }

    // Stop if there are no more pages, or a page came back empty (stuck token).
    if (!data.nextPageToken || places.length === 0) break;
    pageToken = data.nextPageToken;
  }

  return businesses;
}

function normalizePlace(p: PlaceResult): Business {
  return {
    placeId: p.id ?? "",
    name: p.displayName?.text ?? "Unknown",
    category: p.primaryTypeDisplayName?.text ?? humanizeType(p.types?.[0]) ?? "Business",
    location: p.formattedAddress ?? "",
    telephone: p.internationalPhoneNumber ?? p.nationalPhoneNumber ?? null,
    website: p.websiteUri ?? null,
    rating: typeof p.rating === "number" ? p.rating : null,
    userRatingsTotal: typeof p.userRatingCount === "number" ? p.userRatingCount : null,
    businessStatus: p.businessStatus ?? null,
  };
}

/** Turn a raw place type like "hair_care" into "Hair Care" as a fallback label. */
function humanizeType(type?: string): string | undefined {
  if (!type) return undefined;
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
