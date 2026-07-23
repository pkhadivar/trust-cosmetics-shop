"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, X, Shield, User } from "lucide-react";
import { SearchInput } from "@/components/shared/SearchInput";

export function UserSearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentRole = searchParams.get("role") || "ALL";
  const hasActiveFilters = searchParams.get("q") || currentRole !== "ALL";

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const value = e.target.value;
    
    if (value === "ALL") {
      params.delete("role");
    } else {
      params.set("role", value);
    }
    
    params.set("page", "1"); // با تغییر فیلتر برگرد به صفحه اول
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
      
      {/* استفاده از کامپوننت عمومی جستجو */}
      <SearchInput placeholder="جستجو بر اساس نام، موبایل یا ایمیل..." />

      {/* فیلتر اختصاصی نقش کاربر */}
      <div className="relative w-full sm:w-auto min-w-[200px] flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground absolute right-3 pointer-events-none" />
        <select
          value={currentRole}
          onChange={handleRoleChange}
          className="w-full appearance-none bg-secondary/50 border border-border text-sm text-foreground py-2.5 pr-9 pl-4 rounded-xl focus:outline-none focus:border-gold transition-colors cursor-pointer"
        >
          <option value="ALL">همه کاربران</option>
          <option value="USER">کاربران عادی</option>
          <option value="ADMIN">مدیران سیستم</option>
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