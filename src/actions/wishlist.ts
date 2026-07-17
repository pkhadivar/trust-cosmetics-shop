"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleWishlistAction(productId: string, userId: string) {
  try {
    // بررسی می‌کنیم که آیا کاربر قبلاً این محصول را ذخیره کرده است یا خیر
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { savedProducts: { where: { id: productId } } }
    });

    if (!user) return { success: false, error: "کاربر یافت نشد" };

    const isSaved = user.savedProducts.length > 0;

    if (isSaved) {
      // اگر ذخیره بود، آن را از لیست حذف می‌کنیم (Disconnect)
      await prisma.user.update({
        where: { id: userId },
        data: { savedProducts: { disconnect: { id: productId } } }
      });
    } else {
      // اگر ذخیره نبود، آن را به لیست اضافه می‌کنیم (Connect)
      await prisma.user.update({
        where: { id: userId },
        data: { savedProducts: { connect: { id: productId } } }
      });
    }

    revalidatePath("/"); // رفرش کش صفحه
    return { success: true, isSaved: !isSaved };
  } catch (error) {
    console.error("Wishlist Error:", error);
    return { success: false, error: "خطا در ارتباط با سرور" };
  }
}