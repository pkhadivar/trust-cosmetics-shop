"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitReviewAction(productId: string, formData: FormData) {
  const userName = formData.get('userName') as string;
  const text = formData.get('text') as string;

  if (!userName || !text) {
    return { success: false, error: 'لطفاً نام و متن نظر را وارد کنید.' };
  }

  try {
    await prisma.review.create({
      data: {
        userName,
        text,
        productId,
        isApproved: false, // نظر به صورت پیش‌فرض در انتظار تایید است
      }
    });

    // کش صفحه محصول را پاک می‌کنیم (اگرچه تا تایید نشود نمایش داده نمی‌شود)
    revalidatePath(`/products`); 
    
    return { success: true };
  } catch (error) {
    console.error('خطا در ثبت نظر:', error);
    return { success: false, error: 'خطایی در ثبت نظر رخ داد. لطفاً دوباره تلاش کنید.' };
  }
}