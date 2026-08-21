"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { getMediaUrl } from "@/utils/media"; // 👈 اضافه کردن تابع هلپر

type Brand = {
  id: string;
  name: string;
  logo: string | null;
};

export function BrandShowcase({ brands }: { brands: Brand[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!scrollRef.current || isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } = scrollRef.current;
        const isAtEnd = Math.abs(scrollLeft) >= scrollWidth - clientWidth - 10;

        if (isAtEnd) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: -340, behavior: "smooth" });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  if (!brands || brands.length === 0) return null;

  return (
    <section className="py-16 w-full bg-background border-y border-border/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5">
        {/* بخش عناوین */}
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            برندهای ما
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            انتخاب بر اساس برند
          </p>
        </div>

        {/* کانتینر اسلایدر برندها */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex flex-nowrap items-stretch gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/shop?brand=${brand.id}`}
              className="group relative flex flex-col items-center min-w-[280px] md:min-w-[320px] bg-secondary/10 hover:bg-secondary/20 border border-border/50 hover:border-gold/50 rounded-2xl p-4 transition-all duration-300 snap-center shrink-0"
              title={brand.name}
            >
              {/* تصویر برند */}
              <div className="w-full h-36 md:h-44 relative rounded-xl overflow-hidden mb-4 bg-background/50 flex items-center justify-center border border-border/30">
                {brand.logo ? (
                  <img
                    /* 👈 پردازش امن آدرس لوگو با تابع getMediaUrl */
                    src={getMediaUrl(brand.logo)}
                    alt={brand.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-muted-foreground text-sm">
                    بدون تصویر
                  </span>
                )}
              </div>

              {/* نام برند */}
              <span className="text-lg font-bold text-foreground group-hover:text-gold transition-colors text-center w-full truncate px-2">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
