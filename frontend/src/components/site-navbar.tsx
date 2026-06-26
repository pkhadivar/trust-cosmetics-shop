"use client";

import { ShoppingBag, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "خانه", href: "#" },
  { label: "محصولات", href: "#products" },
  { label: "دسته‌بندی‌ها", href: "#categories" },
  { label: "درباره ما", href: "#features" },
];

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight gold-gradient-text">
            TRUST
          </span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            تراست
          </span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-foreground/80 transition-colors hover:text-gold"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-foreground/80 hover:bg-secondary hover:text-gold"
            aria-label="جستجو"
          >
            <Search className="size-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="relative text-foreground/80 hover:bg-secondary hover:text-gold"
            aria-label="سبد خرید"
          >
            <ShoppingBag className="size-5" />
            <span className="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-primary-foreground">
              ۲
            </span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-foreground/80 hover:bg-secondary hover:text-gold md:hidden"
            aria-label="منو"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
