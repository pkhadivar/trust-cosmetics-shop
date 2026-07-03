import { FlaskConical, Stethoscope, Leaf, Truck } from "lucide-react";

const features = [
  {
    icon: FlaskConical,
    title: "فرمولاسیون تخصصی",
    desc: "ساخته‌شده توسط متخصصان شیمی آرایشی با بالاترین استانداردهای جهانی.",
  },
  {
    icon: Stethoscope,
    title: "تاییدیه پزشکان",
    desc: "تمامی محصولات زیر نظر پزشکان متخصص پوست تست و تایید شده‌اند.",
  },
  {
    icon: Leaf,
    title: "ترکیبات ارگانیک",
    desc: "استفاده از عصاره‌های گیاهی خالص و فاقد مواد مضر و آزاردهنده.",
  },
  {
    icon: Truck,
    title: "ارسال سریع و مطمئن",
    desc: "بسته‌بندی لاکچری و ارسال به سراسر کشور در کوتاه‌ترین زمان.",
  },
];

export function FeaturesGrid() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="text-center">
        <span className="text-sm font-medium text-gold">چرا تراست؟</span>
        <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl">
          تعهد ما به کیفیت بی‌نقص
        </h2>
        <div className="mx-auto mt-4 h-px w-24 gold-divider" aria-hidden />
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-2xl border border-border bg-card p-7 transition-all hover:border-gold/50 hover:shadow-[0_0_40px_-12px_rgba(212,175,55,0.35)]"
          >
            <div className="flex size-13 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-primary-foreground">
              <feature.icon className="size-6" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
