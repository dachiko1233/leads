"use client";

import { useState } from "react";

const MIN = 100;
const MAX = 1000;
const STEP = 50;
const PRICE_PER_LEAD = 1; // €1 / lead

export function PricingSlider() {
  const [leads, setLeads] = useState(300);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = leads * PRICE_PER_LEAD;
  const pct = ((leads - MIN) / (MAX - MIN)) * 100;

  async function handleCheckout() {
    setError(null);

    if (!query.trim()) return setError("Enter a business category (e.g. “hair salon”).");
    if (!/.+@.+\..+/.test(email)) return setError("Enter a valid email for delivery.");

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads, email, query, location }),
      });
      const data = (await res.json()) as { checkoutUrl?: string; error?: string };
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? "Could not start checkout.");
      }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <section id="pricing" className="mx-auto max-w-3xl px-6 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Pick your package</h2>
        <p className="mt-3 text-[color:var(--color-muted)]">
          €1 per lead. Slide to choose how many you want.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-[color:var(--color-ink-line)] bg-[color:var(--color-ink-soft)] p-8">
        {/* Live price */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm text-[color:var(--color-muted)]">Leads</div>
            <div className="font-display text-4xl font-bold">{leads}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[color:var(--color-muted)]">Total</div>
            <div className="font-display text-4xl font-bold text-[color:var(--color-cyan)]">
              €{total.toLocaleString("en-IE")}
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="mt-6">
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={leads}
            onChange={(e) => setLeads(Number(e.target.value))}
            aria-label="Number of leads"
            className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none"
            style={{
              background: `linear-gradient(to right, var(--color-cyan) ${pct}%, var(--color-ink-line) ${pct}%)`,
            }}
          />
          <div className="mt-2 flex justify-between text-xs text-[color:var(--color-muted)]">
            <span>{MIN}</span>
            <span>{MAX}</span>
          </div>
        </div>

        {/* Order details */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-[color:var(--color-muted)]">
              Business category
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. hair salon"
              className="w-full rounded-lg border border-[color:var(--color-ink-line)] bg-[color:var(--color-ink)] px-3 py-2 text-sm placeholder:text-[color:var(--color-muted)]/60 focus:border-[color:var(--color-cyan)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[color:var(--color-muted)]">
              Location
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Austin, TX"
              className="w-full rounded-lg border border-[color:var(--color-ink-line)] bg-[color:var(--color-ink)] px-3 py-2 text-sm placeholder:text-[color:var(--color-muted)]/60 focus:border-[color:var(--color-cyan)]"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-[color:var(--color-muted)]">
              Delivery email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
              className="w-full rounded-lg border border-[color:var(--color-ink-line)] bg-[color:var(--color-ink)] px-3 py-2 text-sm placeholder:text-[color:var(--color-muted)]/60 focus:border-[color:var(--color-cyan)]"
            />
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-[color:var(--color-danger)]">
            {error}
          </p>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-6 w-full rounded-full bg-[color:var(--color-cyan)] px-6 py-3 text-base font-semibold text-[color:var(--color-ink)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Starting checkout…" : "Send me my list"}
        </button>
        <p className="mt-3 text-center text-xs text-[color:var(--color-muted)]">
          Secure checkout via Dodo Payments · delivered by email as leads.csv
        </p>
      </div>
    </section>
  );
}
