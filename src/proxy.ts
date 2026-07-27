import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes — no auth required
  const publicRoutes = ['/login', '/api/auth'];
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (!req.auth && !isPublic) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (req.auth && pathname === '/login') {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
