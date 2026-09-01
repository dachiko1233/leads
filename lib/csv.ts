// CSV export for the lead list.

import type { Lead } from "./leads/types";

const COLUMNS: Array<{ header: string; get: (l: Lead) => string | number | null }> = [
  { header: "Name", get: (l) => l.name },
  { header: "Category", get: (l) => l.category },
  { header: "Location", get: (l) => l.location },
  { header: "Last Post", get: (l) => l.lastPost },
  { header: "Instagram", get: (l) => l.instagram },
  { header: "Facebook", get: (l) => l.facebook },
  { header: "LinkedIn", get: (l) => l.linkedin },
  { header: "Telephone", get: (l) => l.telephone },
  { header: "Email", get: (l) => l.email },
  { header: "Website", get: (l) => l.website },
  { header: "Hot Score", get: (l) => l.hotScore },
];

/** Serialize leads to a CSV string (RFC 4180-ish, always-quoted fields). */
export function leadsToCsv(leads: Lead[]): string {
  const rows: string[] = [];
  rows.push(COLUMNS.map((c) => escapeCsv(c.header)).join(","));
  for (const lead of leads) {
    rows.push(COLUMNS.map((c) => escapeCsv(c.get(lead))).join(","));
  }
  // Trailing newline so the file ends cleanly.
  return rows.join("\r\n") + "\r\n";
}

function escapeCsv(value: string | number | null): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}
