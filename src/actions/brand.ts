"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

const brandSchema = z.object({
  name: z.string().min(2, "نام برند باید حداقل ۲ کاراکتر باشد"),
  description: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
});

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return false;
  }
  return true;
}

export async function createBrand(formData: FormData) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description') || null,
      logo: formData.get('logo') || null,
    };

    const validatedData = brandSchema.safeParse(rawData);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0].message };
    }

    const slug = validatedData.data.name.replace(/\s+/g, '-').toLowerCase();

    const brand = await prisma.brand.create({
      data: {
        ...validatedData.data,
        slug: slug,
      },
    });

    revalidatePath('/admin/brands');
    return { success: true, brand };
  } catch (error) {
    console.error("Brand Create Error:", error);
    return { success: false, error: 'خطا در ایجاد برند' };
  }
}

export async function updateBrand(id: string, formData: FormData) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description') || null,
      logo: formData.get('logo') || null,
    };

    const validatedData = brandSchema.safeParse(rawData);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0].message };
    }

    const slug = validatedData.data.name.replace(/\s+/g, '-').toLowerCase();

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...validatedData.data,
        slug: slug, 
      },
    });

    revalidatePath('/admin/brands');
    return { success: true, brand };
  } catch (error) {
    console.error("Brand Update Error:", error);
    return { success: false, error: 'خطا در به‌روزرسانی برند' };
  }
}

export async function deleteBrand(id: string) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    await prisma.brand.delete({ where: { id } });
    revalidatePath('/admin/brands');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در حذف برند' };
  }
}

// 🌟 تابع دریافت لیست برندها اضافه شد
export async function getBrands() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
    return brands;
  } catch (error) {
    console.error("خطا در دریافت برندها:", error);
    return []; 
  }
}