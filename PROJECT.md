# NearoLeads-style Lead Generation Site — Project Spec

> This file is intended for **Claude Code**. Read it to the end, honor every
> technical requirement, and only then start writing code.

---

## 1. Project Goal (Business Overview)

We're building a single-page marketing site plus a backend engine that
**automatically finds businesses with weak or unmanaged social media pages** —
for example, businesses that **haven't posted in the last 30 days**, or whose
**Instagram/Facebook page is abandoned**.

This is a **"hot" signal**: exactly these businesses need our service (SMM / web
/ marketing) the most.

**The approach (core of the product):**
1. **Collect public data** — find real businesses via the **Google Places API**.
2. **Analyze activity** — check each business's social presence and last-post
   recency to detect neglected / abandoned pages.
3. **Build a prioritized list** — rank businesses by how "hot" they are and
   deliver the list to the customer.

The customer buys a lead package (not a subscription), pays with
**Dodo Payments**, and the list is delivered **by email (via Resend)**.

### Pricing
- **1 lead = €1** (one euro).
- Package = number of leads chosen by the customer × €1.
- E.g.: 100 leads = €100, 400 = €400, 1000 = €1000.

---

## 2. Data Engine — THE CORE (Google Places + Activity Analysis)

This is the most important part of the product. Build it as a reusable module
in `/lib/leads/`.

### 2.1 Step 1 — Find businesses (Google Places API)

Use the **Google Places API** to find real local businesses.

- Endpoint flow:
  - **Text Search / Nearby Search** -> get a list of places by
    `category` + `location` (and optional radius).
  - **Place Details** -> for each place, fetch: `name`, `types` (category),
    `formatted_address`, `formatted_phone_number`, `website`, `rating`,
    `user_ratings_total`, `business_status`.
- Function: `lib/leads/places.ts` -> `searchBusinesses({ query, location, radius, limit })`
  returns an array of normalized business objects.

> WARNING (Claude Code): Look up the **latest official Google Places API docs**
> before coding. Google is migrating from the legacy Places API to the new
> **Places API (New)** — confirm which endpoints, request format, and field
> masks are current. Don't rely on memory.

**What Google Places GIVES us:** name, category, address, phone, website,
rating, business status.

**What Google Places does NOT give us:** the Instagram/Facebook page link, and
the **date of the last social post**. So social activity is a separate step
(2.2 below).

### 2.2 Step 2 — Find & analyze social activity

Goal: for each business, determine whether its social page is **neglected**
(no post in the last 30 days) or **abandoned**.

Because Google doesn't provide social links or post dates, do this in stages.
Implement what's feasible now; leave clearly-marked `// TODO` for the rest.

1. **Discover the social handle** (best-effort):
   - If the business `website` exists, fetch its HTML and look for
     `instagram.com/...` or `facebook.com/...` links. (`lib/leads/social.ts`)
   - `// TODO`: fallback handle-guessing / search if no website.
2. **Assess activity**:
   - `// TODO`: check last-post recency. Note in code comments that
     Instagram/Facebook restrict scraping and official Graph API access to a
     page's posts generally requires that page's own permission — so for the
     MVP, mark businesses with **no discoverable/active social link** as a
     strong "hot" candidate, and leave a `lastPost` field as
     `"unknown" | "no posts" | "<N> days ago"`.
3. **Score & prioritize**:
   - `lib/leads/score.ts` -> `scoreLead(business)` returns a 0–100 "hotness"
     score. Higher = more neglected (no social link found, or oldest last post,
     or `business_status` OPERATIONAL but no web presence).
   - Sort the final list by score descending -> this is the "prioritized list".

### 2.3 Output shape (one lead)

```json
{
  "name": "Juniper & Co. Salon",
  "category": "Hair salon",
  "location": "Austin, TX",
  "lastPost": "45 days ago",
  "instagram": "@junipersalon",
  "facebook": "fb.com/junipersalon",
  "telephone": "+1 (512) 555-0142",
  "email": "hello@example.com",
  "website": "https://junipersalon.com",
  "hotScore": 82
}
```

