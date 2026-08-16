"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const s3Client = new S3Client({
  region: "default",
  endpoint: process.env.S3_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY as string,
    secretAccessKey: process.env.S3_SECRET_KEY as string,
  },
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

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
      const finalFilename = `uploads/${uniqueSuffix}-${safeFilename}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: finalFilename,
          Body: buffer,
          ContentType: file.type,
          ACL: "public-read",
        }),
      );

      const fileUrl = `https://media.trustbeautystore.ir/${finalFilename}`;
      uploadedUrls.push(fileUrl);
    }

    return { success: true, urls: uploadedUrls };
  } catch (error) {
    console.error("خطا در آپلود فایل به S3 لیارا:", error);
    return { success: false, error: "خطا در ارتباط با فضای ابری" };
  }
}
