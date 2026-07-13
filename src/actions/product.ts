"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ۱. اکشن ثبت محصول جدید
export async function createProductAction(formData: FormData, imageUrls: string[]) {
  const title = formData.get('title') as string;
  const slug = title.replace(/\s+/g, '-').toLowerCase();
  
  const tagIds = formData.getAll('tags') as string[];

  // دریافت و استخراج (Parse) اطلاعات جدید فرم
  const videoUrl = (formData.get('videoUrl') as string) || null;
  const attributesRaw = formData.get('attributes') as string;
  const faqsRaw = formData.get('faqs') as string;

  const attributes = attributesRaw ? JSON.parse(attributesRaw) : [];
  const faqs = faqsRaw ? JSON.parse(faqsRaw) : [];

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
        richDescription: (formData.get('richDescription') as string) || null,
        images: imageUrls,
        stock: 0,
        videoUrl: videoUrl, // اضافه شدن لینک ویدیو
        
        tags: {
          connect: tagIds.map((id) => ({ id }))
        },
        
        // ساخت همزمان مشخصات فنی (Nested Create)
        attributes: {
          create: attributes.map((attr: { key: string; value: string }) => ({
            key: attr.key,
            value: attr.value
          }))
        },
        
        // ساخت همزمان سوالات متداول (Nested Create)
        faqs: {
          create: faqs.map((faq: { question: string; answer: string }) => ({
            question: faq.question,
            answer: faq.answer
          }))
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

// ۲. اکشن ویرایش محصول
export async function updateProductAction(id: string, formData: FormData, imageUrls: string[]) {
  const tagIds = formData.getAll('tags') as string[];

  // دریافت و استخراج (Parse) اطلاعات جدید فرم
  const videoUrl = (formData.get('videoUrl') as string) || null;
  const attributesRaw = formData.get('attributes') as string;
  const faqsRaw = formData.get('faqs') as string;

  const attributes = attributesRaw ? JSON.parse(attributesRaw) : [];
  const faqs = faqsRaw ? JSON.parse(faqsRaw) : [];

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
        richDescription: (formData.get('richDescription') as string) || null,
        images: imageUrls,
        videoUrl: videoUrl, // آپدیت لینک ویدیو

        tags: {
          set: tagIds.map((id) => ({ id }))
        },

        // پاک کردن رکوردهای قبلی و ساخت رکوردهای جدید برای آپدیت تمیز
        attributes: {
          deleteMany: {}, 
          create: attributes.map((attr: { key: string; value: string }) => ({
            key: attr.key,
            value: attr.value
          }))
        },
        
        faqs: {
          deleteMany: {},
          create: faqs.map((faq: { question: string; answer: string }) => ({
            question: faq.question,
            answer: faq.answer
          }))
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