"use client";

import { useState } from "react";

const MIN = 1;
const MAX = 5;
const STEP = 1;
const PRICE_PER_LEAD = 100; // €100 / lead

export function PricingSlider() {
  const [leads, setLeads] = useState(5);
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
        <p className="mt-3 text-muted">
          €100 per hot lead. Slide to choose how many you want. One-time payment.
        </p>
        <p className="mt-2 text-sm text-muted">
          Hot leads delivered within 7 business days.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-ink-line bg-ink-soft p-8">
        {/* Live price */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm text-muted">Leads</div>
            <div className="font-display pt-1 text-4xl font-bold leading-tight">
              {leads}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted">Total</div>
            <div className="font-display pt-1 text-4xl font-bold leading-tight text-cyan">
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
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>{MIN}</span>
            <span>{MAX}</span>
          </div>
        </div>

        {/* Order details */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-muted">
              Business category
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. hair salon"
              className="w-full rounded-lg border border-ink-line bg-ink px-3 py-2 text-sm placeholder:text-muted/60 focus:border-cyan"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">
              Location
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Austin, TX"
              className="w-full rounded-lg border border-ink-line bg-ink px-3 py-2 text-sm placeholder:text-muted/60 focus:border-cyan"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-muted">
              Delivery email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
              className="w-full rounded-lg border border-ink-line bg-ink px-3 py-2 text-sm placeholder:text-muted/60 focus:border-cyan"
            />
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-6 w-full rounded-full bg-cyan px-6 py-3 text-base font-semibold text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Starting checkout…" : "Send me my list"}
        </button>
        <p className="mt-3 text-center text-xs text-muted">
          Secure one-time checkout via Dodo Payments · leads delivered to your inbox
        </p>

        {/* Risk reversal: money-back guarantee */}
        <div className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-lime/30 bg-lime/5 p-4">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime/15 text-lime ring-1 ring-lime/30">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-warm">100% cashback. Guaranteed.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
