"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { SearchInput } from "@/components/shared/SearchInput"; // ایمپورت کامپوننت عمومی

type Category = { id: string; name: string };

export function ProductSearchFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("categoryId") || "ALL";
  const currentAvailable = searchParams.get("isAvailable") || "ALL";
  const hasActiveFilters = searchParams.get("q") || currentCategory !== "ALL" || currentAvailable !== "ALL";

  const handleSelectChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") params.delete(name);
    else params.set(name, value);
    
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-col lg:flex-row items-center gap-4 shadow-sm">
      
      {/* 🌟 استفاده از کامپوننت عمومی جستجو */}
      <SearchInput placeholder="جستجوی نام محصول..." />

      {/* فیلتر اختصاصی دسته‌بندی */}
      <div className="relative w-full lg:w-48 flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground absolute right-3 pointer-events-none" />
        <select
          value={currentCategory}
          onChange={(e) => handleSelectChange("categoryId", e.target.value)}
          className="w-full appearance-none bg-secondary/50 border border-border text-sm text-foreground py-2.5 pr-9 pl-4 rounded-xl focus:outline-none focus:border-gold transition-colors cursor-pointer"
        >
          <option value="ALL">همه دسته‌بندی‌ها</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* فیلتر اختصاصی موجودی */}
      <div className="relative w-full lg:w-48 flex items-center gap-2">
        <select
          value={currentAvailable}
          onChange={(e) => handleSelectChange("isAvailable", e.target.value)}
          className="w-full appearance-none bg-secondary/50 border border-border text-sm text-foreground py-2.5 px-4 rounded-xl focus:outline-none focus:border-gold transition-colors cursor-pointer"
        >
          <option value="ALL">همه وضعیت‌ها</option>
          <option value="TRUE">موجود در انبار</option>
          <option value="FALSE">ناموجود</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="w-full lg:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors shrink-0"
        >
          <X className="size-4" /> پاک کردن
        </button>
      )}
    </div>
  );
}