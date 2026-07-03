import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
      // تغییر جدید: استفاده از await برای خواندن کوکی
      const cookieStore = await cookies();
      const token = cookieStore.get('session')?.value;
      
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

    // گرفتن آیدی کاربر از توکن
    const { userId } = await verifyToken(token);

    const body = await request.json();
    const { fullName } = body;

    if (!fullName || typeof fullName !== 'string') {
      return NextResponse.json({ error: 'Invalid full name' }, { status: 400 });
    }

    // ذخیره نام در دیتابیس
    const user = await prisma.user.update({
      where: { id: userId as string },
      data: { name: fullName },
    });

    return NextResponse.json({ message: 'Profile updated successfully', user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}