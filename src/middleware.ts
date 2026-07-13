import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // استفاده از ابزار NextAuth برای خواندن امنِ توکن
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/profile', '/dashboard', '/onboarding'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  const authRoutes = ['/login'];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // اگر لاگین نبود و خواست به صفحات محافظت‌شده برود
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // اگر لاگین بود و خواست فرم ورود را دوباره ببیند
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};