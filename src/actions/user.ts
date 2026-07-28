"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return false;
  return true;
}

export async function updateUserRoleAction(userId: string, newRole: Role) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    if (!userId || !newRole) return { success: false, error: "داده‌های ارسالی ناقص است" };

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید." };
  }
}