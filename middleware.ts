// Edge middleware to drop bot/scanner noise before it reaches the framework.
//
// This app has NO server actions and NO page-level form posts — every mutation
// goes through /api/* route handlers (excluded from this middleware's matcher).
// Scanners still POST to page routes trying to invoke a fake server action,
// which makes Next.js throw:
//   "The Server Reference ID did not match the expected format."
// That error is logged by the framework before our code can catch it, so we
// short-circuit those probes here before they reach Next's action resolver.
//
// A server action can be invoked two ways, and we must block both:
//   1. a `next-action` request header (JS/fetch-based invocation), or
//   2. a form-encoded POST body with a `$ACTION_ID_…` field (no-JS forms).
// The header check alone misses case 2, so we additionally reject any mutating
// method reaching a page route — none of which is ever legitimate here.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Methods that can carry a server-action payload. Legitimate page traffic for
// this app is read-only (GET/HEAD), so anything else hitting a page is a probe.
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function middleware(request: NextRequest): NextResponse {
  // Covers both invocation paths: the `next-action` header AND form-encoded
  // action bodies that carry no header. Since the app defines no server actions
  // and no page forms, any mutating request to a page route is illegitimate.
  if (request.headers.has("next-action") || MUTATING_METHODS.has(request.method)) {
    return new NextResponse(null, { status: 400 });
  }
  return NextResponse.next();
}

export const config = {
  // Only run on page navigations (POSTs to pages are what trigger the error).
  // Skip API routes, static assets, and image optimization.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
