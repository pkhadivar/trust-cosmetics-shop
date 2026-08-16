"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "default",
  endpoint: process.env.LIARA_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY as string,
    secretAccessKey: process.env.LIARA_SECRET_KEY as string,
  },
});

// تابع کمکی برای استخراج مسیر دقیق فایل از لینک کامل
// مثلاً تبدیل: https://media.trustbeautystore.ir/uploads/vid.mp4 ---> uploads/vid.mp4
function getS3KeyFromUrl(url: string) {
  if (!url || url.includes("placeholder")) return null;
  try {
    const urlObj = new URL(url);
    return decodeURIComponent(urlObj.pathname.substring(1));
  } catch (e) {
    return null;
  }
}

// تابع کمکی برای حذف فیزیکی فایل از فضای ابری
async function deleteMediaFromS3(url: string) {
  const key = getS3KeyFromUrl(url);
  if (!key) return;

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: key,
      }),
    );
  } catch (error) {
    console.error(`❌ خطا در حذف فایل از S3 (${key}):`, error);
  }
}

// ==========================================
// 🛡️ ۱. تابع کمکی برای بررسی سطح دسترسی (Admin Guard)
// ==========================================
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return false;
  }
  return true;
}

// ==========================================
// 📝 ۲. تعریف Schema اعتبارسنجی با Zod
// ==========================================
const productSchema = z.object({
  title: z.string().min(2, "عنوان محصول باید حداقل ۲ کاراکتر باشد"),
  subtitle: z.string().nullable().optional(),
  price: z.coerce.number().min(100, "مبلغ قیمت نامعتبر است"),
  discountedPrice: z.coerce.number().nullable().optional(),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  categoryId: z.string().min(1, "انتخاب دسته‌بندی الزامی است"),
  brandId: z.string().nullable().optional(),
  description: z.string().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد"),
  richDescription: z.string().nullable().optional(),
  referenceUrl: z
    .string()
    .url("لینک مرجع نامعتبر است")
    .or(z.literal(""))
    .nullable()
    .optional(),

  tags: z.array(z.string()),
  images: z.array(z.string()),
  videoUrls: z.array(z.string()),

  attributes: z
    .array(
      z.object({
        key: z.string().min(1, "نام ویژگی نمی‌تواند خالی باشد"),
        value: z.string().min(1, "مقدار ویژگی نمی‌تواند خالی باشد"),
      }),
    )
    .default([]),

  faqs: z
    .array(
      z.object({
        question: z.string().min(5, "سوال باید حداقل ۵ کاراکتر باشد"),
        answer: z.string().min(3, "پاسخ باید حداقل ۵ کاراکتر باشد"),
      }),
    )
    .default([]),
});

// ==========================================
// 🚀 ۳. اکشن‌های سمت سرور (Server Actions)
// ==========================================

