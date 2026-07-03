"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProductAction } from '@/actions/product'; // ایمپورت اکشن سروری

interface Category {
  id: string;
  name: string;
}

export default function AddProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // فراخوانی مستقیم تابع سروری
    const result = await createProductAction(formData, imageUrl);

    if (result.success) {
      alert('محصول با موفقیت ذخیره شد!');
      router.push('/admin/products');
      // دیگر نیازی به router.refresh() نیست، چون revalidatePath در اکشن سروری این کار را می‌کند
    } else {
      alert(result.error || 'خطا در ثبت محصول');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label htmlFor="title" className="block text-slate-400 mb-2 text-sm">نام محصول *</label>
          <input type="text" id="title" name="title" required 
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="subtitle" className="block text-slate-400 mb-2 text-sm">زیرنویس (روی کارت)</label>
          <input type="text" id="subtitle" name="subtitle" 
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-slate-400 mb-2 text-sm">قیمت (تومان) *</label>
          <input type="number" id="price" name="price" required 
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors text-left" dir="ltr"
          />
        </div>

        <div>
          <label htmlFor="isAvailable" className="block text-slate-400 mb-2 text-sm">وضعیت تامین کالا *</label>
          <select id="isAvailable" name="isAvailable" required defaultValue="true"
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors appearance-none"
          >
            <option value="true">موجود در شرکت اصلی (قابل سفارش)</option>
            <option value="false">فعلاً ناموجود</option>
          </select>
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-slate-400 mb-2 text-sm">دسته‌بندی *</label>
          <select id="categoryId" name="categoryId" required 
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors appearance-none"
          >
            <option value="">انتخاب کنید...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="badge" className="block text-slate-400 mb-2 text-sm">برچسب ویژه</label>
          <select id="badge" name="badge" 
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors appearance-none"
          >
            <option value="">بدون برچسب</option>
            <option value="جدید">جدید</option>
            <option value="پرفروش">پرفروش</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="imageUrl" className="block text-slate-400 mb-2 text-sm">لینک تصویر محصول (موقتی)</label>
          <input type="url" id="imageUrl" name="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors text-left" dir="ltr" placeholder="https://example.com/image.jpg"
          />
        </div>

      </div>

      <div className="mt-6">
        <label htmlFor="description" className="block text-slate-400 mb-2 text-sm">توضیحات کامل محصول *</label>
        <textarea id="description" name="description" required rows={4}
          className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors"
        ></textarea>
      </div>

      <div className="mt-8 flex justify-end">
        <button type="submit" disabled={loading}
          className="bg-gold text-[#0a0f1c] px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
        >
          {loading ? 'در حال ثبت...' : 'ذخیره محصول'}
        </button>
      </div>
    </form>
  );
}