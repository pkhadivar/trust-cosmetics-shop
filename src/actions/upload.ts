"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadFilesAction(formData: FormData) {
  try {
    const files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      return { success: false, error: "فایلی برای آپلود یافت نشد." };
    }

    const uploadedUrls: string[] = [];
    
    // مسیر ذخیره‌سازی فایل‌ها در پوشه public/uploads پروژه
    const uploadDir = path.join(process.cwd(), "public/uploads");

    // بررسی وجود پوشه و ساخت آن در صورت نیاز
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // اگر پوشه از قبل وجود داشته باشد خطایی نمی‌دهد
    }

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
      const finalFilename = `${uniqueSuffix}-${safeFilename}`;
      
      const filepath = path.join(uploadDir, finalFilename);

      // ذخیره فایل روی سیستم لوکال
      await writeFile(filepath, buffer);
      
      // برگرداندن آدرس نسبی فایل برای استفاده در دیتابیس
      uploadedUrls.push(`/uploads/${finalFilename}`);
    }

    return { success: true, urls: uploadedUrls };
  } catch (error) {
    console.error("خطا در آپلود فایل لوکال:", error);
    return { success: false, error: "خطا در آپلود فایل در سیستم" };
  }
}