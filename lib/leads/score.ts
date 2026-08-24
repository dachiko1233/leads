// Hotness scoring: how badly does this business need social/marketing help?
//
// Higher score (0-100) = more neglected = hotter lead. The strongest signals we
// can measure at MVP are the ABSENCE of a discoverable social presence and a
// thin online footprint (no website, few/no reviews), for a business that is
// still OPERATIONAL (i.e. a real, reachable customer).

import type { Business, Lead, SocialPresence } from "./types";

/**
 * Compute a 0-100 hotness score from a business + its discovered social presence.
 */
export function scoreLead(business: Business, social: SocialPresence): number {
  let score = 0;

  const hasInstagram = Boolean(social.instagram);
  const hasFacebook = Boolean(social.facebook);
  const hasAnySocial = hasInstagram || hasFacebook;
  const hasWebsite = Boolean(business.website);

  // 1) No social presence at all — the core "hot" signal.
  if (!hasAnySocial) {
    score += 45;
  } else if (!hasInstagram || !hasFacebook) {
    // Present on only one network — partially neglected.
    score += 15;
  }

  // 2) Old / unknown last post. Once real recency is available (see social.ts
  //    TODO), scale this by the number of days since the last post.
  if (social.lastPost === "no posts") {
    score += 20;
  } else if (social.lastPost === "unknown") {
    score += 8;
  } else {
    const days = parseDaysAgo(social.lastPost);
    if (days !== null) {
      // 30 days ~ +6, 90+ days -> capped at +25.
      score += Math.min(25, Math.round((days / 30) * 6));
    }
  }

  // 3) No website — weak overall web presence.
  if (!hasWebsite) score += 20;

  // 4) Thin review footprint suggests low online engagement.
  const reviews = business.userRatingsTotal ?? 0;
  if (reviews === 0) score += 15;
  else if (reviews < 10) score += 10;
  else if (reviews < 50) score += 4;

  // 5) Only pitch businesses that are actually operating.
  if (business.businessStatus && business.businessStatus !== "OPERATIONAL") {
    score -= 40;
  }

  return clamp(score, 0, 100);
}

/** Build the final customer-facing {@link Lead} from its parts. */
export function toLead(business: Business, social: SocialPresence): Lead {
  return {
    name: business.name,
    category: business.category,
    location: business.location,
    lastPost: social.lastPost,
    instagram: social.instagram,
    facebook: social.facebook,
    telephone: business.telephone,
    email: social.email,
    website: business.website,
    hotScore: scoreLead(business, social),
  };
}

function parseDaysAgo(value: string): number | null {
  const m = value.match(/(\d+)\s*days?\s*ago/i);
  return m ? Number(m[1]) : null;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
