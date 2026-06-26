import Image from "next/image";
import { ArrowLeft, Star } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* ambient gold glow */}
      <div
        className="pointer-events-none absolute -top-40 start-1/2 size-[600px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, #d4af37, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
        {/* Copy */}
        <div className="relative z-10 text-center lg:text-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-xs text-gold">
            <Star className="size-3.5 fill-gold" />
            مجموعه لاکچری ۱۴۰۵
          </span>

          <h1 className="mt-6 text-balance text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            زیبایی ماندگار با
            <span className="block gold-gradient-text">مراقبت تخصصی پوست</span>
          </h1>

          <p className="mx-auto mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground lg:mx-0">
            ترکیبی از علم و طبیعت؛ محصولات تراست با فرمولاسیون اختصاصی و تاییدیه
            پزشکان متخصص، درخششی بی‌نظیر به پوست و موی شما هدیه می‌دهند.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <a
              href="#products"
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-lg bg-gold px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-gold-soft"
            >
              مشاهده محصولات
              <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            </a>
            <a
              href="#categories"
              className="inline-flex h-13 items-center justify-center rounded-lg border border-border bg-transparent px-8 text-base text-foreground transition-colors hover:bg-secondary hover:text-gold"
            >
              داستان برند
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 lg:justify-start">
            <Stat value="+۲۵۰" label="محصول تخصصی" />
            <span className="h-10 w-px bg-border" aria-hidden />
            <Stat value="+۹۸٪" label="رضایت مشتریان" />
            <span className="h-10 w-px bg-border" aria-hidden />
            <Stat value="+۱۲" label="سال تجربه" />
          </div>
        </div>

        {/* Product showcase */}
        <div className="relative z-10">
          <div className="relative mx-auto aspect-square max-w-md">
            <div
              className="absolute inset-6 rounded-full border border-gold/30"
              aria-hidden
            />
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-b from-secondary/80 to-transparent"
              aria-hidden
            />
            <Image
              src="/products/hero-serum.png"
              alt="سرم طلایی احیاکننده تراست"
              fill
              priority
              className="object-contain drop-shadow-2xl"
            />
          </div>

          {/* floating price card */}
          <div className="absolute bottom-6 start-0 flex items-center gap-3 rounded-2xl border border-border bg-card/90 p-4 backdrop-blur-md">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <Star className="size-5 fill-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold">سرم طلایی</p>
              <p className="text-sm text-gold">۲٬۸۵۰٬۰۰۰ تومان</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center lg:text-start">
      <p className="text-2xl font-bold text-gold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
