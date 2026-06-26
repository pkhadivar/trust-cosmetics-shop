import Image from "next/image";
import { ArrowLeft } from "lucide-react";

const categories = [
  {
    title: "مراقبت از پوست",
    desc: "سرم، کرم و میست‌های آبرسان برای درخشش طبیعی پوست",
    image: "/categories/skincare.png",
    count: "۱۴۰ محصول",
  },
  {
    title: "مراقبت از مو",
    desc: "روغن‌ها و سرم‌های تقویتی برای موهای سالم و پرپشت",
    image: "/categories/haircare.png",
    count: "۸۵ محصول",
  },
];

export function CategoriesSection() {
  return (
    <section id="categories" className="bg-secondary/40 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-start">
          <div>
            <span className="text-sm font-medium text-gold">
              دسته‌بندی هوشمند
            </span>
            <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl">
              محصول مناسب خود را پیدا کنید
            </h2>
          </div>
          <div className="flex gap-2">
            <FilterChip active>همه</FilterChip>
            <FilterChip>پوست</FilterChip>
            <FilterChip>مو</FilterChip>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {categories.map((cat) => (
            <a
              key={cat.title}
              href="#products"
              className="group relative aspect-[16/10] overflow-hidden rounded-3xl border border-border"
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(11,17,32,0.95), rgba(11,17,32,0.35) 55%, transparent)",
                }}
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <span className="text-xs text-gold">{cat.count}</span>
                <h3 className="mt-1 text-2xl font-bold text-foreground">
                  {cat.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {cat.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold">
                  مشاهده محصولات
                  <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FilterChip({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`rounded-full px-5 py-2 text-sm transition-colors ${
        active
          ? "bg-gold text-primary-foreground"
          : "border border-border bg-card text-foreground/80 hover:border-gold/50 hover:text-gold"
      }`}
    >
      {children}
    </button>
  );
}
