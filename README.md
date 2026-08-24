# NearoLeads

Find local businesses that are **neglecting their social media** — the clients
who need SMM / web / marketing help the most — and deliver them as a scored,
prioritized CSV. Pay per lead (€1/lead) via Dodo Payments; delivery by email via
Resend.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Google Places API (New)** for business discovery
- **Dodo Payments** for checkout + webhook
- **Resend** for CSV email delivery

## Quick start

```bash
make install       # install deps
make env           # cp .env.example -> .env.local, then fill it in
make leads         # run the data engine from the CLI
make dev           # start the dev server at http://localhost:3000
```

### Run the engine offline (no API quota)

Set `USE_SAMPLE_DATA=true` in `.env.local`, then:

```bash
make leads
# or with args:
npx tsx scripts/run-leads.ts "coffee shop" "Portland, OR" 20
```

This reads `data/leads.sample.json`, scores + sorts it, prints the ranked list,
and writes `data/leads.out.csv`.

## The data engine (`/lib/leads/`)

The core of the product. `generateLeads({ query, location, limit })` runs:

1. **`places.ts`** — Google Places **Text Search (New)**
   (`POST /v1/places:searchText`) to find real businesses. All needed fields are
   requested in one call via `X-Goog-FieldMask` (no per-place Details call).
2. **`social.ts`** — fetches each business website and scrapes `instagram.com` /
   `facebook.com` links and a contact email (best-effort). Post-recency is a
   marked `// TODO` because Instagram/Facebook restrict scraping and the Graph
   API needs the page owner's permission.
3. **`score.ts`** — `scoreLead()` returns a 0–100 **hotness** score. Higher =
   more neglected (no social link, thin web presence, few reviews).
4. **`index.ts`** — orchestrates search → analyze → score → **sort descending**.

`lib/csv.ts` serializes the list to CSV.

## Payment + delivery flow

1. `POST /api/checkout` — validates the order and creates a Dodo checkout
   session (`quantity = leads`, order details in `metadata`); returns
   `checkout_url`.
2. `POST /api/webhooks/dodo` — verifies the Standard Webhooks signature, and on
   `payment.succeeded` runs the engine for the purchased `query/location/leads`,
   builds the CSV, and emails it via Resend.
3. `/checkout/success` and `/checkout/cancel` pages.

## Environment variables

See [`.env.example`](./.env.example). Notably:

| Variable | Purpose |
| --- | --- |
| `GOOGLE_PLACES_API_KEY` | Places API (New) key |
| `USE_SAMPLE_DATA` | `true` runs everything offline from the fixture |
| `DODO_PAYMENTS_API_KEY` / `DODO_WEBHOOK_SECRET` / `DODO_ENVIRONMENT` | Dodo checkout + webhook |
| `DODO_LEAD_PRODUCT_ID` | the €1 "lead" product (quantity = number of leads) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | email delivery |

## Deploy

Deploy to **Vercel**. Add every variable from `.env.example` in the project
settings, and point your Dodo webhook at `/api/webhooks/dodo`.

## Make targets

```
make install   install dependencies
make dev       run the dev server
make build     production build
make start     start the production server
make lint      lint the codebase
make leads     run the data engine once from the CLI
make env       cp .env.example -> .env.local
make help      list targets
```
