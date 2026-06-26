import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "تراست | مراقبت پوست و مو لاکچری",
  description:
    "برند لاکچری مراقبت از پوست و مو. فرمولاسیون تخصصی، تاییدیه پزشکان و ترکیبات ارگانیک برای درخششی ماندگار.",
  generator: "v0.app",
};

export const viewport: Viewport = {
  themeColor: "#0B1120",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} bg-background`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
