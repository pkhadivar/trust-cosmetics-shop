"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; // 🌟 usePathname اضافه شد
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Menu, Search, ShoppingBag, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { selectCartItemCount, toggleCartDrawer } from "@/store/cartSlice";
import type { RootState } from "@/store/store";
import { getNavbarCategoriesAction } from "@/actions/category";

// 🌟 لینک‌های عمومی سایت
const navItems = [
  { label: "خانه", href: "/" },
  { label: "محصولات", href: "/shop" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
  { label: "سوالات متداول", href: "/faq" },
];

// 🌟 لینک‌های اختصاصی پنل ادمین (بر اساس عکس شما)
const adminNavItems = [
  { label: "داشبورد", href: "/admin" },
  { label: "محصولات", href: "/admin/products" },
  { label: "دسته‌بندی‌ها", href: "/admin/categories" },
  { label: "برچسب‌ها", href: "/admin/tags" },
  { label: "سفارشات", href: "/admin/orders" },
  { label: "نظرات", href: "/admin/reviews" },
  { label: "تنظیمات", href: "/admin/settings" },
  { label: "برند", href: "/admin/brands" },
  { label: "کاربران", href: "/admin/users" },
];

export function SiteNavbar() {
  const router = useRouter();
  const pathname = usePathname(); // 🌟 دریافت مسیر فعلی
  const dispatch = useDispatch();
  
  // 🌟 تشخیص اینکه آیا کاربر در صفحات ادمین است؟
  const isAdminRoute = pathname?.startsWith("/admin");
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  const cartItemCount = useSelector((state: RootState) => selectCartItemCount(state));

  useEffect(() => {
    async function fetchCategories() {
      const cats = await getNavbarCategoriesAction();
      setDbCategories(cats);
    }
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        
        {/* بخش لوگو - کلیک روی آن کاربر را به سایت اصلی برمی‌گرداند */}
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setMenuOpen(false)}
        >
          <span className="text-2xl font-bold tracking-tight gold-gradient-text">
            TRUST
          </span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            تراست
          </span>
        </Link>

        {/* منوی دسکتاپ */}
        <nav className="hidden items-center gap-8 md:flex">
          {isAdminRoute ? (
            // 🌟 اگر در پنل ادمین دسکتاپ باشیم، به جای منوهای سایت یک دکمه بازگشت نشان می‌دهیم
            <Link
              href="/"
              className="text-sm font-bold text-gold transition-colors hover:text-yellow-500 bg-gold/10 px-4 py-2 rounded-xl"
            >
              بازگشت به سایت
            </Link>
          ) : (
            // 🌟 اگر در سایت باشیم، منوهای عادی را نشان می‌دهیم
            <>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-foreground/80 transition-colors hover:text-gold"
                >
                  {item.label}
                </Link>
              ))}

              <div
                className="relative"
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm text-foreground/80 transition-colors hover:text-gold"
                  aria-expanded={categoriesOpen}
                  aria-haspopup="true"
                >
                  دسته‌بندی‌ها
                  <ChevronDown className={`size-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
                </button>

                {categoriesOpen && (
                  <div className="absolute right-0 top-full z-50 pt-4">
                    <div className="w-72 rounded-2xl border border-border bg-card p-3 shadow-[0_24px_80px_-20px_rgba(11,17,32,0.85)] max-h-[75vh] overflow-y-auto flex flex-col custom-scrollbar">
                      {dbCategories.map((category) => (
                        <div key={category.id} className="mb-2 flex flex-col last:mb-0">
                          <Link
                            href={`/shop?category=${category.id}`} 
                            className="rounded-xl px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-secondary/80 hover:text-gold"
                            onClick={() => setCategoriesOpen(false)}
                          >
                            {category.name}
                          </Link>
                          {category.children && category.children.length > 0 && (
                            <ul className="mt-1 flex flex-col space-y-0.5 border-r-2 border-border/40 me-5 pe-2">
                              {category.children.map((child: any) => (
                                <li key={child.id}>
                                  <Link
                                    href={`/shop?category=${child.id}`} 
                                    className="block rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-gold"
                                    onClick={() => setCategoriesOpen(false)}
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        {/* آیکون‌های سمت چپ */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-foreground/80 hover:bg-secondary hover:text-gold"
            aria-label="جستجو"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {isSearchOpen ? <X className="size-5 text-gold" /> : <Search className="size-5" />}
          </Button>

          <Link href="/profile" passHref>
            <Button
              size="icon"
              variant="ghost"
              className="text-foreground/80 hover:bg-secondary hover:text-gold"
              aria-label="پروفایل کاربری"
            >
              <User className="size-5" />
            </Button>
          </Link>

          <Button
            size="icon"
            variant="ghost"
            className="relative text-foreground/80 hover:bg-secondary hover:text-gold"
            aria-label="سبد خرید"
            onClick={() => dispatch(toggleCartDrawer())}
          >
            <ShoppingBag className="size-5" />
            {cartItemCount > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-primary-foreground">
                {cartItemCount.toLocaleString("fa-IR")}
              </span>
            )}
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="text-foreground/80 hover:bg-secondary hover:text-gold md:hidden"
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* پنل کادر جستجو */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 border-b border-border bg-card/95 backdrop-blur-md p-4 shadow-xl animate-in slide-in-from-top-4 fade-in duration-200">
          <form onSubmit={handleSearch} className="mx-auto flex max-w-3xl items-center gap-3">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام یا مدل محصول..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <Button type="submit" disabled={!searchQuery.trim()} className="rounded-xl bg-gold text-[#0a0f1c] px-6 py-3 font-bold hover:bg-yellow-500">
              بگرد
            </Button>
          </form>
        </div>
      )}

      {/* 🌟 منوی موبایل (هوشمند) */}
      {menuOpen && (
        <div className="border-t border-border bg-background md:hidden shadow-lg absolute w-full max-h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="mx-auto max-w-7xl space-y-1 px-5 py-4 sm:px-8">
            
            {isAdminRoute ? (
              // --- 🌟 منوی موبایل برای حالت ادمین ---
              <>
                <div className="mb-3 px-3 pb-2 text-xs font-bold text-muted-foreground border-b border-border/50">
                  منوی مدیریت
                </div>
                {adminNavItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`block rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      pathname === item.href 
                        ? "bg-gold/10 text-gold font-bold" 
                        : "text-foreground/80 hover:bg-secondary hover:text-gold"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="my-2 border-t border-border/50"></div>
                
                <Link
                  href="/"
                  className="flex items-center gap-2 block rounded-xl px-3 py-2.5 text-sm font-bold text-gold transition-colors hover:bg-gold/10"
                  onClick={() => setMenuOpen(false)}
                >
                  بازگشت به سایت اصلی
                </Link>
              </>
            ) : (
              // --- 🌟 منوی موبایل برای حالت سایت عمومی ---
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block rounded-xl px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-gold"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                <Link
                  href="/profile"
                  className="block rounded-xl px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-gold"
                  onClick={() => setMenuOpen(false)}
                >
                  پروفایل کاربری
                </Link>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-gold"
                  onClick={() => setMobileCategoriesOpen((open) => !open)}
                  aria-expanded={mobileCategoriesOpen}
                >
                  دسته‌بندی‌ها
                  <ChevronDown className={`size-4 transition-transform ${mobileCategoriesOpen ? "rotate-180" : ""}`} />
                </button>

                {mobileCategoriesOpen && (
                  <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
                    {dbCategories.map((category) => (
                      <div key={category.id}>
                        <Link
                          href={`/shop?category=${category.id}`} 
                          className="text-sm font-semibold text-foreground transition-colors hover:text-gold"
                          onClick={() => setMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                        {category.children && category.children.length > 0 && (
                          <ul className="mt-2 space-y-1.5 ps-3 border-r-2 border-border/40 me-2 pe-2">
                            {category.children.map((child: any) => (
                              <li key={child.id}>
                                <Link
                                  href={`/shop?category=${child.id}`} 
                                  className="text-sm text-muted-foreground transition-colors hover:text-gold"
                                  onClick={() => setMenuOpen(false)}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}