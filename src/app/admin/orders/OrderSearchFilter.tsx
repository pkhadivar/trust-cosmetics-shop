"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";

const statusOptions = [
  { value: "ALL", label: "همه وضعیت‌ها" },
  { value: "PENDING", label: "در انتظار پرداخت" },
  { value: "PAID", label: "پرداخت شده" },
  { value: "PROCESSING", label: "در حال پردازش" },
  { value: "SHIPPED", label: "ارسال شده" },
  { value: "DELIVERED", label: "تحویل داده شده" },
  { value: "CANCELLED", label: "لغو شده" },
];

export function OrderSearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // خواندن مقادیر فعلی از URL
  const currentStatus = searchParams.get("status") || "ALL";
  const currentQ = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(currentQ);

  // تابع ساخت URL جدید
  const createQueryString = (name: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "ALL" || value === "") {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    return params.toString();
  };

  // اعمال جستجوی متنی با نیم ثانیه تاخیر (برای جلوگیری از ریکوئست‌های اضافی به سرور)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== currentQ) {
        router.push(`${pathname}?${createQueryString("q", searchQuery || null)}`);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, pathname, router, currentQ]);

  // اعمال فیلتر وضعیت
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`${pathname}?${createQueryString("status", e.target.value)}`);
  };

  // پاک کردن فیلترها
  const handleClearFilters = () => {
    setSearchQuery("");
    router.push(pathname);
  };

  const hasActiveFilters = currentStatus !== "ALL" || currentQ !== "";

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
      
      {/* فیلد جستجو */}
      <div className="relative w-full sm:flex-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجو با نام، شماره تماس یا شماره سفارش..."
          className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none transition-colors"
        />
        <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* فیلتر وضعیت */}
      <div className="relative w-full sm:w-auto min-w-[200px] flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground absolute right-3" />
        <select
          value={currentStatus}
          onChange={handleStatusChange}
          className="w-full appearance-none bg-secondary/50 border border-border text-sm text-foreground py-2.5 pr-9 pl-4 rounded-xl focus:outline-none focus:border-gold transition-colors cursor-pointer"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* دکمه پاک کردن فیلترها */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors shrink-0"
        >
          <X className="size-4" /> پاک کردن
        </button>
      )}
    </div>
  );
}