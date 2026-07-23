"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ساختار داینامیک منو: هر زمان تب جدیدی خواستید، فقط یک خط به این آرایه اضافه کنید
const menuItems = [
  { title: "داشبورد", href: "/admin" },
  { title: "محصولات", href: "/admin/products" },
  { title: "دسته‌بندی‌ها", href: "/admin/categories" },
  { title: "برچسب‌ها", href: "/admin/tags" }, 
  { title: "سفارشات", href: "/admin/orders" },
  { title: "نظرات", href: "/admin/reviews" }, // <--- اضافه شدن تب نظرات در اینجا
  { title: "تنطیمات", href: "/admin/settings" },
  { title: "برند", href: "/admin/brands" },
  { title: "کاربران", href: "/admin/users" },


];

export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <nav>
      <ul className="space-y-2">
        {menuItems.map((item) => {
          // تشخیص هوشمندانه تب فعال:
          // برای داشبورد فقط آدرس دقیق را چک می‌کنیم، برای بقیه اگر آدرس با آن شروع شود (مثلا صفحه ویرایش محصول) تب فعال می‌ماند.
          const isActive = 
            item.href === "/admin" 
              ? pathname === "/admin" 
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className={`block py-2.5 px-4 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gold/10 text-gold font-bold border-r-4 border-gold shadow-[0_0_15px_-3px_rgba(212,175,55,0.2)]" // استایل تب فعال و روشن
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 font-medium" // استایل تب عادی
                }`}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}