// 🌟 تغییر جادویی: استفاده از کلاینت تنظیم‌شده‌ی خود پروژه شما!
import { prisma } from "@/lib/prisma";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

// 1. کلاینت مبدا (Liara S3)
const liaraClient = new S3Client({
  region: "default",
  endpoint: process.env.LIARA_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY as string,
    secretAccessKey: process.env.LIARA_SECRET_KEY as string,
  },
});

// 2. کلاینت مقصد (MinIO محلی)
const minioClient = new S3Client({
  region: "default",
  endpoint: "http://minio:9000",
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER as string,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD as string,
  },
  forcePathStyle: true,
});

const LIARA_BUCKET = process.env.LIARA_BUCKET_NAME as string;
const MINIO_BUCKET = process.env.S3_BUCKET as string;

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: any[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function extractFilename(urlOrPath: string | null): string | null {
  if (!urlOrPath || urlOrPath === "") return null;
  const parts = urlOrPath.split("/");
  return parts[parts.length - 1];
}

async function migrateFile(oldPathOrUrl: string, newFilename: string) {
  try {
    const liaraKey = oldPathOrUrl.replace(/^https?:\/\/[^\/]+\//, "");
    const getResponse = await liaraClient.send(
      new GetObjectCommand({ Bucket: LIARA_BUCKET, Key: liaraKey }),
    );
    const buffer = await streamToBuffer(getResponse.Body as Readable);

    await minioClient.send(
      new PutObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: newFilename,
        Body: buffer,
        ContentType: getResponse.ContentType,
        ACL: "public-read",
      }),
    );
    console.log(`✅ فایل منتقل شد: ${newFilename}`);
    return true;
  } catch (error: any) {
    console.error(`❌ خطا در انتقال فایل ${oldPathOrUrl}:`, error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 شروع فرآیند انتقال به MinIO...");

  const products = await prisma.product.findMany();
  for (const product of products) {
    const newImages: string[] = [];
    const newVideos: string[] = [];

    for (const oldImg of product.images) {
      const filename = extractFilename(oldImg);
      if (filename) {
        await migrateFile(oldImg, filename);
        newImages.push(filename);
      }
    }

    for (const oldVid of product.videoUrls) {
      const filename = extractFilename(oldVid);
      if (filename) {
        await migrateFile(oldVid, filename);
        newVideos.push(filename);
      }
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { images: newImages, videoUrls: newVideos },
    });
  }

  const brands = await prisma.brand.findMany({
    where: { logo: { not: null } },
  });
  for (const brand of brands) {
    const filename = extractFilename(brand.logo);
    if (filename) {
      await migrateFile(brand.logo!, filename);
      await prisma.brand.update({
        where: { id: brand.id },
        data: { logo: filename },
      });
    }
  }

  const categories = await prisma.category.findMany({
    where: { imageUrl: { not: null } },
  });
  for (const category of categories) {
    const filename = extractFilename(category.imageUrl);
    if (filename) {
      await migrateFile(category.imageUrl!, filename);
      await prisma.category.update({
        where: { id: category.id },
        data: { imageUrl: filename },
      });
    }
  }

  console.log("🎉 تمامی فایل‌های معتبر با موفقیت منتقل و دیتابیس آپدیت شد!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
