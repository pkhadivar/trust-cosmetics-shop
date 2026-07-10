"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createCategoryAction(formData: FormData) {
  const name = formData.get('name') as string;
  const imageUrl = formData.get('imageUrl') as string || null;
  const slug = name.replace(/\s+/g, '-').toLowerCase(); 
  
  try {
    await prisma.category.create({
      data: { name, slug, imageUrl }
    });
    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در ثبت دسته‌بندی' };
  }
}

export async function updateCategoryAction(id: string, name: string, imageUrl: string | null) {
  const slug = name.replace(/\s+/g, '-').toLowerCase(); 

  try {
    await prisma.category.update({
      where: { id },
      data: { name, slug, imageUrl }
    });
    
    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('خطا در ویرایش دسته‌بندی:', error);
    return { success: false, error: 'خطا در ویرایش دسته‌بندی' };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await prisma.category.delete({
      where: { id }
    });

    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true }; 
    
  } catch (error) {
    console.error('خطا در حذف دسته‌بندی:', error);
    return { success: false, error: 'خطا در حذف دسته‌بندی' };
  }
}

// این تابعی است که منو برای لود کردن دسته‌ها از آن استفاده می‌کند
export async function getNavbarCategoriesAction() {
  try {
    return await prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("خطا در دریافت دسته‌بندی‌های منو:", error);
    return [];
  }
}