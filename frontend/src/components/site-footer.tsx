import { Camera, Send, Phone } from "lucide-react";
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
      {/* Newsletter */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-gold/30 bg-card p-8 lg:flex-row lg:p-10">
          <div className="text-center lg:text-start">
            <h3 className="text-2xl font-bold">
              عضویت در <span className="text-gold">خبرنامه</span> تراست
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              از جدیدترین محصولات و تخفیف‌های ویژه باخبر شوید.
            </p>
          </div>
          <form className="flex w-full max-w-md gap-3">
            <input
              type="email"
              placeholder="آدرس ایمیل شما"
              className="h-12 flex-1 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold"
              aria-label="آدرس ایمیل"
            />
            <Button
              type="submit"
              className="h-12 bg-gold px-6 font-semibold text-primary-foreground hover:bg-gold-soft"
            >
              عضویت
            </Button>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-12 sm:px-8 md:grid-cols-4">
        <div>
          <span className="text-2xl font-bold gold-gradient-text">TRUST</span>
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
                    href="#"
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
