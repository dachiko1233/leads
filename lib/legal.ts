// ---------------------------------------------------------------------------
// Central business + legal details used across Contact / Refunds / Terms /
// Privacy pages. Edit these in one place and every legal page updates.
// ---------------------------------------------------------------------------

export const legal = {
  /** Public brand name shown to customers. */
  brand: "GhostLeads",

  /** Legal/registered name of the business or sole trader. EDIT ME. */
  legalName: "GhostLeads",

  /** Country you operate and are based in. EDIT ME. */
  country: "Georgia",

  /** Support / contact email. */
  email: "dachi@getghostleads.com",

  /** Public website URL (no trailing slash). EDIT ME. */
  website: "https://getghostleads.com",

  /** Payment processor (merchant of record). */
  processor: "Dodo Payments",

  /** Price per lead, in euros. Keep in sync with PricingSlider. */
  pricePerLead: 100,

  /** Date these policies were last reviewed. EDIT when you change them. */
  lastUpdated: "12 October 2026",
} as const;
