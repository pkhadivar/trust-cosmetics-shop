import Link from "next/link";
import { Camera, Send, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const columns = [
  {
    title: "فروشگاه",
    links: ["مراقبت از پوست", "مراقبت از مو", "پرفروش‌ترین‌ها", "محصولات جدید"],
  },
  {
    title: "خدمات مشتریان",
    links: ["پیگیری سفارش", "شرایط ارسال", "بازگشت کالا", "سوالات متداول"],
  },
  {
    title: "درباره تراست",
    links: ["داستان ما", "فرمولاسیون", "همکاری با ما", "تماس با ما"],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      {/* بخش جدید همکاری و کسب درآمد (جایگزین خبرنامه) */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl border border-gold/40 bg-card p-8 shadow-lg lg:flex-row lg:p-10">
          {/* افکت نوری پس‌زمینه */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-64 -translate-y-1/4 translate-x-1/4 rounded-full bg-gold/10 blur-[60px]" />
          
          <div className="relative z-10 text-center lg:max-w-2xl lg:text-start">
            <h3 className="text-2xl font-bold md:text-3xl">
              نماینده فروش <span className="text-gold">تراست</span> شوید و درآمد کسب کنید!
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              بدون نیاز به سرمایه اولیه، محصولات باکیفیت ما را معرفی کنید و پورسانت عالی دریافت کنید. 
              برای مشاهده آموزش ثبت‌نام و دریافت کد معرف اختصاصی کلیک کنید.
            </p>
          </div>
          
          <div className="relative z-10 w-full shrink-0 lg:w-auto">
            <Link
              href="/join-us"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-8 py-4 text-sm font-bold text-[#0a0f1c] transition-all hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] lg:w-auto"
            >
              شروع همکاری و آموزش ثبت‌نام
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-12 sm:px-8 md:grid-cols-4">
        <div>
          <span className="gold-gradient-text text-2xl font-bold">TRUST</span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            برند لاکچری مراقبت از پوست و مو، با تعهد به کیفیت، علم و زیبایی
            ماندگار.
          </p>
          <div className="mt-5 flex gap-2">
            <SocialButton label="اینستاگرام">
              <Camera className="size-5" />
            </SocialButton>
            <SocialButton label="تلگرام">
              <Send className="size-5" />
            </SocialButton>
            <SocialButton label="تماس">
              <Phone className="size-5" />
            </SocialButton>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold text-foreground">{col.title}</h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href={link === "همکاری با ما" ? "/join-us" : "#"}
                    className="text-sm text-muted-foreground transition-colors hover:text-gold"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-6 text-center text-sm text-muted-foreground sm:px-8">
          © ۱۴۰۵ تراست. تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}

function SocialButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex size-10 items-center justify-center rounded-xl border border-border bg-background text-foreground/80 transition-colors hover:border-gold/50 hover:text-gold"
    >
      {children}
    </a>
  );
}