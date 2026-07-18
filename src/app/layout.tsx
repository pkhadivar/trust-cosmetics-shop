import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { Providers } from "@/components/providers";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import { SiteNavbar } from "@/components/site-navbar"; 
import { SiteFooter } from "@/components/site-footer"; 
import { getStoreSettings } from "@/actions/settings"; // 👈 اضافه شد
import { CampaignBanner } from "@/components/campaign-banner"; // 👈 اضافه شد
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

// ... کدهای متادیتا شما در اینجا ...

// 👈 کلمه async را برای دریافت اطلاعات از سرور اضافه کردیم
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // 👈 دریافت تنظیمات بنر از دیتابیس در بالاترین لایه سایت
  const settings: any = await getStoreSettings();
  
  // 👈 بررسی می‌کنیم که آیا بنر فعال است و زمان آن هنوز به پایان نرسیده است؟
// 👈 این بخش را با کد زیر جایگزین کنید تا تایپ‌اسکریپت راضی شود
  const isCampaignValid = 
    settings?.campaignIsActive && 
    settings?.campaignTitle && 
    settings?.campaignEndDate && 
    new Date(settings.campaignEndDate).getTime() > new Date().getTime();

  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} bg-background`}>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <NextAuthProvider>
          <Providers>
            {/* کامپوننت توستر برای نمایش پیام‌ها */}
            
            {/* 👈 نمایش بنر تایمردار دقیقاً بالای هدر سایت */}
            {isCampaignValid && (
              <CampaignBanner 
                title={settings.campaignTitle!} 
                endDate={settings.campaignEndDate!} 
                link={settings.campaignLink!} 
              />
            )}
            
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