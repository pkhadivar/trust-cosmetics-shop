"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { SearchInput } from "@/components/shared/SearchInput"; // 🌟 کامپوننت عمومی جستجو

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

  const currentStatus = searchParams.get("status") || "ALL";
  
  // بررسی اینکه آیا اصلاً فیلتری فعال هست یا خیر (برای دکمه پاک کردن)
  const hasActiveFilters = searchParams.get("q") || currentStatus !== "ALL";

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const value = e.target.value;
    
    if (value === "ALL") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    
    // با تغییر وضعیت، برگرد به صفحه اول
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
      
      {/* 🌟 استفاده از کامپوننت عمومی جستجو */}
      <SearchInput placeholder="جستجو با نام، شماره تماس یا شماره سفارش..." />

      {/* فیلتر اختصاصی وضعیت سفارش */}
      <div className="relative w-full sm:w-auto min-w-[200px] flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground absolute right-3 pointer-events-none" />
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