export async function createProductAction(
  formData: FormData,
  imageUrls: string[],
  videoUrls: string[],
) {
  // ۱. بررسی امنیت (گارد ادمین)
  const isAdmin = await checkAdminAccess();
  if (!isAdmin)
    return {
      success: false,
      error: "دسترسی غیرمجاز! فقط مدیران می‌توانند محصول اضافه کنند.",
    };

  try {
    // ۲. استخراج و پارس کردن داده‌های خام
    const attributesRaw = formData.get("attributes") as string;
    const faqsRaw = formData.get("faqs") as string;

    const rawData = {
      title: formData.get("title"),
      subtitle: formData.get("subtitle") || null,
      price: formData.get("price"),
      discountedPrice: formData.get("discountedPrice") || null,
      isAvailable: formData.get("isAvailable") === "true",
      isFeatured: formData.get("isFeatured") === "true",
      categoryId: formData.get("categoryId"),
      brandId: formData.get("brandId") || null,
      description: formData.get("description"),
      richDescription: formData.get("richDescription") || null,
      referenceUrl: formData.get("referenceUrl") || null,
      tags: formData.getAll("tags"),
      images: imageUrls,
      videoUrls: videoUrls,
      attributes: attributesRaw ? JSON.parse(attributesRaw) : [],
      faqs: faqsRaw ? JSON.parse(faqsRaw) : [],
    };

    // ۳. اعتبارسنجی دقیق داده‌ها با Zod
    const validatedFields = productSchema.safeParse(rawData);
    if (!validatedFields.success) {
      // برگرداندن اولین خطای پیدا شده به کلاینت
      return { success: false, error: validatedFields.error.issues[0].message };
    }

    const data = validatedFields.data;
    const slug = data.title.replace(/\s+/g, "-").toLowerCase();

    // 🌟 قانون تک-هیرو
    if (data.isFeatured) {
      await prisma.product.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false },
      });
    }

    // ۴. ذخیره امن در دیتابیس
    await prisma.product.create({
      data: {
        title: data.title,
        slug: slug,
        subtitle: data.subtitle,
        price: data.price,
        discountedPrice: data.discountedPrice,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
        categoryId: data.categoryId,
        brandId: data.brandId,
        description: data.description,
        richDescription: data.richDescription,
        referenceUrl: data.referenceUrl,
        stock: data.isAvailable ? 9999 : 0,
        images: data.images,
        videoUrls: data.videoUrls,
        tags: { connect: data.tags.map((id) => ({ id })) },
        attributes: { create: data.attributes },
        faqs: { create: data.faqs },
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("خطا در ثبت محصول:", error);
    return { success: false, error: "خطای سرور در ثبت محصول" };
  }
}

export async function updateProductAction(
  id: string,
  formData: FormData,
  imageUrls: string[],
  videoUrls: string[],
) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    const attributesRaw = formData.get("attributes") as string;
    const faqsRaw = formData.get("faqs") as string;

    const rawData = {
      title: formData.get("title"),
      subtitle: formData.get("subtitle") || null,
      price: formData.get("price"),
      discountedPrice: formData.get("discountedPrice") || null,
      isAvailable: formData.get("isAvailable") === "true",
      isFeatured: formData.get("isFeatured") === "true",
      categoryId: formData.get("categoryId"),
      brandId: formData.get("brandId") || null,
      description: formData.get("description"),
      richDescription: formData.get("richDescription") || null,
      referenceUrl: formData.get("referenceUrl") || null,
      tags: formData.getAll("tags"),
      images: imageUrls,
      videoUrls: videoUrls,
      attributes: attributesRaw ? JSON.parse(attributesRaw) : [],
      faqs: faqsRaw ? JSON.parse(faqsRaw) : [],
    };

    const validatedFields = productSchema.safeParse(rawData);
    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.issues[0].message };
    }

    const data = validatedFields.data;

    // 🌟 ۱. پیدا کردن محصول قبلی برای مقایسه مدیا
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { images: true, videoUrls: true },
    });

    if (existingProduct) {
      // 🌟 ۲. پیدا کردن عکس‌ها و ویدیوهایی که در لیست جدید نیستند (حذف شده‌اند)
      const deletedImages = (existingProduct.images || []).filter(
        (oldUrl) => !data.images.includes(oldUrl),
      );
      const deletedVideos = (existingProduct.videoUrls || []).filter(
        (oldUrl) => !data.videoUrls.includes(oldUrl),
      );

      const mediaToDelete = [...deletedImages, ...deletedVideos];

      // 🌟 ۳. حذف فایل‌های بلااستفاده از فضای ابری
      if (mediaToDelete.length > 0) {
        await Promise.all(mediaToDelete.map((url) => deleteMediaFromS3(url)));
      }
    }

    if (data.isFeatured) {
      await prisma.product.updateMany({
        where: { isFeatured: true, id: { not: id } },
        data: { isFeatured: false },
      });
    }

    await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        price: data.price,
        discountedPrice: data.discountedPrice,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
        categoryId: data.categoryId,
        brandId: data.brandId,
        description: data.description,
        richDescription: data.richDescription,
        referenceUrl: data.referenceUrl,
        stock: data.isAvailable ? 9999 : 0,
        images: data.images,
        videoUrls: data.videoUrls,
        tags: { set: data.tags.map((tagId) => ({ id: String(tagId) })) },
        attributes: {
          deleteMany: {},
          create: data.attributes,
        },
        faqs: {
          deleteMany: {},
          create: data.faqs,
        },
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("خطا در ویرایش محصول:", error);
    return { success: false, error: "خطای سرور در آپدیت محصول" };
  }
}

export async function deleteProductAction(id: string) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    // 🌟 ۱. پیدا کردن محصول برای استخراج لینک‌های مدیا
    const productToDelete = await prisma.product.findUnique({
      where: { id },
      select: { images: true, videoUrls: true },
    });

    // 🌟 ۲. حذف تمام عکس‌ها و ویدیوهای مرتبط از S3
    if (productToDelete) {
      const allMedia = [
        ...(productToDelete.images || []),
        ...(productToDelete.videoUrls || []),
      ];
      // حذف همزمان (موازی) برای سرعت بیشتر
      await Promise.all(allMedia.map((url) => deleteMediaFromS3(url)));
    }

    // ۳. حذف نهایی از دیتابیس
    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("خطا در حذف محصول:", error);
    return { success: false, error: "خطا در حذف محصول" };
  }
}

export async function setHeroProductAction(productId: string) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) return { success: false, error: "دسترسی غیرمجاز!" };

  try {
    await prisma.product.updateMany({
      where: { isFeatured: true },
      data: { isFeatured: false },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { isFeatured: true },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error setting hero product:", error);
    return { success: false, error: "خطا در تنظیم محصول هیرو" };
  }
}
