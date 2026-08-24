// GET /api/leads/preview?query=...&location=...&limit=5
// Optional live preview of a few leads (handy for demos / debugging the engine).

import { NextResponse } from "next/server";
import { generateLeads } from "@/lib/leads";

const MAX_PREVIEW = 10;

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();
  const location = (searchParams.get("location") ?? "").trim();
  const limit = Math.min(MAX_PREVIEW, Number(searchParams.get("limit")) || 5);

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  try {
    const leads = await generateLeads({ query, location, limit });
    return NextResponse.json({ leads });
  } catch (err) {
    console.error("preview error:", err);
    const message = err instanceof Error ? err.message : "Preview failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
