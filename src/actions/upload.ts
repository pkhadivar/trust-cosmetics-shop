"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 🌟 اصلاح کلاینت برای اتصال مستقیم کانتینر اپلیکیشن به کانتینر مینیو
const s3Client = new S3Client({
  region: "us-east-1",
  // اتصال مستقیم از طریق نام شبکه داکر کانتینر مینیو
  endpoint: "http://minio:9000",
  credentials: {
    // خواندن مستقیم یوزر و پسورد مینیو از فایل .env.production
    accessKeyId: process.env.MINIO_ROOT_USER as string,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD as string,
  },
  forcePathStyle: true,
});

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") return false;
  return true;
}

export async function uploadFilesAction(formData: FormData) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin)
    return {
      success: false,
      error: "دسترسی غیرمجاز! فقط مدیران می‌توانند فایل آپلود کنند.",
    };

  try {
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return { success: false, error: "فایلی برای آپلود یافت نشد." };
    }

    const uploadedKeys: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");

      const finalFilename = `${uniqueSuffix}-${safeFilename}`;

      await s3Client.send(
        new PutObjectCommand({
          // فرض بر این است که S3_BUCKET در فایل env شما برابر با trustbeautystore است
          Bucket: process.env.S3_BUCKET,
          Key: finalFilename,
          Body: buffer,
          ContentType: file.type,
          ACL: "public-read",
        }),
      );

      uploadedKeys.push(finalFilename);
    }

    return { success: true, urls: uploadedKeys };
  } catch (error) {
    console.error("خطا در آپلود فایل به MinIO:", error);
    return { success: false, error: "خطا در ارتباط با فضای ابری" };
  }
}
