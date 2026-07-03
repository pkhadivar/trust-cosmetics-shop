"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// این تابع دقیقاً روی سرور اجرا می‌شود، هرچند از کلاینت صدا زده شود
export async function createProductAction(formData: FormData, imageUrl: string) {
  try {
    const title = formData.get('title') as string;
    const isAvailable = formData.get('isAvailable') === 'true';
    
    const slug = title.replace(/\s+/g, '-').trim() + '-' + Date.now();

    await prisma.product.create({
      data: {
        title: title,
        slug: slug,
        subtitle: (formData.get('subtitle') as string) || null,
        price: parseInt(formData.get('price') as string),
        stock: isAvailable ? 100 : 0,
        categoryId: formData.get('categoryId') as string,
        badge: (formData.get('badge') as string) || null,
        description: formData.get('description') as string,
        images: imageUrl ? [imageUrl] : [],
        isAvailable: isAvailable,
      }
    });

    // جادوی Next.js: کشِ صفحه محصولات را به صورت خودکار پاک و آپدیت می‌کند
    revalidatePath('/admin/products');
    
    return { success: true };
  } catch (error) {
    console.error('خطا در ساخت محصول:', error);
    return { success: false, error: 'Failed to create product' };
  }
}