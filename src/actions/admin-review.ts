"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// تایید یا رد کردن نظر
export async function toggleReviewApproval(id: string, isApproved: boolean) {
  try {
    await prisma.review.update({
      where: { id },
      data: { isApproved }
    });
    revalidatePath('/admin/reviews');
    revalidatePath('/product/[id]', 'page'); 
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در تغییر وضعیت نظر' };
  }
}

// ثبت پاسخ ادمین برای نظر
export async function submitAdminReply(id: string, adminReply: string) {
  try {
    await prisma.review.update({
      where: { id },
      data: { adminReply }
    });
    revalidatePath('/admin/reviews');
    revalidatePath('/product/[id]', 'page');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در ثبت پاسخ' };
  }
}

// حذف کامل نظر
export async function deleteReviewAction(id: string) {
  try {
    await prisma.review.delete({
      where: { id }
    });
    revalidatePath('/admin/reviews');
    revalidatePath('/product/[id]', 'page');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در حذف نظر' };
  }
}