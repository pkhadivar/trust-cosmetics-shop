"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export async function updateOrderStatusAction(orderId: string, newStatus: OrderStatus) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });

    // رفرش کردن کش صفحه ادمین و پروفایل کاربر تا تغییرات بلافاصله دیده شوند
    revalidatePath("/admin/orders");
    revalidatePath("/profile/orders");
    
    return { success: true };
  } catch (error) {
    console.error("خطا در تغییر وضعیت سفارش:", error);
    return { success: false, error: "امکان تغییر وضعیت سفارش وجود ندارد." };
  }
}

// اکشن جدید برای حذف سفارش
export async function deleteOrderAction(orderId: string) {
    try {
      await prisma.order.delete({
        where: { id: orderId }
      });
  
      // رفرش کردن کش صفحات تا سفارش بلافاصله از لیست حذف شود
      revalidatePath("/admin/orders");
      revalidatePath("/profile/orders");
      
      return { success: true };
    } catch (error) {
      console.error("خطا در حذف سفارش:", error);
      return { success: false, error: "امکان حذف این سفارش وجود ندارد." };
    }
  }