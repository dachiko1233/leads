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

export interface SearchBusinessesParams {
  query: string;
  location?: string;
  radius?: number; // meters; reserved for lat/lng-biased search (see TODO)
  limit: number;
}

/**
 * Search for real local businesses via Google Places Text Search (New).
 * Returns normalized {@link Business} objects, up to `limit`.
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

  // The New Text Search understands natural-language location, so we simply
  // fold the location into the query (e.g. "hair salon in Austin, TX").
  // TODO: for radius-constrained search, geocode `location` -> lat/lng and pass
  // `locationBias.circle` with `radius`.
  const textQuery = location ? `${query} in ${location}` : query;

  const businesses: Business[] = [];
  let pageToken: string | undefined;

  // Paginate until we have enough results or Google runs out of pages.
  while (businesses.length < limit) {
    const body: Record<string, unknown> = {
      textQuery,
      pageSize: Math.min(MAX_PAGE_SIZE, limit - businesses.length),
    };
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
    for (const p of data.places ?? []) {
      businesses.push(normalizePlace(p));
    }

    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return businesses.slice(0, limit);
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
