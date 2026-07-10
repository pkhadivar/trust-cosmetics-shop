"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ۱. اکشن ثبت محصول جدید
// src/actions/product.ts
export async function createProductAction(formData: FormData, imageUrl: string) {
    const title = formData.get('title') as string;
    const slug = title.replace(/\s+/g, '-').toLowerCase(); // تولید اسلاگ از عنوان
  
    try {
      await prisma.product.create({
        data: {
          title: title,
          slug: slug, // اضافه شد
          subtitle: (formData.get('subtitle') as string) || null,
          price: parseInt(formData.get('price') as string),
          discountedPrice: formData.get('discountedPrice') ? parseInt(formData.get('discountedPrice') as string) : null,
          isAvailable: formData.get('isAvailable') === 'true',
          categoryId: formData.get('categoryId') as string,
          badge: (formData.get('badge') as string) || null,
          description: formData.get('description') as string,
          images: [imageUrl],
          stock: 0, // یا هر مقدار پیش‌فرض دیگر (اضافه شد)
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

// ۲. اکشن ویرایش محصول
export async function updateProductAction(id: string, formData: FormData, imageUrl: string) {
  try {
    await prisma.product.update({
      where: { id },
      data: {
        title: formData.get('title') as string,
        subtitle: (formData.get('subtitle') as string) || null,
        price: parseInt(formData.get('price') as string),
        discountedPrice: formData.get('discountedPrice') ? parseInt(formData.get('discountedPrice') as string) : null,
        isAvailable: formData.get('isAvailable') === 'true',
        categoryId: formData.get('categoryId') as string,
        badge: (formData.get('badge') as string) || null,
        description: formData.get('description') as string,
        images: [imageUrl] // جایگزین کردن عکس قبلی با عکس جدید در قالب آرایه
      }
    });

    // رفرش کردن کش صفحات
    revalidatePath('/admin/products');
    revalidatePath('/'); 
    
    return { success: true };
  } catch (error) {
    console.error('خطا در ویرایش محصول:', error);
    return { success: false, error: 'خطا در آپدیت محصول در دیتابیس' };
  }
}

// ۳. اکشن حذف محصول (در صورتی که در همین فایل است)
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