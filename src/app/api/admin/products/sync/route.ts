import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "default",
  endpoint: process.env.S3_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY as string,
    secretAccessKey: process.env.S3_SECRET_KEY as string,
  },
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.SYNC_SECRET_TOKEN}`) {
      return NextResponse.json(
        { error: "عدم دسترسی (Unauthorized)" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      title,
      slug,
      subtitle,
      description,
      richDescription,
      price,
      discountedPrice,
      imagesBase64,
      fetchVideoUrls,
      categoryId,
      brandId,
      faqs,
      attributes,
      tags,
      referenceUrl,
    } = body;

    const existingProduct = await prisma.product.findUnique({
      where: { slug: slug },
      include: { faqs: true, attributes: true },
    });

    if (existingProduct) {
      if (existingProduct.faqs.length === 0 && faqs && faqs.length > 0) {
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            faqs: {
              create: faqs.map((faq: any) => ({
                question: faq.question,
                answer: faq.answer,
              })),
            },
          },
        });
        return NextResponse.json({
          message: "جاهای خالی محصول قدیمی پر شد!",
          status: "updated",
        });
      }
      return NextResponse.json({
        message: "محصول از قبل کامل بود.",
        status: "skipped",
      });
    }

    // 🌟 آپلود موازی عکس‌ها به S3 لیارا (در پوشه uploads)
    const uploadedImagesUrls: string[] = [];
    if (imagesBase64 && imagesBase64.length > 0) {
      const uploadPromises = imagesBase64.map(
        async (base64Str: string, index: number) => {
          const buffer = Buffer.from(base64Str, "base64");
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${index}`;

          // نام فایل نهایی همراه با مسیر پوشه uploads
          const finalFilename = `uploads/sync-${uniqueSuffix}.webp`;

          await s3Client.send(
            new PutObjectCommand({
              Bucket: process.env.S3_BUCKET,
              Key: finalFilename,
              Body: buffer,
              ContentType: "image/webp",
              ACL: "public-read",
            }),
          );

          // استفاده از بک‌تیک (`) برای قرار دادن متغیر در آدرس
          return `https://media.trustbeautystore.ir/${finalFilename}`;
        },
      );

      const results = await Promise.all(uploadPromises);
      uploadedImagesUrls.push(...results);
    }

    if (uploadedImagesUrls.length === 0) {
      uploadedImagesUrls.push("/placeholder.jpg");
    }
    // 🌟 دانلود و آپلود ویدیوها مستقیماً توسط سرور به S3 لیارا
    // 🌟 دانلود و آپلود ویدیوها مستقیماً توسط سرور به S3 لیارا
    const uploadedVideoUrls: string[] = [];
    if (fetchVideoUrls && fetchVideoUrls.length > 0) {
      const vidPromises = fetchVideoUrls.map(
        async (vUrl: string, index: number) => {
          try {
            // 🌟 دور زدن سیستم امنیتی آروان‌کلاد با ارسال هدرهای جعلی
            const vRes = await fetch(vUrl, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                Referer: "https://liateam.ir/",
                Origin: "https://liateam.ir",
              },
            });

            // چک می‌کنیم که دانلود موفق بوده یا نه
            if (!vRes.ok) {
              console.error(
                `[!] Video Download Blocked! Status: ${vRes.status}`,
              );
              return null; // اگر مسدود شد، از این ویدیو می‌گذریم تا فایل خراب ذخیره نشود
            }

            const arrayBuffer = await vRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // تولید نام اختصاصی برای ویدیو
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${index}`;
            const finalFilename = `uploads/sync-vid-${uniqueSuffix}.mp4`;

            // آپلود به فضای ابری لیارا
            await s3Client.send(
              new PutObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: finalFilename,
                Body: buffer,
                ContentType: "video/mp4",
                ACL: "public-read",
              }),
            );
            return `https://media.trustbeautystore.ir/${finalFilename}`;
          } catch (error) {
            console.error(`[!] Error processing video: ${error}`);
            return null;
          }
        },
      );

      // منتظر می‌مانیم تا همه آپلود شوند
      const vidResults = await Promise.all(vidPromises);

      // 🌟 فیلتر کردن مقادیر null (ویدیوهایی که دانلود نشدند را حذف می‌کنیم)
      const validVideos = vidResults.filter(
        (url): url is string => url !== null,
      );
      uploadedVideoUrls.push(...validVideos);
    }
    // ایجاد رکورد جدید در دیتابیس
    const newProduct = await prisma.product.create({
      data: {
        title,
        slug,
        subtitle,
        description: description || title,
        richDescription: richDescription,
        price,
        discountedPrice,
        referenceUrl,
        images: uploadedImagesUrls,
        videoUrls: uploadedVideoUrls,
        isAvailable: true,
        stock: 100,

        category: { connect: { id: categoryId } },
        brand: brandId ? { connect: { id: brandId } } : undefined,

        attributes:
          attributes && attributes.length > 0
            ? {
                create: attributes.map((attr: any) => ({
                  key: attr.key,
                  value: attr.value,
                })),
              }
            : undefined,

        faqs:
          faqs && faqs.length > 0
            ? {
                create: faqs.map((faq: any) => ({
                  question: faq.question,
                  answer: faq.answer,
                })),
              }
            : undefined,

        tags:
          tags && tags.length > 0
            ? {
                connectOrCreate: tags.map((tag: string) => ({
                  where: { name: tag },
                  create: { name: tag },
                })),
              }
            : undefined,
      },
    });

    return NextResponse.json({
      message: "محصول جدید با موفقیت ثبت و عکس‌ها آپلود شدند!",
      status: "created",
    });
  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
