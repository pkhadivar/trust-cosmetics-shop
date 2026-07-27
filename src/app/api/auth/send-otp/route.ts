import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PHONE_REGEX = /^09\d{9}$/;

// تابع تبدیل اعداد فارسی/عربی به انگلیسی
function toEnglishDigits(str: string): string {
  const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicNumbers  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(persianNumbers[i], String(i)).replace(arabicNumbers[i], String(i));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { phone } = body;

    if (phone) {
      phone = toEnglishDigits(String(phone).trim());
    }

    if (!phone || !PHONE_REGEX.test(phone)) {
      return NextResponse.json({ error: 'شماره موبایل نامعتبر است' }, { status: 400 });
    }

    // تولید کد ۵ رقمی
    const otpCode = Math.floor(10000 + Math.random() * 90000).toString(); 
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); 

    // ذخیره در دیتابیس
    await prisma.oTP.create({
      data: {
        phone,
        code: otpCode,
        expiresAt,
      },
    });

    const apiKey = process.env.KAVENEGAR_API_KEY;
    const templateName = "verify-trust"; 

    if (apiKey) {
      const kavenegarUrl = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json?receptor=${phone}&token=${otpCode}&template=${templateName}`;
      
      const smsResponse = await fetch(kavenegarUrl, { method: 'POST' });
      
      // 🌟 فیکس اصلی: هندل کردن دقیق خطاهای کاوه‌نگار
      if (!smsResponse.ok) {
        const errorData = await smsResponse.text();
        console.error("❌ Kavenegar Error:", errorData);
        
        // به جای خطای 500، ارور 400 برمی‌گردانیم تا فرم بتواند آن را به کاربر نشان دهد
        return NextResponse.json({ 
          error: 'سرویس پیامک در حال حاضر در دسترس نیست (احتمالاً الگو هنوز تایید نشده است).' 
        }, { status: 400 });
      }
    } else {
      console.log(`[Dev Mode] SMS to ${phone}: Code - ${otpCode}`);
    }

    return NextResponse.json({ message: 'کد تایید ارسال شد' }, { status: 200 });
    
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ error: 'خطای سرور در تولید کد' }, { status: 500 });
  }
}