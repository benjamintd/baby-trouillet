import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Getting cookies from the request
  const recordId = request.cookies.get("recordId");

  if (request.nextUrl.pathname === "/" && recordId) {
    return NextResponse.redirect(new URL(`/${recordId}`, request.url));
  } else {
    return NextResponse.next();
  }
}
