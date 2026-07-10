import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AdminNavLinks } from '@/components/admin/AdminNavLinks'; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground" dir="rtl">
      
      {/* سایدبار داینامیک و هوشمند */}
      <aside className="hidden md:flex flex-col w-64 bg-card p-4 border-l border-border h-screen sticky top-0">
        <div className="p-2 mb-6">
          <h2 className="text-2xl font-bold text-gold tracking-wider">TRUST ADMIN</h2>
        </div>
        
        {/* رندر کامپوننت ناوبری هوشمند کلاینتی */}
        <AdminNavLinks />
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