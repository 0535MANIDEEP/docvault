import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE } from '@/lib/session';

const PUBLIC_ROUTES = ['/login'];

/**
 * Next 16 renamed the `middleware` convention to `proxy`. This is the route
 * guard: it sends logged-out visitors to the login page before any protected
 * page renders.
 *
 * It is an optimistic check on the cookie only. The real security boundary is
 * the permission check inside every route handler.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (!session && !PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/documents', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
