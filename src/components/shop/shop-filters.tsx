"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

type ShopFiltersProps = {
  categories: Category[];
  tags: Tag[];
};

export function ShopFilters({ categories, tags }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentTags = searchParams.getAll("tag");
  const currentInStock = searchParams.get("inStock") === "true";
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const createQueryString = (name: string, value: string | string[] | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === null) {
      params.delete(name);
    } else if (Array.isArray(value)) {
      params.delete(name);
      value.forEach((v) => params.append(name, v));
    } else {
      params.set(name, value);
    }
    
    return params.toString();
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      if (searchQuery !== currentQ) {
        router.push(`${pathname}?${createQueryString("q", searchQuery || null)}`);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, pathname, router, searchParams]);

  const handleClearAll = () => {
    setSearchQuery("");
    router.push(pathname); 
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
      <div className="bg-card border border-border rounded-2xl p-5 lg:sticky lg:top-24 shadow-sm">
        
        <div className="flex items-center justify-between border-b border-border/50 pb-5 mb-6">
          <div className="flex items-center gap-2 text-foreground font-bold text-lg">
            <SlidersHorizontal className="size-5 text-gold" />
            <span>فیلترها</span>
          </div>
          <button 
            onClick={handleClearAll}
            className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
          >
            پاک کردن همه
          </button>
        </div>

        <div className="space-y-8 text-sm"> {/* افزایش فاصله بین کل سکشن‌ها از 6 به 8 */}
          
          {/* ۱. جستجوی متنی */}
          <div className="flex flex-col gap-3"> {/* استفاده از gap-3 برای فاصله عنوان و اینپوت */}
            <label className="font-semibold text-foreground text-base">جستجو</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="نام محصول..."
                className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
              />
              <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* ۲. دسته‌بندی‌ها */}
          <div className="flex flex-col gap-4"> {/* استفاده از gap-4 برای فضای تنفس بیشتر */}
            <label className="font-semibold text-foreground text-base">دسته‌بندی‌ها</label>
            <div className="flex flex-col gap-3.5 max-h-52 overflow-y-auto pl-2 custom-scrollbar">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={currentCategory === ""}
                  onChange={() => router.push(`${pathname}?${createQueryString("category", null)}`)}
                  className="size-4.5 accent-gold shrink-0 cursor-pointer"
                />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">
                  همه محصولات
                </span>
              </label>
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={currentCategory === cat.id}
                    onChange={() => router.push(`${pathname}?${createQueryString("category", cat.id)}`)}
                    className="size-4.5 accent-gold shrink-0 cursor-pointer"
                  />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ۳. برچسب‌ها (انتخاب چندگانه) */}
          {tags.length > 0 && (
            <div className="flex flex-col gap-4">
              <label className="font-semibold text-foreground text-base">برچسب‌های ویژه</label>
              <div className="flex flex-wrap gap-2.5">
                {tags.map((tag) => {
                  const isChecked = currentTags.includes(tag.name);
                  return (
                    <label
                      key={tag.id}
                      className={`cursor-pointer border rounded-lg px-3 py-2 transition-colors flex items-center gap-2 ${
                        isChecked ? "bg-gold/10 border-gold" : "bg-secondary/50 border-border hover:border-gold/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const newTags = isChecked
                            ? currentTags.filter((t) => t !== tag.name)
                            : [...currentTags, tag.name];
                          router.push(`${pathname}?${createQueryString("tag", newTags.length ? newTags : null)}`);
                        }}
                        className="size-4 accent-gold cursor-pointer"
                      />
                      <span className={`text-xs font-medium ${isChecked ? "text-gold" : "text-foreground"}`}>
                        {tag.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ۴. موجودی */}
          <div className="pt-4 border-t border-border/50">
            <label className="flex items-center justify-between cursor-pointer group py-1">
              <span className="font-semibold text-foreground group-hover:text-gold transition-colors text-base">فقط کالاهای موجود</span>
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => router.push(`${pathname}?${createQueryString("inStock", e.target.checked ? "true" : null)}`)}
                className="size-4.5 accent-gold cursor-pointer"
              />
            </label>
          </div>
          
        </div>
      </div>
    </aside>
  );
}