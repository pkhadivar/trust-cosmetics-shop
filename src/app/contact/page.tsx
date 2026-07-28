import { Phone, MessageCircle, Clock, MapPin, Info, ShieldCheck, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MapWrapper from "@/components/map-wrapper";

export const metadata = {
  title: "تماس با ما | فروشگاه تراست",
  description: "راه‌های ارتباطی با فروشگاه محصولات مراقبت از پوست و مو تراست.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pb-20 pt-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        
        {/* هدر صفحه */}
        <div className="mb-12 text-center space-y-4 max-w-3xl mx-auto">
          <p className="text-muted-foreground font-medium mb-2">
            هیچ سؤالی بی‌‌پاسخ نمی‌ماند! برای پرسش‌ها و درخواست‌های خود، در ساعات کاری با شماره‌های زیر تماس بگیرید.
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">ارتباط با تراست</h1>
          <p className="text-muted-foreground leading-relaxed">
            مجموعه تراست با افتخار ارائه‌دهنده باکیفیت‌ترین محصولات مراقبت از پوست، مو و عطریات است. هدف ما خلق یک تجربه خرید بی‌نقص برای شماست؛ به همین دلیل، در تمامی مراحل خرید برای ارائه مشاوره و پاسخگویی در کنار شما خواهیم بود.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* ستون اطلاعات تماس */}
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* تلفن ثابت پشتیبانی */}
              <div className="bg-card border border-border p-6 rounded-3xl flex flex-col items-center text-center gap-3 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                  <Phone className="size-6" />
                </div>
                <h3 className="font-bold text-foreground">تلفن پشتیبانی</h3>
                <p className="text-sm text-muted-foreground">جهت مشاوره و پیگیری سفارشات</p>
                <a href="tel:02158231000" className="text-lg font-bold text-gold mt-2 block" dir="ltr">
                ۰۹۱۱۲۲۸۵۹۹۱
                </a>
              </div>

              {/* واتساپ */}
              <div className="bg-card border border-border p-6 rounded-3xl flex flex-col items-center text-center gap-3 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                  <MessageCircle className="size-6" />
                </div>
                <h3 className="font-bold text-foreground">واتساپ</h3>
                <p className="text-sm text-muted-foreground">پاسخگویی سریع به پیام‌های شما</p>
                {/* لینک مستقیم به واتساپ با wa.me */}
                <a href="https://wa.me/989937789718" target="_blank" rel="noreferrer" className="text-lg font-bold text-green-500 mt-2 block" dir="ltr">
                  ۰۹۱۱۲۲۸۵۹۹۱
                </a>
              </div>
            </div>

            {/* ساعات کاری */}
            <div className="bg-card border border-border p-6 rounded-3xl flex gap-4">
              <div className="shrink-0 mt-1">
                <Clock className="size-6 text-gold" />
              </div>
              <div className="w-full">
                <h3 className="font-bold text-foreground mb-3">ساعات کاری</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex justify-between border-b border-border/50 pb-2">
                    <span>شنبه تا پنجشنبه:</span>
                    <span>۰۹:۰۰ تا ۱۸:۰۰</span>
                  </li>
                  <li className="flex justify-between text-red-500/80 mt-2">
                    <span> جمعه:</span>
                    <span>تعطیل</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* باکس توجه (قوانین تحویل حضوری) */}
            <div className="bg-gold/10 border border-gold/30 p-5 rounded-2xl flex gap-3 text-gold-darker">
              <Info className="size-5 shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed font-medium">
                <strong>توجه مهم:</strong> ثبت سفارشات منحصراً از طریق وب‌سایت انجام می‌پذیرد. مراجعه به دفتر تنها برای «تحویل حضوری» و پس از دریافت پیامکِ هماهنگی امکان‌پذیر است. لطفاً در نظر داشته باشید که در دفتر فروشگاه، امکان پرداخت نقدی یا استفاده از کارت‌خوان وجود ندارد.
              </div>
            </div>

          </div>

          {/* ستون آدرس و نقشه */}
          <div className="space-y-6 flex flex-col">
            <div className="bg-card border border-border p-6 rounded-3xl flex gap-4">
              <div className="shrink-0 mt-1">
                <MapPin className="size-6 text-gold" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-2">آدرس دفتر مرکزی</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  خیابان شریعتی (جنوب به شمال)، نرسیده به پل صدر، بالاتر از پمپ بنزین، پلاک ۱۶۹۸، طبقه هفتم
                </p>
              </div>
            </div>

            {/* کامپوننت نقشه */}
            <div className="flex-1 relative min-h-[300px]">
              <MapWrapper />
            </div>
          </div>

        </div>

        {/* بخش پایانی: چرا تراست */}
        <div className="mt-16 bg-secondary/30 border border-border rounded-3xl p-8 lg:p-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">چرا به تراست اعتماد کنیم؟</h2>
          <p className="text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            تراست نماد اطمینان در خرید است. ما روی اصالت کالا و کیفیت بی‌نظیر تمرکز داریم. از عطرهای ماندگار تا محصولات روتین پوستی، همگی از معتبرترین برندها گلچین شده‌اند تا با خیالی آسوده و با دریافت مشاوره رایگان، خریدی مقرون‌به‌صرفه، سریع و با بسته‌بندی کاملاً ایمن را تجربه کنید.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-full text-sm font-medium">
              <ShieldCheck className="size-4 text-gold" /> تضمین اصالت کالا
            </div>
            <div className="flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-full text-sm font-medium">
              <HeartHandshake className="size-4 text-gold" /> مشاوره تخصصی رایگان
            </div>
          </div>

          <Link href="/shop" passHref>
            <Button className="bg-gold text-primary-foreground hover:bg-gold-soft px-8 py-6 rounded-xl font-bold text-base">
              ورود به فروشگاه و مشاهده محصولات
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}