- CSV export: `lib/csv.ts` -> `leadsToCsv(leads[])`.
- For local dev without burning API quota, keep a `data/leads.sample.json`
  fixture and a flag to use it instead of live Google calls.

### Required env variables (data engine)
```
GOOGLE_PLACES_API_KEY=
USE_SAMPLE_DATA=false        # true -> use data/leads.sample.json instead of live API
```

---

## 3. Design Reference (the site)

The design reference is **https://nearoleads.com/#top**. Replicate its
structure and mood, but the product is **"abandoned / inactive social media
leads"**.

### Page Structure (sections in order)

1. **Navbar** — logo left, CTA button right ("Buy Leads" -> scroll to pricing).
2. **Hero** —
   - Headline: *"Find local businesses that are neglecting their social media."*
   - Subhead: *"Stop hunting for clients — we hand you the ones who need you most."*
   - CTA: **"Order now"** (scroll to pricing).
3. **CSV Preview** — example delivery table (mock data) so the customer sees
   what they get. Columns:
   `Name | Category | Location | Last Post | Instagram | Facebook | Telephone | Email`
   - `Last Post` shows "45 days ago", "62 days ago", "No posts" — emphasizing
     the "hot" signal.
4. **How it works** — 3 steps:
   `01 Collect public data -> 02 Analyze activity -> 03 Deliver a prioritized list`
5. **Pricing** — slider (100–1000 leads), live price (€1/lead),
   CTA **"Send me my list"** -> Dodo Payments checkout.
6. **FAQ** (short, 4–5 questions).
7. **Footer** — logo, Contact, FAQ links.

