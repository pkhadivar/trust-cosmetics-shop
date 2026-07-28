"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ۱. تعریف Schema برای اعتبارسنجی ورودی‌های کاربر
const submitReviewSchema = z.object({
  productId: z.string().min(1, "آیدی محصول نامعتبر است"),
  userName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  text: z.string().min(5, "متن نظر باید حداقل ۵ کاراکتر باشد")
});

export async function submitReviewAction(productId: string, formData: FormData) {
  try {
    // ۲. استخراج داده‌های خام
    const rawData = {
      productId,
      userName: formData.get('userName'),
      text: formData.get('text'),
    };

    // ۳. اعتبارسنجی با Zod
    const validatedData = submitReviewSchema.safeParse(rawData);
    
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0].message };
    }

    // ۴. ذخیره در دیتابیس
    await prisma.review.create({
      data: {
        userName: validatedData.data.userName,
        text: validatedData.data.text,
        productId: validatedData.data.productId,
        isApproved: false, // نظر به صورت پیش‌فرض در انتظار تایید است
      }
    });

    // کش صفحه محصول را پاک می‌کنیم
    revalidatePath(`/products`); 
    
    return { success: true };
  } catch (error) {
    console.error('خطا در ثبت نظر:', error);
    return { success: false, error: 'خطایی در ثبت نظر رخ داد. لطفاً دوباره تلاش کنید.' };
  }
}