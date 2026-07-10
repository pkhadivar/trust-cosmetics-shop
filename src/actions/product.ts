"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ۱. اکشن ثبت محصول جدید
export async function createProductAction(formData: FormData, imageUrls: string[]) {
  const title = formData.get('title') as string;
  const slug = title.replace(/\s+/g, '-').toLowerCase();
  
  // دریافت آرایه‌ای از ID تگ‌های انتخاب شده از فرم
  const tagIds = formData.getAll('tags') as string[];

  try {
    await prisma.product.create({
      data: {
        title: title,
        slug: slug,
        subtitle: (formData.get('subtitle') as string) || null,
        price: parseInt(formData.get('price') as string),
        discountedPrice: formData.get('discountedPrice') ? parseInt(formData.get('discountedPrice') as string) : null,
        isAvailable: formData.get('isAvailable') === 'true',
        isFeatured: formData.get('isFeatured') === 'true',
        categoryId: formData.get('categoryId') as string,
        description: formData.get('description') as string,
        images: imageUrls,
        stock: 0,
        // متصل کردن محصول به تگ‌های انتخاب شده
        tags: {
          connect: tagIds.map((id) => ({ id }))
        }
      }
    });

    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('خطا در ثبت محصول:', error);
    return { success: false, error: 'خطا در ثبت محصول' };
  }
}

export async function updateProductAction(id: string, formData: FormData, imageUrls: string[]) {
  const tagIds = formData.getAll('tags') as string[];

  try {
    await prisma.product.update({
      where: { id },
      data: {
        title: formData.get('title') as string,
        subtitle: (formData.get('subtitle') as string) || null,
        price: parseInt(formData.get('price') as string),
        discountedPrice: formData.get('discountedPrice') ? parseInt(formData.get('discountedPrice') as string) : null,
        isAvailable: formData.get('isAvailable') === 'true',
        isFeatured: formData.get('isFeatured') === 'true',
        categoryId: formData.get('categoryId') as string,
        description: formData.get('description') as string,
        images: imageUrls,
        // جایگزین کردن تگ‌های قبلی با تگ‌های جدید انتخاب شده
        tags: {
          set: tagIds.map((id) => ({ id }))
        }
      }
    });

    revalidatePath('/admin/products');
    revalidatePath('/'); 
    return { success: true };
  } catch (error) {
    console.error('خطا در ویرایش محصول:', error);
    return { success: false, error: 'خطا در آپدیت محصول' };
  }
}

// ۳. اکشن حذف محصول
export async function deleteProductAction(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    });

    revalidatePath('/admin/products');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('خطا در حذف محصول:', error);
    return { success: false, error: 'خطا در حذف محصول' };
  }
}