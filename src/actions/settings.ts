"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// دریافت تنظیمات فعلی فروشگاه (مثل هزینه پست)
export async function getStoreSettings() {
  try {
    let settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });
    
    // اگر هنوز تنظیمی در دیتابیس نبود، با 50 هزار تومان پیش‌فرض می‌سازیم
    if (!settings) {
      settings = await prisma.storeSettings.create({ 
        data: { id: "global", shippingCost: 50000 } 
      });
    }
    return settings;
  } catch (error) {
    console.error("خطا در دریافت تنظیمات:", error);
    return { shippingCost: 50000 }; // مقدار پشتیبان در صورت قطعی موقت دیتابیس
  }
}

// آپدیت کردن هزینه پست توسط ادمین
export async function updateShippingCostAction(cost: number) {
  try {
    await prisma.storeSettings.upsert({
      where: { id: "global" },
      update: { shippingCost: cost },
      create: { id: "global", shippingCost: cost },
    });
    
    // رفرش کردن کش صفحات سبد خرید و تنظیمات تا تغییرات فورا اعمال شود
    revalidatePath("/cart");
    revalidatePath("/admin/settings");
    
    return { success: true };
  } catch (error) {
    console.error("خطا در ذخیره تنظیمات:", error);
    return { success: false, error: "خطا در بروزرسانی تنظیمات" };
  }
}