// src/app/api/user/addresses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { createdAt: 'desc' }, 
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Fetch Addresses Error:", error);
    return NextResponse.json({ error: 'خطای سرور در دریافت آدرس‌ها' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, state, city, fullAddress, postalCode } = body;

    // اعتبارسنجی فیلدهای الزامی جدید
    if (!state || !city || !fullAddress || !postalCode) {
      return NextResponse.json({ error: 'لطفاً تمامی فیلدهای الزامی را پر کنید' }, { status: 400 });
    }

    if (postalCode.length !== 10) {
      return NextResponse.json({ error: 'کد پستی باید دقیقاً ۱۰ رقم باشد' }, { status: 400 });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: (session.user as any).id,
        title: title || 'آدرس من',
        state: state.trim(),
        city: city.trim(),
        fullAddress: fullAddress.trim(),
        postalCode: postalCode.trim(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'آدرس با موفقیت ثبت شد',
      address: newAddress 
    }, { status: 201 });

  } catch (error) {
    console.error("Create Address Error:", error);
    return NextResponse.json({ error: 'خطای سرور در ثبت آدرس' }, { status: 500 });
  }
}

// src/app/api/user/addresses/route.ts

// ...متدهای GET و POST قبلی شما اینجا قرار دارند...

export async function PUT(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const body = await request.json();
      const { id, title, state, city, fullAddress, postalCode } = body;
  
      if (!id || !state || !city || !fullAddress || !postalCode) {
        return NextResponse.json({ error: 'اطلاعات ارسالی ناقص است' }, { status: 400 });
      }
  
      // بررسی امنیتی برای اطمینان از اینکه آدرس متعلق به خود کاربر است
      const updatedAddress = await prisma.address.update({
        where: { 
          id,
          userId: (session.user as any).id 
        },
        data: {
          title: title || 'آدرس من',
          state,
          city,
          fullAddress,
          postalCode
        }
      });
  
      return NextResponse.json({ success: true, address: updatedAddress });
    } catch (error) {
      console.error("Update Address Error:", error);
      return NextResponse.json({ error: 'خطا در ویرایش آدرس' }, { status: 500 });
    }
  }
  
  export async function DELETE(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
  
      if (!id) {
        return NextResponse.json({ error: 'شناسه آدرس یافت نشد' }, { status: 400 });
      }
  
      // حذف آدرس با تأیید مالکیت کاربر
      await prisma.address.delete({
        where: { 
          id,
          userId: (session.user as any).id 
        }
      });
  
      return NextResponse.json({ success: true, message: 'آدرس با موفقیت حذف شد' });
    } catch (error) {
      console.error("Delete Address Error:", error);
      return NextResponse.json({ error: 'خطا در حذف آدرس' }, { status: 500 });
    }
  }