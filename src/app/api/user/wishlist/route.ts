import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "شما وارد حساب کاربری خود نشده‌اید." }, { status: 401 });
    }

    const userId = session.user.id;

    // واکشی کاربری که شامل محصولات ذخیره شده باشد
    const userWithWishlist = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        savedProducts: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
            discountedPrice: true,
          },
        },
      },
    });

    return NextResponse.json(userWithWishlist?.savedProducts || []);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}