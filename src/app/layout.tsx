import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { Providers } from "@/components/providers";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import { SiteNavbar } from "@/components/site-navbar"; 
import { SiteFooter } from "@/components/site-footer"; 
import { Toaster } from "react-hot-toast"; // 👈 این خط را اضافه کنید
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

// ... بقیه کدهای متادیتا بدون تغییر ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} bg-background`}>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <NextAuthProvider>
          <Providers>
            {/* اضافه کردن کامپوننت توستر برای نمایش پیام‌ها */}
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
            
            <SiteNavbar />
            
            <main className="flex-1">
              {children}
            </main>
            
            <SiteFooter />
          </Providers>
        </NextAuthProvider>
      </body>
    </html>
  );
}