"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function toggleWishlistAction(productId: string, userId: string) {
  // جلوگیری از ثبت به نام کاربر دیگر
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== userId) {
    return { success: false, error: "دسترسی غیرمجاز به حساب کاربری!" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { savedProducts: { where: { id: productId } } }
    });

    if (!user) return { success: false, error: "کاربر یافت نشد" };

    const isSaved = user.savedProducts.length > 0;

    if (isSaved) {
      await prisma.user.update({
        where: { id: userId },
        data: { savedProducts: { disconnect: { id: productId } } }
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { savedProducts: { connect: { id: productId } } }
      });
    }

    revalidatePath("/"); 
    return { success: true, isSaved: !isSaved };
  } catch (error) {
    console.error("Wishlist Error:", error);
    return { success: false, error: "خطا در ارتباط با سرور" };
  }
}