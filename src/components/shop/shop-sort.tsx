"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function ShopSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // خواندن وضعیت مرتب‌سازی از URL (پیش‌فرض روی جدیدترین‌ها)
  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">مرتب‌سازی بر اساس:</span>
      <div className="relative">
        <select
          value={currentSort}
          onChange={handleSortChange}
          className="appearance-none bg-secondary border border-border rounded-xl pl-8 pr-4 py-2 text-sm text-foreground focus:border-gold focus:outline-none cursor-pointer"
        >
          <option value="newest">جدیدترین‌ها</option>
          <option value="price-asc">ارزان‌ترین</option>
          <option value="price-desc">گران‌ترین</option>
        </select>
        <ChevronDown className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}