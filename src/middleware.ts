import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // The landing page (/) and auth routes should be public
  const publicRoutes = ['/login', '/api/auth'];
  const isPublic = pathname === '/' || publicRoutes.some((route) => pathname.startsWith(route));

  // If the user is NOT logged in, and trying to access a protected route, redirect to login
  if (!req.auth && !isPublic) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If the user IS logged in, and trying to access the login page, redirect to dashboard
  if (req.auth && pathname === '/login') {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|screenshots|landing).*?)'],
};
