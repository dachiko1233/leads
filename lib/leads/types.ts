// Shared types for the lead-generation data engine.

/** Raw-ish business record after normalizing a Google Places result. */
export interface Business {
  placeId: string;
  name: string;
  category: string;
  location: string; // formatted address
  telephone: string | null;
  website: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
  businessStatus: string | null; // OPERATIONAL | CLOSED_TEMPORARILY | CLOSED_PERMANENTLY
}

/** Social presence discovered for a business. */
export interface SocialPresence {
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  email: string | null;
  /**
   * Recency of the last social post.
   * MVP: "unknown" when we cannot determine it (scraping/Graph API restricted),
   * "no posts" when a page exists but is empty, or "<N> days ago".
   */
  lastPost: "unknown" | "no posts" | string;
}

/** The final, customer-facing lead shape (see PROJECT.md 2.3). */
export interface Lead {
  name: string;
  category: string;
  location: string;
  lastPost: string;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  telephone: string | null;
  email: string | null;
  website: string | null;
  hotScore: number; // 0-100, higher = more neglected = hotter
}

export interface GenerateLeadsParams {
  query: string;
  location?: string;
  /** Search radius in meters (only used when lat/lng bias is available). */
  radius?: number;
  /** Max number of leads to return. */
  limit: number;
}
