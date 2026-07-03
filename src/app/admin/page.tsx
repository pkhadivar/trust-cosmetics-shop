import React from 'react';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-foreground">خلاصه وضعیت فروشگاه</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* کارت کل محصولات */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-lg">
          <h2 className="text-slate-400 mb-2">کل محصولات</h2>
          <p className="text-3xl font-bold text-gold">۱,۰۰۰</p>
        </div>

        {/* کارت سفارشات جدید */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-lg">
          <h2 className="text-slate-400 mb-2">سفارشات جدید</h2>
          <p className="text-3xl font-bold text-gold">۵۰</p>
        </div>

        {/* کارت درآمد ماه جاری */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-lg">
          <h2 className="text-slate-400 mb-2">درآمد ماه جاری</h2>
          <p className="text-3xl font-bold text-gold">۱۰,۰۰۰,۰۰۰ <span className="text-sm font-normal text-slate-400">تومان</span></p>
        </div>
      </div>
    </div>
  );
}