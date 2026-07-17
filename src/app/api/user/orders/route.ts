import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // یا مسیر فایل auth شما
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "شما وارد حساب کاربری خود نشده‌اید." }, { status: 401 });
    }

    const userId = session.user.id;

    // واکشی سفارشات کاربر لاگین شده از جدید به قدیم
    const orders = await prisma.order.findMany({
      where: { userId: userId },
      include: {
        items: {
          include: {
            product: true, // دریافت مشخصات محصول برای هر آیتم (مثل عکس و تایتل)
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json({ error: "خطای سرور در دریافت سفارشات." }, { status: 500 });
  }
}