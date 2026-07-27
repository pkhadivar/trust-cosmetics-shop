import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// تابع تبدیل اعداد فارسی/عربی به انگلیسی برای جلوگیری از خطای کیبورد
function toEnglishDigits(str: string): string {
  const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicNumbers  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(persianNumbers[i], String(i)).replace(arabicNumbers[i], String(i));
  }
  return result;
}

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

        // تبدیل ورودی‌ها به انگلیسی
        const phone = toEnglishDigits(credentials.phone.trim());
        const code = toEnglishDigits(credentials.code.trim());

        const validOtp = await prisma.oTP.findFirst({
          where: {
            phone: phone,
            code: code,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (!validOtp) {
          throw new Error("کد وارد شده اشتباه است یا منقضی شده");
        }

        await prisma.oTP.deleteMany({
          where: { phone: phone },
        });

        let user = await prisma.user.findUnique({
          where: { phone: phone },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone: phone,
              name: "کاربر عزیز",
              role: "USER",
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.phone, 
          role: user.role,   
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; 
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role; 
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