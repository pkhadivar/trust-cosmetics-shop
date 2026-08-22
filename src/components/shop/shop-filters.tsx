"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };
type Brand = { id: string; name: string };

type ShopFiltersProps = {
  categories: Category[];
  tags: Tag[];
  brands: Brand[];
};

export function ShopFilters({ categories, tags, brands }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentTags = searchParams.getAll("tag");
  const currentInStock = searchParams.get("inStock") === "true";

  // 🌟 اتصال به URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  // 🌟 هماهنگی همیشگی با URL
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

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

  // 🌟 هندلر تایپ کردن و پاک کردن آنی
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    // اگر کاربر کادر را خالی کرد، فورا از URL حذف کن (بدون نیاز به اینتر)
    if (val.trim() === "") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  // 🌟 هندلر اینتر زدن
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    } else {
      params.delete("q");
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearAll = () => {
    setSearchQuery("");
    router.push(pathname, { scroll: false });
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

        <div className="space-y-8 text-sm">
          {/* ۱. کادر جستجو */}
          <div className="flex flex-col gap-3">
            <label className="font-semibold text-foreground text-base">
              جستجو
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="نام محصول و اینتر..."
                className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
                aria-label="جستجو"
              >
                <Search className="size-4" />
              </button>
            </form>
          </div>

          {/* ۲. دسته‌بندی‌ها */}
          <div className="flex flex-col gap-4">
            <label className="font-semibold text-foreground text-base">
              دسته‌بندی‌ها
            </label>
            <div className="flex flex-col gap-3.5 max-h-52 overflow-y-auto pl-2 custom-scrollbar">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={currentCategory === ""}
                  onChange={() =>
                    router.push(
                      `${pathname}?${createQueryString("category", null)}`,
                      { scroll: false },
                    )
                  }
                  className="size-4.5 accent-gold shrink-0 cursor-pointer"
                />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">
                  همه محصولات
                </span>
              </label>
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={currentCategory === cat.id}
                    onChange={() =>
                      router.push(
                        `${pathname}?${createQueryString("category", cat.id)}`,
                        { scroll: false },
                      )
                    }
                    className="size-4.5 accent-gold shrink-0 cursor-pointer"
                  />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ۳. برندها */}
          {brands && brands.length > 0 && (
            <div className="flex flex-col gap-4">
              <label className="font-semibold text-foreground text-base">
                برندها
              </label>
              <div className="flex flex-col gap-3.5 max-h-52 overflow-y-auto pl-2 custom-scrollbar">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="brand"
                    checked={currentBrand === ""}
                    onChange={() =>
                      router.push(
                        `${pathname}?${createQueryString("brand", null)}`,
                        { scroll: false },
                      )
                    }
                    className="size-4.5 accent-gold shrink-0 cursor-pointer"
                  />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">
                    همه برندها
                  </span>
                </label>
                {brands.map((brand) => (
                  <label
                    key={brand.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="brand"
                      checked={currentBrand === brand.id}
                      onChange={() =>
                        router.push(
                          `${pathname}?${createQueryString("brand", brand.id)}`,
                          { scroll: false },
                        )
                      }
                      className="size-4.5 accent-gold shrink-0 cursor-pointer"
                    />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">
                      {brand.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ۴. برچسب‌ها */}
          {tags.length > 0 && (
            <div className="flex flex-col gap-4">
              <label className="font-semibold text-foreground text-base">
                برچسب‌های ویژه
              </label>
              <div className="flex flex-wrap gap-2.5">
                {tags.map((tag) => {
                  const isChecked = currentTags.includes(tag.name);
                  return (
                    <label
                      key={tag.id}
                      className={`cursor-pointer border rounded-lg px-3 py-2 transition-colors flex items-center gap-2 ${isChecked ? "bg-gold/10 border-gold" : "bg-secondary/50 border-border hover:border-gold/50"}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const newTags = isChecked
                            ? currentTags.filter((t) => t !== tag.name)
                            : [...currentTags, tag.name];
                          router.push(
                            `${pathname}?${createQueryString("tag", newTags.length ? newTags : null)}`,
                            { scroll: false },
                          );
                        }}
                        className="size-4 accent-gold cursor-pointer"
                      />
                      <span
                        className={`text-xs font-medium ${isChecked ? "text-gold" : "text-foreground"}`}
                      >
                        {tag.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ۵. موجودی */}
          <div className="pt-4 border-t border-border/50">
            <label className="flex items-center justify-between cursor-pointer group py-1">
              <span className="font-semibold text-foreground group-hover:text-gold transition-colors text-base">
                فقط کالاهای موجود
              </span>
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) =>
                  router.push(
                    `${pathname}?${createQueryString("inStock", e.target.checked ? "true" : null)}`,
                    { scroll: false },
                  )
                }
                className="size-4.5 accent-gold cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}
