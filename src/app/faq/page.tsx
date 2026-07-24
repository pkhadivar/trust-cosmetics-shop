import { Metadata } from "next";
import { FAQSection } from "@/components/shared/FAQSection"; // مسیر را در صورت نیاز چک کنید

// بخش سئو (فقط در سرور کامپوننت‌ها کار می‌کند)
export const metadata: Metadata = {
  title: "سوالات متداول | فروشگاه تراست",
  description: "پاسخ به پرتکرارترین سوالات شما درباره خرید، ارسال محصولات و نمایندگی فروش تراست.",
};

// 🌟 بخش حیاتی: حتماً باید export default باشد
export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <FAQSection />
    </main>
  );
}