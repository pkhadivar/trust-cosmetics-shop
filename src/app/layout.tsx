import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { Providers } from "@/components/providers";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import { SiteNavbar } from "@/components/site-navbar"; 
import { SiteFooter } from "@/components/site-footer"; 
import { getStoreSettings } from "@/actions/settings"; 
import { CampaignBanner } from "@/components/campaign-banner"; 
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

// 🌟 ۱. تنظیم رنگ مرورگر و پس‌زمینه اپلیکیشن (رنگ سرمه‌ای قالب شما)
export const viewport: Viewport = {
  themeColor: "#0a0f1c",
};

// 🌟 ۲. معرفی متادیتا، فایل مانیفست و آیکون مخصوص اپل
export const metadata: Metadata = {
  title: "TRUST | تراست بیوتی استور", // اگر تایتل قبلی چیز دیگری بود آن را جایگزین کنید
  description: "خرید سریع و مطمئن محصولات آرایشی و بهداشتی تراست",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192x192.png", 
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // Get settings from database
  const settings: any = await getStoreSettings();
  
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} bg-background`}>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <NextAuthProvider>
          <Providers>
            
            {/* If the admin toggled it to active, render it. 
                The component itself will decide if the time is right to be visible */}
            {settings?.campaignIsActive && 
             settings?.campaignTitle && 
             settings?.campaignStartDate && 
             settings?.campaignEndDate && (
              <CampaignBanner 
                title={settings.campaignTitle} 
                startDate={settings.campaignStartDate} // Pass start date
                endDate={settings.campaignEndDate}     // Pass end date
                link={settings.campaignLink || "/shop?discount=true"} 
              />
            )}
            
            <SiteNavbar />
            
            <main className="flex-1">
              {children}
            </main>
            
            <SiteFooter />
            <PwaInstallBanner />
          </Providers>
        </NextAuthProvider>
      </body>
    </html>
  );
}