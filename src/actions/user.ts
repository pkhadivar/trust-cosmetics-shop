"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateUserRoleAction(userId: string, newRole: Role) {
  try {
    // بروزرسانی نقش در دیتابیس
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    // رفرش کردن کش صفحه ادمین برای نمایش فوری تغییرات
    revalidatePath("/admin/users");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید." };
  }
}