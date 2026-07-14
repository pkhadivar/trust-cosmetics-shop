// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          throw new Error("شماره موبایل و کد الزامی است");
        }

        // ۱. پیدا کردن کد تایید معتبر در دیتابیس
        const validOtp = await prisma.oTP.findFirst({
          where: {
            phone: credentials.phone,
            code: credentials.code,
            expiresAt: { gt: new Date() }, // بررسی اینکه تاریخ انقضا نگذشته باشد
          },
          orderBy: { createdAt: 'desc' }, // گرفتن آخرین کد ارسال شده
        });

        // اگر کد در دیتابیس نبود یا منقضی شده بود
        if (!validOtp) {
          throw new Error("کد وارد شده اشتباه است یا منقضی شده");
        }

        // ۲. پاک کردن کدهای مربوط به این شماره (برای جلوگیری از استفاده مجدد)
        await prisma.oTP.deleteMany({
          where: { phone: credentials.phone },
        });

        // ۳. بررسی اینکه آیا کاربر از قبل وجود دارد؟
        let user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });

        // ۴. اگر نبود، ثبت‌نامش می‌کنیم
        if (!user) {
          user = await prisma.user.create({
            data: {
              phone: credentials.phone,
              name: "کاربر عزیز",
              role: "USER", // اختصاص نقش پیش‌فرض برای کاربران جدید
            },
          });
        }

        // برگرداندن اطلاعات کاربر به سشن NextAuth
        return {
          id: user.id,
          name: user.name,
          email: user.phone, // ذخیره موبایل در فیلد ایمیل برای نمایش در پروفایل
          role: user.role,   // اضافه کردن نقش کاربر به خروجی
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // از آنجایی که تایپ پیش‌فرض NextAuth نقش را ندارد، برای جلوگیری از خطای TS کست می‌کنیم
        token.role = (user as any).role; 
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role; // انتقال نقش به سشن کلاینت
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", 
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };