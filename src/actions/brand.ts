// src/actions/brand.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBrands() {
  try {
    return await prisma.brand.findMany({ orderBy: { createdAt: "desc" } });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

export async function createBrand(formData: FormData, logoUrl: string | null) {
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string | null;

    if (!name || !slug) {
      return { success: false, error: "وارد کردن نام و اسلاگ الزامی است." };
    }

    await prisma.brand.create({
      data: { name, slug, logo: logoUrl, description },
    });

    revalidatePath("/admin/brands");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "این اسلاگ قبلاً ثبت شده است." };
    return { success: false, error: "خطایی در ثبت برند رخ داد." };
  }
}

export async function deleteBrand(id: string) {
  try {
    await prisma.brand.delete({ where: { id } });
    revalidatePath("/admin/brands");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در حذف برند." };
  }
}


export async function updateBrand(id: string, formData: FormData, logoUrl: string | null) {
    try {
      const name = formData.get("name") as string;
      const slug = formData.get("slug") as string;
      const description = formData.get("description") as string | null;
  
      if (!name || !slug) {
        return { success: false, error: "وارد کردن نام و اسلاگ الزامی است." };
      }
  
      await prisma.brand.update({
        where: { id },
        data: { name, slug, logo: logoUrl, description },
      });
  
      revalidatePath("/admin/brands");
      revalidatePath("/shop");
      return { success: true };
    } catch (error: any) {
      if (error.code === 'P2002') return { success: false, error: "این اسلاگ قبلاً ثبت شده است." };
      return { success: false, error: "خطایی در ویرایش برند رخ داد." };
    }
  }