import Link from "next/link";
import { Camera, Send, Phone, ArrowLeft, ShieldCheck, Code2 } from "lucide-react";

const columns = [
  {
    title: "فروشگاه",
    links: [
      { name: "محصولات", href: "/shop" },
      { name: "پرفروش‌ترین‌ها", href: "/shop?sort=newest&tag=پر+فروش" },
      { name: "محصولات جدید", href: "/shop?sort=newest" },
    ],
  },
  {
    title: "خدمات مشتریان",
    links: [
      { name: "پیگیری سفارش", href: "/profile?tab=orders" },
      { name: "سوالات متداول", href: "/faq" }, 
      { name: "تماس با ما", href: "/contact" },
    ],
  },
  {
    title: "درباره تراست",
    links: [
      { name: "درباره ما", href: "/about" },
      { name: "همکاری با ما", href: "/join-us" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40" dir="rtl">
      
      {/* بخش همکاری و کسب درآمد */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl border border-gold/40 bg-card p-8 shadow-lg lg:flex-row lg:p-10">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-64 -translate-y-1/4 translate-x-1/4 rounded-full bg-gold/10 blur-[60px]" />
          
          <div className="relative z-10 text-center lg:max-w-2xl lg:text-start">
            <h3 className="text-2xl font-bold md:text-3xl text-foreground">
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

      {/* لینک‌های فوتر و شبکه‌های اجتماعی */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-12 sm:px-8 md:grid-cols-4">
        <div>
          <span className="gold-gradient-text text-3xl font-bold tracking-wider">TRUST</span>
          {/* <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            برند لاکچری مراقبت از پوست و مو، با تعهد به کیفیت، علم و زیبایی ماندگار.
          </p> */}
          <div className="mt-6 flex gap-3">
            <SocialButton label="اینستاگرام" href="#">
              <Camera className="size-5" />
            </SocialButton>
            <SocialButton label="تلگرام" href="#">
              <Send className="size-5" />
            </SocialButton>
            <SocialButton label="تماس" href="tel:09905301182">
              <Phone className="size-5" />
            </SocialButton>
          </div>
          <div className="mt-8 flex items-center gap-4">
              <img
                referrerPolicy="origin"
                src="/enamad.webp" // سورس عکس ای‌نماد خود را اینجا بگذارید
                alt="نماد اعتماد الکترونیکی"
                className="w-20 h-auto cursor-pointer"
              />            
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-bold text-foreground text-lg mb-6">{col.title}</h4>
            <ul className="space-y-3.5">
              {col.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-gold flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-gold/50 opacity-0 transition-opacity group-hover:opacity-100" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* اطلاعیه نمایندگی */}
      <div className="border-t border-border/50 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-center">
            <ShieldCheck className="size-5 text-gold shrink-0" />
            <p className="text-sm md:text-sm font-medium text-foreground leading-relaxed">
              حضور شما در صفحه فروشگاهی ما باعث افتخار است. مسئولیت خرید شما از این وبسایت به عهده اینجانب <strong className="text-gold">همتا صادقی</strong> با کد نمایندگی <strong className="text-gold font-mono">299365
              </strong> می‌باشد.
              <span className="text-muted-foreground text-xs block md:inline md:mr-2 mt-1 md:mt-0">
                (نماینده مستقل Liateam.ir)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 🌟 کپی‌رایت و امضای توسعه‌دهنده */}
      <div className="border-t border-border bg-[#070b14]">
        <div className="mx-auto max-w-7xl px-5 py-5 text-center text-xs md:text-sm text-muted-foreground sm:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>© ۱۴۰۵ تراست. تمامی حقوق محفوظ است.</span>
          
          <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-full border border-border/50">
            <Code2 className="size-3.5 text-muted-foreground" />
            <span>طراحی و توسعه:</span>
            <a 
              href="#" /* در آینده می‌توانید لینک رزومه یا لینکدین خود را اینجا قرار دهید */
              className="font-bold text-gold hover:text-yellow-400 transition-colors"
            >
              مهندس پوریا خدیور
            </a>
          </div>
          
        </div>
      </div>

    </footer>
  );
}

function SocialButton({
  children,
  label,
  href
}: {
  children: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:border-gold/50 hover:bg-gold/5 hover:text-gold hover:-translate-y-1 shadow-sm"
    >
      {children}
    </a>
  );
}