### Visual Tone
- Clean, modern, "SaaS lead-gen" mood.
- **Do not** use the default AI look (cream #F4F1EA background + terracotta
  #D97757 accent — a cliché). Pick a distinct, deliberate palette.
- Suggested direction (refine as needed):
  - Background: deep navy / near-black (`#0B1120`).
  - Accent: one vivid color — electric lime or signal-cyan (`#3DF5A0` / `#22D3EE`).
  - Text: warm white (`#F5F7FA`) + muted gray secondary (`#94A3B8`).
  - Type: sharp grotesk for display (**Space Grotesk** / **Clash Display**),
    clean sans for body (**Inter**).
- **Signature element**: an "activity meter" / pulsing indicator showing a page
  is "dead" (flat-line or red "no activity" pulse) — conveys the "hot lead" idea.
- Responsive to mobile, keyboard focus visible, `prefers-reduced-motion` respected.

---

## 4. Tech Stack

- **Framework**: Next.js (App Router) + TypeScript.
- **Styling**: Tailwind CSS.
- **Data**: **Google Places API** (+ social activity analysis module).
- **Payments**: **Dodo Payments** (checkout + webhook).
- **Email**: **Resend** (deliver the lead list as a CSV attachment).
- **Tooling**: **Makefile** (see section 8).
- **Deploy target**: Vercel (with env vars).

---

## 5. Dodo Payments Integration

Use the official Dodo Payments SDK / API.

1. **Checkout session** — `POST /api/checkout`:
   - Receives `{ leads, email, query, location }`.
   - Amount = `leads * 100` cents (€1/lead).
   - Creates a Dodo checkout session, returns the redirect URL.
2. **Webhook** — `POST /api/webhooks/dodo`:
   - Verifies the webhook signature (Dodo secret).
   - On `payment.succeeded` -> run the data engine (section 2) for the
     requested `query/location/leads`, generate CSV, and trigger the Resend
     email.
3. **Success / cancel** pages.

### Required env variables
```
DODO_PAYMENTS_API_KEY=
DODO_WEBHOOK_SECRET=
DODO_ENVIRONMENT=test        # test | live
```

> WARNING: Verify the **latest official Dodo Payments docs** before coding
> (package name, endpoints, webhook verification). Don't rely on memory.

---

## 6. Resend Integration (Email Delivery)

After payment is confirmed:

1. Generate the CSV of the prioritized lead list.
2. Send via **Resend**:
   - From: `leads@yourdomain.com` (verified domain).
   - To: the customer's email.
   - Subject: `Your NearoLeads list is ready (N leads)`.
   - Attachment: `leads.csv`.
3. `lib/email.ts` -> `sendLeadsEmail({ to, leads, csvBuffer })`.

### Required env variables
```
RESEND_API_KEY=
RESEND_FROM_EMAIL=leads@yourdomain.com
```

> WARNING: Verify the latest Resend SDK syntax (attachments format).

---

## 7. Expected File Structure

```
/app
  /page.tsx                 # landing (hero, pricing, faq)
  /api/checkout/route.ts    # Dodo checkout session
  /api/webhooks/dodo/route.ts
  /api/leads/preview/route.ts   # optional: live preview of a few leads
  /checkout/success/page.tsx
  /checkout/cancel/page.tsx
/components
  Navbar.tsx  Hero.tsx  CsvPreview.tsx  HowItWorks.tsx
  PricingSlider.tsx  Faq.tsx  Footer.tsx
/lib
  /leads
    places.ts     # Google Places API calls
    social.ts     # discover Instagram/Facebook links + activity
    score.ts      # hotness scoring + prioritization
    index.ts      # orchestrates: search -> analyze -> score -> sort
  dodo.ts
  email.ts
  csv.ts
/data
  leads.sample.json
.env.example
Makefile
README.md
```

---

## 8. Makefile (required)

Create a `Makefile` with at least these targets:

```make
install:        ## Install dependencies
	npm install

dev:            ## Run the dev server
	npm run dev

build:          ## Production build
	npm run build

start:          ## Start the production server
	npm run start

lint:           ## Lint the codebase
	npm run lint

leads:          ## Run the data engine once from CLI (query + location)
	npx tsx scripts/run-leads.ts

env:            ## Copy .env.example -> .env.local
	cp .env.example .env.local

help:           ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
```

Also add `scripts/run-leads.ts` so `make leads` can test the Google Places +
scoring pipeline from the terminal without going through payment.

---

## 9. Acceptance Criteria

- [ ] The **data engine** finds real businesses via **Google Places API** and
      returns a scored, prioritized list.
- [ ] Social-activity analysis discovers Instagram/Facebook links where
      possible and marks neglected pages; unresolved parts are clear `// TODO`s.
- [ ] `USE_SAMPLE_DATA=true` runs the whole flow offline from the fixture.
- [ ] The landing page mirrors NearoLeads' structure for the new product.
- [ ] Pricing slider shows **€1/lead** and computes the total live.
- [ ] "Send me my list" creates a **Dodo Payments** checkout.
- [ ] Successful-payment webhook runs the engine and emails the CSV via **Resend**.
- [ ] A working **Makefile** with the targets above.
- [ ] `.env.example` contains every required variable.
- [ ] Responsive + accessible; design is NOT the default AI cream+terracotta look.

---

## 10. Instructions for Claude Code (Run Order)

1. **First**: web-search the latest official docs for **Google Places API (New)**,
   **Dodo Payments**, and **Resend**. Confirm current endpoints/SDKs.
2. Scaffold Next.js + TypeScript + Tailwind.
3. Build the **data engine** in `/lib/leads/` (places -> social -> score -> sort)
   with `USE_SAMPLE_DATA` support and `scripts/run-leads.ts`.
4. Build the landing page section by section (section 3).
5. Add Dodo checkout + webhook; wire the webhook to run the engine.
6. Add Resend email delivery + CSV export.
7. Write the **Makefile**, `.env.example`, and a short `README.md`.
8. Finally — `make build` and confirm every route + `make leads` works.
