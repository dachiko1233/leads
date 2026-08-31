// Edge middleware to drop bot/scanner noise before it reaches the framework.
//
// This app has NO server actions — every mutation goes through /api/* route
// handlers. Scanners still POST to page routes with a fake `next-action`
// header, which makes Next.js throw:
//   "The Server Reference ID did not match the expected format."
// That error is logged by the framework before our code can catch it. We
// short-circuit those probes here so they never reach Next's action resolver.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  // A legitimate request to this app never carries a server-action header,
  // because the app defines no server actions. Reject the probe outright.
  if (request.headers.has("next-action")) {
    return new NextResponse(null, { status: 400 });
  }
  return NextResponse.next();
}

export const config = {
  // Only run on page navigations (POSTs to pages are what trigger the error).
  // Skip API routes, static assets, and image optimization.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
