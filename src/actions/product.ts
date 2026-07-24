"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ۱. اکشن ثبت محصول جدید
export async function createProductAction(formData: FormData, imageUrls: string[], videoUrls: string[]) {
  const title = formData.get('title') as string;
  const slug = title.replace(/\s+/g, '-').toLowerCase();
  
  const tagIds = formData.getAll('tags') as string[];

  const attributesRaw = formData.get('attributes') as string;
  const faqsRaw = formData.get('faqs') as string;

  const attributes = attributesRaw ? JSON.parse(attributesRaw) : [];
  const faqs = faqsRaw ? JSON.parse(faqsRaw) : [];

  // دریافت مقادیر جدید
  const referenceUrl = (formData.get('referenceUrl') as string) || null;
  const brandId = (formData.get('brandId') as string) || null;
  const isAvailable = formData.get('isAvailable') === 'true';
  const isFeatured = formData.get('isFeatured') === 'true';

  try {
    // 🌟 قانون تک-هیرو: اگر محصول جدید قرار است هیرو باشد، بقیه باید از حالت هیرو خارج شوند
    if (isFeatured) {
      await prisma.product.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false }
      });
    }

    await prisma.product.create({
      data: {
        title: title,
        slug: slug,
        subtitle: (formData.get('subtitle') as string) || null,
        price: parseInt(formData.get('price') as string),
        discountedPrice: formData.get('discountedPrice') ? parseInt(formData.get('discountedPrice') as string) : null,
        isAvailable: isAvailable,
        isFeatured: isFeatured,
        categoryId: formData.get('categoryId') as string,
        brandId: brandId, // 👈 ذخیره برند
        description: formData.get('description') as string,
        richDescription: (formData.get('richDescription') as string) || null,
        referenceUrl: referenceUrl,
        stock: isAvailable ? 9999 : 0,
        
        images: imageUrls,      
        videoUrls: videoUrls,   
        
        tags: {
          connect: tagIds.map((id) => ({ id }))
        },
        
        attributes: {
          create: attributes.map((attr: { key: string; value: string }) => ({
            key: attr.key,
            value: attr.value
          }))
        },
        
        faqs: {
          create: faqs.map((faq: { question: string; answer: string }) => ({
            question: faq.question,
            answer: faq.answer
          }))
        }
      }
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('خطا در ثبت محصول:', error);
    return { success: false, error: 'خطا در ثبت محصول' };
  }
}

// ۲. اکشن ویرایش محصول
export async function updateProductAction(id: string, formData: FormData, imageUrls: string[], videoUrls: string[]) {
  const tagIds = formData.getAll('tags') as string[];

  const attributesRaw = formData.get('attributes') as string;
  const faqsRaw = formData.get('faqs') as string;

  const attributes = attributesRaw ? JSON.parse(attributesRaw) : [];
  const faqs = faqsRaw ? JSON.parse(faqsRaw) : [];

  // دریافت مقادیر جدید
  const referenceUrl = (formData.get('referenceUrl') as string) || null;
  const brandId = (formData.get('brandId') as string) || null;
  const isAvailable = formData.get('isAvailable') === 'true';
  const isFeatured = formData.get('isFeatured') === 'true';

  try {
    // 🌟 قانون تک-هیرو: اگر قرار است این محصول هیرو شود، هیرو بودن بقیه (به جز خودش) را لغو می‌کنیم
    if (isFeatured) {
      await prisma.product.updateMany({
        where: { 
          isFeatured: true,
          id: { not: id } // برای جلوگیری از آپدیت اضافی خودِ این محصول
        },
        data: { isFeatured: false }
      });
    }

    await prisma.product.update({
      where: { id },
      data: {
        title: formData.get('title') as string,
        subtitle: (formData.get('subtitle') as string) || null,
        price: parseInt(formData.get('price') as string),
        discountedPrice: formData.get('discountedPrice') ? parseInt(formData.get('discountedPrice') as string) : null,
        isAvailable: isAvailable,
        isFeatured: isFeatured,
        categoryId: formData.get('categoryId') as string,
        brandId: brandId, // 👈 آپدیت برند
        description: formData.get('description') as string,
        richDescription: (formData.get('richDescription') as string) || null,
        referenceUrl: referenceUrl,
        stock: isAvailable ? 9999 : 0,
        
        images: imageUrls,      
        videoUrls: videoUrls,   

        tags: {
          set: tagIds.map((id) => ({ id }))
        },

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

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('خطا در ویرایش محصول:', error);
    return { success: false, error: 'خطا در آپدیت محصول' };
  }
}

// ۳. اکشن حذف محصول
export async function deleteProductAction(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در حذف محصول' };
  }
}

// ۴. تنظیم محصول هیرو (تغییر از طریق جدول کلاینت)
export async function setHeroProductAction(productId: string) {
  try {
    // ۱. ابتدا وضعیت ویژه (هیرو) را از تمام محصولات حذف می‌کنیم
    await prisma.product.updateMany({
      where: { isFeatured: true },
      data: { isFeatured: false }
    });

    // ۲. حالا محصول انتخاب شده را به عنوان تک محصولِ هیرو تنظیم می‌کنیم
    await prisma.product.update({
      where: { id: productId },
      data: { isFeatured: true }
    });

    revalidatePath("/admin/products"); 
    revalidatePath("/"); // برای آپدیت فوری صفحه اصلی سایت
    
    return { success: true };
  } catch (error) {
    console.error("Error setting hero product:", error);
    return { success: false, error: "خطا در تنظیم محصول هیرو" };
  }
}