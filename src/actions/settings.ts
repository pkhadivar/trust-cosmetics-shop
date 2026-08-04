"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return false;
  return true;
}

const campaignSchema = z.object({
  campaignIsActive: z.boolean(),
  campaignTitle: z.string().nullable(),
  campaignStartDate: z.date().nullable(), // اضافه شد
  campaignEndDate: z.date().nullable()
});

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
      campaignStartDate: null, // اضافه شد
      campaignEndDate: null,
      campaignLink: null
    }; 
  }
}

export async function updateShippingCostAction(cost: number) {
  // ... (بدون تغییر)
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    if (typeof cost !== 'number' || cost < 0) return { success: false, error: "مبلغ نامعتبر است" };

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

export async function updateCampaignSettingsAction(data: {
  campaignIsActive: boolean;
  campaignTitle: string | null;
  campaignStartDate: Date | null; // اضافه شد
  campaignEndDate: Date | null;
}) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    const validatedData = campaignSchema.safeParse(data);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0].message };
    }

    await prisma.storeSettings.upsert({
      where: { id: "global" },
      update: { ...validatedData.data, campaignLink: "/shop?discount=true" },
      create: { id: "global", shippingCost: 50000, ...validatedData.data, campaignLink: "/shop?discount=true" },
    });
    
    revalidatePath("/");
    revalidatePath("/admin/settings");
    
    return { success: true };
  } catch (error: any) {
    console.error("خطا در ذخیره تنظیمات کمپین:", error);
    return { success: false, error: String(error.message || error) };
  }
}