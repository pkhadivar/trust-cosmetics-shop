// src/actions/upload.ts
"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// تنظیمات اتصال به S3 لیارا بر اساس متغیرهای محیطی
const s3Client = new S3Client({
  region: "default",
  endpoint: process.env.LIARA_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY as string,
    secretAccessKey: process.env.LIARA_SECRET_KEY as string,
  },
});

export async function uploadFilesAction(formData: FormData) {
  try {
    const files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      return { success: false, error: "فایلی برای آپلود یافت نشد." };
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ساخت یک نام یکتا برای جلوگیری از تداخل اسم فایل‌ها
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
      const finalFilename = `uploads/${uniqueSuffix}-${safeFilename}`; 

      // ارسال مستقیم فایل به باکت لیارا
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.LIARA_BUCKET_NAME,
          Key: finalFilename,
          Body: buffer,
          ContentType: file.type,
          ACL: "public-read",
        })
      );
      
      // ساخت آدرس نهایی عکس با استفاده از ساب‌دامین اختصاصی شما
      const fileUrl = `https://media.trustbeautystore.ir/${finalFilename}`;
      uploadedUrls.push(fileUrl);
    }

    return { success: true, urls: uploadedUrls };
  } catch (error) {
    console.error("خطا در آپلود فایل به S3 لیارا:", error);
    return { success: false, error: "خطا در ارتباط با فضای ابری" };
  }
}