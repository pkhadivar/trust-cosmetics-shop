import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma"; 

export async function GET() {
  try {
    // ۱. پیدا کردن تمام محصولاتی که لینک مرجع (سایت لیا تیم) دارند
    const products = await prisma.product.findMany({
      where: {
        referenceUrl: { not: null },
      },
    });

    let updatedCount = 0;
    const errors: string[] = [];

    // ۲. شروع حلقه بررسی محصولات
    for (const product of products) {
      if (!product.referenceUrl) continue;

      try {
        // ارسال درخواست به سایت مرجع (مثل یک مرورگر واقعی)
        const { data: html } = await axios.get(product.referenceUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        const $ = cheerio.load(html);

        // ۳. استخراج قیمت (با تکنیک Fallback)
        let rawPrice = $(".chakra-text.css-1v7ffl1").first().text();
        if (!rawPrice || rawPrice.trim() === "") {
          const tomanElement = $("p").filter(function() { return $(this).text().trim() === "تومان"; }).first();
          if (tomanElement.length > 0) { rawPrice = tomanElement.prev("p").text(); }
        }

        // ۴. تشخیص وضعیت موجودی (جستجوی کلمه "ناموجود" در دکمه‌ها یا متن‌ها)
        // ربات کل تگ‌های صفحه را می‌گردد تا ببیند آیا متنی دقیقاً برابر با "ناموجود" وجود دارد یا خیر
        const isOutOfStock = $("*").filter(function() {
          return $(this).text().trim() === "ناموجود";
        }).length > 0;
        
        const isAvailable = !isOutOfStock; // اگر ناموجود بود، پس isAvailable برابر با false می‌شود

        // ۵. تمیز کردن دیتای قیمت و ذخیره در دیتابیس (همراه با وضعیت موجودی)
        if (rawPrice) {
          const cleanPrice = parseInt(rawPrice.replace(/,/g, "").replace(/[^\d]/g, ""), 10);

          if (!isNaN(cleanPrice)) {
            await prisma.product.update({
              where: { id: product.id },
              data: { 
                price: cleanPrice,
                isAvailable: isAvailable // 👈 وضعیت موجودی هم در دیتابیس آپدیت می‌شود
              },
            });
            updatedCount++;
          }
        }
        
      } catch (err: any) {
        console.error(`خطا در بررسی لینک: ${product.referenceUrl}`, err.message);
        errors.push(`خطا در محصول ${product.title}`);
      }
    }

    // ۶. ارسال گزارش کار ربات
    return NextResponse.json({
      message: "همگام‌سازی با موفقیت انجام شد.",
      totalChecked: products.length,
      updatedCount: updatedCount,
      errors: errors.length > 0 ? errors : null,
    });

  } catch (error) {
    console.error("خطای کلی در ربات اسکرپر:", error);
    return NextResponse.json(
      { error: "خطای سرور در اجرای ربات" },
      { status: 500 }
    );
  }
}