// Orchestrator for the data engine: search -> analyze social -> score -> sort.
//
// Set USE_SAMPLE_DATA=true to run the entire flow offline from
// data/leads.sample.json (no Google API quota burned).

import { promises as fs } from "node:fs";
import path from "node:path";

import { searchBusinesses } from "./places";
import { discoverSocial } from "./social";
import { toLead } from "./score";
import type { GenerateLeadsParams, Lead } from "./types";

export type { GenerateLeadsParams, Lead } from "./types";

// How many social-website fetches to run at once (be polite / avoid timeouts).
const SOCIAL_CONCURRENCY = 6;

/**
 * Produce a scored, prioritized list of leads for a query + location.
 */
export async function generateLeads(params: GenerateLeadsParams): Promise<Lead[]> {
  const { limit } = params;

  if (sampleDataEnabled()) {
    const sample = await loadSample();
    return sample.sort(byHotness).slice(0, limit);
  }

  // 1) Find real businesses.
  const businesses = await searchBusinesses(params);

  // 2) Discover + analyze social presence (bounded concurrency).
  const leads = await mapWithConcurrency(businesses, SOCIAL_CONCURRENCY, async (b) => {
    const social = await discoverSocial(b);
    return toLead(b, social);
  });

  // 3) Score is computed in toLead(); sort by hotness descending.
  return leads.sort(byHotness).slice(0, limit);
}

function byHotness(a: Lead, b: Lead): number {
  return b.hotScore - a.hotScore;
}

function sampleDataEnabled(): boolean {
  return process.env.USE_SAMPLE_DATA === "true";
}

async function loadSample(): Promise<Lead[]> {
  const file = path.join(process.cwd(), "data", "leads.sample.json");
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as Lead[];
}

/** Map over items with a fixed concurrency limit, preserving input order. */
async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
