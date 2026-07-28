"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from "zod";

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return false;
  return true;
}

const updateStatusSchema = z.object({
  orderId: z.string(),
  newStatus: z.nativeEnum(OrderStatus)
});

export async function updateOrderStatusAction(orderId: string, newStatus: OrderStatus) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    const validatedData = updateStatusSchema.safeParse({ orderId, newStatus });
    if (!validatedData.success) return { success: false, error: "وضعیت نامعتبر است" };

    await prisma.order.update({
      where: { id: validatedData.data.orderId },
      data: { status: validatedData.data.newStatus }
    });

    revalidatePath("/admin/orders");
    revalidatePath("/profile/orders");
    return { success: true };
  } catch (error) {
    console.error("خطا در تغییر وضعیت سفارش:", error);
    return { success: false, error: "امکان تغییر وضعیت سفارش وجود ندارد." };
  }
}

export async function deleteOrderAction(orderId: string) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    if (!orderId) return { success: false, error: "آیدی سفارش الزامی است" };

    await prisma.order.delete({
      where: { id: orderId }
    });
  
    revalidatePath("/admin/orders");
    revalidatePath("/profile/orders");
    return { success: true };
  } catch (error) {
    console.error("خطا در حذف سفارش:", error);
    return { success: false, error: "امکان حذف این سفارش وجود ندارد." };
  }
}