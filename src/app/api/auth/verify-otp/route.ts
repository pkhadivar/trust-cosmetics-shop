import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers'; // اضافه شده برای تنظیم کوکی در مرورگر کاربر
import { signToken } from '@/lib/session'; // اضافه شده برای ساخت توکن امنیتی

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phone, code } = body;

  if (!phone || !code) {
    return NextResponse.json({ error: 'Phone number and OTP code are required' }, { status: 400 });
  }

  const otpRecord = await prisma.oTP.findFirst({
    where: {
      phone,
      expiresAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord || otpRecord.code !== code) {
    return NextResponse.json({ error: 'Invalid OTP code or expired' }, { status: 401 });
  }

  // پس از تایید موفق، کدهای یکبارمصرف این شماره را پاک می‌کنیم تا دوباره استفاده نشوند
  await prisma.oTP.deleteMany({ where: { phone } });

  // بررسی اینکه آیا کاربر از قبل در سیستم وجود دارد یا خیر
  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  let user;
  let requiresOnboarding = false;

  if (existingUser) {
    user = existingUser;
    // اگر کاربر اسم نداشت، یعنی باید برود به صفحه Onboarding
    requiresOnboarding = !user.name || !user.name.trim();
  } else {
    // اگر کاربر جدید بود، او را در دیتابیس می‌سازیم
    user = await prisma.user.create({
      data: {
        phone,
      },
    });
    requiresOnboarding = true;
  }

  // --- بخش امنیتی جدید: ساخت توکن و تنظیم کوکی ---
  // این توکن شناسنامه کاربر است که با آیدی او ساخته می‌شود
  const token = await signToken({ userId: user.id });

// تغییر جدید: استفاده از await برای دریافت کوکی‌ها
const cookieStore = await cookies();
cookieStore.set('session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7 // اعتبار 7 روزه
});
  // ------------------------------------------------

  // تصمیم‌گیری برای هدایت کاربر بر اساس Onboarding
  if (requiresOnboarding) {
    return NextResponse.json({ 
      message: 'OTP verified. User needs onboarding.', 
      requiresOnboarding 
    }, { status: 201 });
  }

  return NextResponse.json({ 
    message: 'OTP verified successfully', 
    user, 
    requiresOnboarding 
  }, { status: 200 });
}