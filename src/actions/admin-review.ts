"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

// --- Guards ---
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return false;
  return true;
}

// --- Zod Schemas ---
const reviewApprovalSchema = z.object({
  id: z.string(),
  isApproved: z.boolean()
});

const adminReplySchema = z.object({
  id: z.string(),
  adminReply: z.string().min(2, "متن پاسخ نمی‌تواند خیلی کوتاه باشد")
});

const submitReviewSchema = z.object({
  productId: z.string(),
  userName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  text: z.string().min(5, "متن نظر باید حداقل ۵ کاراکتر باشد")
});

// --- Actions ---
export async function toggleReviewApproval(id: string, isApproved: boolean) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    const validatedData = reviewApprovalSchema.safeParse({ id, isApproved });
    if (!validatedData.success) return { success: false, error: validatedData.error.issues[0].message };

    await prisma.review.update({
      where: { id: validatedData.data.id },
      data: { isApproved: validatedData.data.isApproved }
    });
    revalidatePath('/admin/reviews');
    revalidatePath('/product/[id]', 'page'); 
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در تغییر وضعیت نظر' };
  }
}

export async function submitAdminReply(id: string, adminReply: string) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    const validatedData = adminReplySchema.safeParse({ id, adminReply });
    if (!validatedData.success) return { success: false, error: validatedData.error.issues[0].message };

    await prisma.review.update({
      where: { id: validatedData.data.id },
      data: { adminReply: validatedData.data.adminReply }
    });
    revalidatePath('/admin/reviews');
    revalidatePath('/product/[id]', 'page');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در ثبت پاسخ' };
  }
}

export async function deleteReviewAction(id: string) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    await prisma.review.delete({ where: { id } });
    revalidatePath('/admin/reviews');
    revalidatePath('/product/[id]', 'page');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در حذف نظر' };
  }
}

// این اکشن مخصوص کاربر است (نیازی به گارد ادمین ندارد)
export async function submitReviewAction(productId: string, formData: FormData) {
  try {
    const rawData = {
      productId,
      userName: formData.get('userName'),
      text: formData.get('text'),
    };

    const validatedData = submitReviewSchema.safeParse(rawData);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0].message };
    }

    await prisma.review.create({
      data: {
        userName: validatedData.data.userName,
        text: validatedData.data.text,
        productId: validatedData.data.productId,
        isApproved: false, 
      }
    });

    revalidatePath(`/products`); 
    return { success: true };
  } catch (error) {
    console.error('خطا در ثبت نظر:', error);
    return { success: false, error: 'خطایی در ثبت نظر رخ داد. لطفاً دوباره تلاش کنید.' };
  }
}