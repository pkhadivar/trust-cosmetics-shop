"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return false;
  return true;
}

const tagSchema = z.object({
  name: z.string().min(2, "نام برچسب باید حداقل ۲ کاراکتر باشد")
});

export async function createTagAction(formData: FormData) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    const rawData = { name: (formData.get('name') as string || "").trim() };
    const validatedData = tagSchema.safeParse(rawData);
    
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0].message };
    }

    await prisma.tag.create({
      data: { name: validatedData.data.name }
    });

    revalidatePath('/admin/tags');
    revalidatePath('/admin/products/new');
    revalidatePath('/admin/products/[id]/edit');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'این برچسب از قبل در سیستم وجود دارد.' };
    }
    console.error('خطا در ایجاد برچسب:', error);
    return { success: false, error: 'خطا در ثبت برچسب جدید.' };
  }
}

export async function deleteTagAction(id: string) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    await prisma.tag.delete({ where: { id } });

    revalidatePath('/admin/tags');
    revalidatePath('/admin/products/new');
    revalidatePath('/admin/products/[id]/edit');
    return { success: true };
  } catch (error) {
    console.error('خطا در حذف برچسب:', error);
    return { success: false, error: 'خطا در حذف برچسب.' };
  }
}