// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // ۱. بررسی امن توکن با استفاده از NextAuth (جایگزین روش دستی قبلی)
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // در فرانت‌اند فیلد name را ارسال کرده بودیم
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'نام وارد شده معتبر نیست' }, { status: 400 });
    }

    // ۲. ذخیره نام در دیتابیس با استفاده از ID سشن
    const user = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { name: name.trim() },
    });

    return NextResponse.json({ message: 'Profile updated successfully', user }, { status: 200 });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}