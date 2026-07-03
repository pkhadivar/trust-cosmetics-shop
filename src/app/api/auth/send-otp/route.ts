import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

const PHONE_REGEX = /^09\d{9}$/; 

export async function POST(request: NextRequest) {
  const body = await request.json();
  // ۱. فقط شماره تلفن را از ورودی می‌گیریم
  const { phone } = body;

  if (!phone || !PHONE_REGEX.test(phone)) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }

  const otpCode = Math.floor(10000 + Math.random() * 90000).toString(); 
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); 

  await prisma.oTP.create({
    data: {
      phone,
      code: otpCode, // ۲. کدی که تصادفی تولید شده را اینجا قرار می‌دهیم
      expiresAt,
    },
  });

  // ۳. کد تولید شده واقعی را در ترمینال چاپ می‌کنیم
  console.log(`Mock SMS sent to ${phone}: OTP Code - ${otpCode}`); 
  return NextResponse.json({ message: 'OTP code sent successfully' });
}