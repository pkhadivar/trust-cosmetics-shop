"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createTagAction(formData: FormData) {
  const name = formData.get('name') as string;

  if (!name || name.trim() === '') {
    return { success: false, error: 'نام برچسب نمی‌تواند خالی باشد.' };
  }

  try {
    await prisma.tag.create({
      data: { name: name.trim() }
    });

    // رفرش کردن کش صفحات مرتبط
    revalidatePath('/admin/tags');
    revalidatePath('/admin/products/new');
    revalidatePath('/admin/products/[id]/edit');
    return { success: true };
  } catch (error: any) {
    // خطای P2002 در پریزما یعنی این مقدار قبلاً ثبت شده است (Unique constraint)
    if (error.code === 'P2002') {
      return { success: false, error: 'این برچسب از قبل در سیستم وجود دارد.' };
    }
    console.error('خطا در ایجاد برچسب:', error);
    return { success: false, error: 'خطا در ثبت برچسب جدید.' };
  }
}

export async function deleteTagAction(id: string) {
  try {
    await prisma.tag.delete({
      where: { id }
    });

    revalidatePath('/admin/tags');
    revalidatePath('/admin/products/new');
    revalidatePath('/admin/products/[id]/edit');
    return { success: true };
  } catch (error) {
    console.error('خطا در حذف برچسب:', error);
    return { success: false, error: 'خطا در حذف برچسب.' };
  }
}