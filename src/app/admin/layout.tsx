import Link from 'next/link';
import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground" dir="rtl">
      
      {/* سایدبار ثابت */}
      <aside className="hidden md:flex flex-col w-64 bg-card p-4 border-l border-border h-screen sticky top-0">
        <div className="p-2 mb-6">
          <h2 className="text-2xl font-bold text-gold tracking-wider">TRUST ADMIN</h2>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/admin" className="block py-2 px-3 rounded-lg text-gold hover:text-primary hover:bg-white/5 transition-all">
                داشبورد
              </Link>
            </li>
            <li>
              <Link href="/admin/products" className="block py-2 px-3 rounded-lg text-gold hover:text-primary hover:bg-white/5 transition-all">
                محصولات
              </Link>
            </li>
            <li>
              <Link href="/admin/categories" className="block py-2 px-3 rounded-lg text-gold hover:text-primary hover:bg-white/5 transition-all">
                دسته‌بندی‌ها
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" className="block py-2 px-3 rounded-lg text-gold hover:text-primary hover:bg-white/5 transition-all">
                سفارشات
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* محتوای اصلی */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>

      {/* تنظیم Toaster با متغیرهای دینامیک CSS */}
      <Toaster 
        position="bottom-left" 
        toastOptions={{
          style: { 
            background: 'var(--card)', 
            color: 'var(--foreground)', 
            border: '1px solid var(--border)',
            fontFamily: 'inherit'
          }
        }} 
      />
      
    </div>
  );
}