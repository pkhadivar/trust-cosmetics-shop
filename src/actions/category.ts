"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(2, "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد"),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return false;
  }
  return true;
}

export async function createCategoryAction(formData: FormData) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description') || null,
      image: formData.get('image') || null,
    };

    const validatedData = categorySchema.safeParse(rawData);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0].message };
    }

    // 🌟 تولید slug
    const slug = validatedData.data.name.replace(/\s+/g, '-').toLowerCase();

    const category = await prisma.category.create({
      data: {
        ...validatedData.data,
        slug: slug,
      },
    });

    revalidatePath('/admin/categories');
    return { success: true, category };
  } catch (error) {
    console.error("Category Create Error:", error);
    return { success: false, error: 'خطا در ایجاد دسته‌بندی' };
  }
}

export async function updateCategoryAction(id: string, formData: FormData) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description') || null,
      image: formData.get('image') || null,
    };

    const validatedData = categorySchema.safeParse(rawData);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0].message };
    }

    // 🌟 تولید slug جدید
    const slug = validatedData.data.name.replace(/\s+/g, '-').toLowerCase();

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...validatedData.data,
        slug: slug,
      },
    });

    revalidatePath('/admin/categories');
    return { success: true, category };
  } catch (error) {
    console.error("Category Update Error:", error);
    return { success: false, error: 'خطا در به‌روزرسانی دسته‌بندی' };
  }
}

export async function deleteCategoryAction(id: string) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در حذف دسته‌بندی' };
  }
}

// دریافت لیست دسته‌بندی‌ها برای نمایش در نوبار سایت
export async function getNavbarCategoriesAction() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }, // مرتب‌سازی الفبایی
    });
    return categories;
  } catch (error) {
    console.error("خطا در دریافت دسته‌بندی‌های نوبار:", error);
    return []; // جلوگیری از کرش کردن سایت در صورت بروز خطا
  }
}