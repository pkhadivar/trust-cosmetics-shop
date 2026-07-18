"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ... (متدهای قبلی تغییری نمی‌کنند) ...

export async function getStoreSettings() {
  try {
    let settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });
    
    if (!settings) {
      settings = await prisma.storeSettings.create({ 
        data: { id: "global", shippingCost: 50000 } 
      });
    }
    return settings;
  } catch (error) {
    console.error("خطا در دریافت تنظیمات:", error);
    return { 
      shippingCost: 50000,
      campaignIsActive: false,
      campaignTitle: null,
      campaignEndDate: null,
      campaignLink: null
    }; 
  }
}

export async function updateShippingCostAction(cost: number) {
  // ... (کدهای قبلی)
  try {
    await prisma.storeSettings.upsert({
      where: { id: "global" },
      update: { shippingCost: cost },
      create: { id: "global", shippingCost: cost },
    });
    revalidatePath("/cart");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در بروزرسانی تنظیمات" };
  }
}

// 👈 در اینجا campaignLink را از تایپ ورودی حذف می‌کنیم

export async function updateCampaignSettingsAction(data: {
  campaignIsActive: boolean;
  campaignTitle: string | null;
  campaignEndDate: Date | null;
}) {
  try {
    await prisma.storeSettings.upsert({
      where: { id: "global" },
      update: { ...data, campaignLink: "/shop?discount=true" },
      create: { id: "global", shippingCost: 50000, ...data, campaignLink: "/shop?discount=true" },
    });
    
    revalidatePath("/");
    revalidatePath("/admin/settings");
    
    return { success: true };
  } catch (error: any) {
    console.error("خطا در ذخیره تنظیمات کمپین:", error);
    
    // 👈 این خط را تغییر دادیم تا ارور اصلی دیتابیس در پیام Toast نمایش داده شود
    return { success: false, error: String(error.message || error) };
  }
}