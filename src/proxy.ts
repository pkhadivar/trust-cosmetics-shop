import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 🌟 تابع را به عنوان دیفالت اکسپورت کردیم
export default async function proxy(request: NextRequest) {
  // خواندن امن توکن و اطلاعات درون آن (از جمله نقش کاربر)
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const { pathname } = request.nextUrl;

  // --------------------------------------------------------
  // ۱. گارد امنیتی مسیرهای ادمین (Admin Routes)
  // --------------------------------------------------------
  if (pathname.startsWith('/admin')) {
    // اگر اصلاً لاگین نکرده بود -> برو به صفحه لاگین
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // اگر لاگین بود اما ادمین نبود -> برگرد به صفحه پروفایل
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  // --------------------------------------------------------
  // ۲. گارد مسیرهای محافظت‌شده کاربران عادی (Protected Routes)
  // --------------------------------------------------------
  const protectedRoutes = ['/profile', '/dashboard', '/onboarding'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  
  // اگر خواست به پروفایل برود ولی لاگین نبود -> برو به صفحه لاگین
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // --------------------------------------------------------
  // ۳. گارد مسیرهای احراز هویت (Auth Routes)
  // --------------------------------------------------------
  const authRoutes = ['/login'];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  
  // اگر لاگین بود و خواست فرم لاگین را ببیند -> برگرد به پروفایل
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  // در سایر موارد (مثل صفحه اصلی یا محصولات) اجازه عبور بده
  return NextResponse.next();
}

export const config = {
  // مسیرهایی که میدلور نباید روی آن‌ها اعمال شود (فایل‌های استاتیک و APIها)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};