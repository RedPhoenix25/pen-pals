import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The landing page (/) and auth routes should be public
  const publicRoutes = ['/login', '/api/auth'];
  const isPublic = pathname === '/' || publicRoutes.some((route) => pathname.startsWith(route));

  // Check for the NextAuth session cookie (supports both HTTP and HTTPS deployments)
  const isAuthenticated = 
    req.cookies.has('next-auth.session-token') || 
    req.cookies.has('__Secure-next-auth.session-token');

  // If the user is NOT logged in, and trying to access a protected route, redirect to login
  if (!isAuthenticated && !isPublic) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If the user IS logged in, and trying to access the login page, redirect to dashboard
  if (isAuthenticated && pathname === '/login') {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|screenshots|landing).*?)'],
};
