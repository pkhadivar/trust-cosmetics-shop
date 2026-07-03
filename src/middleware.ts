import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // گرفتن توکن از کوکی مرورگر
  const token = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // مسیرهای محافظت‌شده که فقط کاربران لاگین‌کرده می‌توانند ببینند
  const protectedRoutes = ['/dashboard', '/onboarding'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // مسیرهای احراز هویت که کاربران لاگین‌کرده نباید ببینند (مثل صفحه ورود)
  const authRoutes = ['/login'];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // اگر کاربر توکن ندارد و می‌خواهد به داشبورد برود -> هدایت به لاگین
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // اگر کاربر توکن دارد و می‌خواهد به صفحه لاگین برود -> هدایت به داشبورد
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // در بقیه موارد (مثل صفحه اصلی فروشگاه /)، اجازه عبور بده
  return NextResponse.next();
}

// تعیین اینکه میدلور روی چه مسیرهایی اجرا شود
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};