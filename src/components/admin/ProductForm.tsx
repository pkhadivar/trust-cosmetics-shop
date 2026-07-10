"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // اضافه شدن کتابخانه پیام‌ها
import { createProductAction, updateProductAction } from '@/actions/product'; 

interface Category { 
  id: string; 
  name: string; 
}

export default function ProductForm({ categories, initialData }: { categories: Category[], initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.images?.[0] || '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // انتخاب خودکار بین اکشنِ ثبت یا ویرایش بر اساس وجود initialData
    const result = initialData 
      ? await updateProductAction(initialData.id, formData, imageUrl)
      : await createProductAction(formData, imageUrl);

    if (result.success) {
      // نمایش پیام موفقیت با Toast
      toast.success(initialData ? 'محصول با موفقیت آپدیت شد!' : 'محصول جدید با موفقیت ذخیره شد!');
      router.push('/admin/products');
    } else {
      // نمایش پیام خطا با Toast
      toast.error(result.error || 'خطا در ارتباط با سرور');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* فیلد نام */}
        <div>
          <label className="block text-slate-400 mb-2 text-sm">نام محصول *</label>
          <input type="text" name="title" defaultValue={initialData?.title} required 
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors" />
        </div>

        {/* فیلد زیرنویس */}
        <div>
          <label className="block text-slate-400 mb-2 text-sm">زیرنویس (روی کارت)</label>
          <input type="text" name="subtitle" defaultValue={initialData?.subtitle} 
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors" />
        </div>

        {/* فیلد قیمت اصلی */}
        <div>
          <label className="block text-slate-400 mb-2 text-sm">قیمت (تومان) *</label>
          <input type="number" name="price" defaultValue={initialData?.price} required 
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors text-left" dir="ltr" />
        </div>

        {/* فیلد قیمت تخفیف */}
        <div>
          <label className="block text-slate-400 mb-2 text-sm">قیمت با تخفیف (اختیاری)</label>
          <input type="number" name="discountedPrice" defaultValue={initialData?.discountedPrice || ''} 
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors text-left" dir="ltr" placeholder="اگر تخفیف ندارد، خالی بگذارید" />
        </div>

        {/* وضعیت تامین کالا */}
        <div>
          <label className="block text-slate-400 mb-2 text-sm">وضعیت تامین کالا *</label>
          <select name="isAvailable" defaultValue={initialData ? (initialData.isAvailable ? "true" : "false") : "true"} required
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors appearance-none">
            <option value="true">موجود در شرکت اصلی (قابل سفارش)</option>
            <option value="false">فعلاً ناموجود</option>
          </select>
        </div>

        {/* فیلد دسته‌بندی */}
        <div>
          <label className="block text-slate-400 mb-2 text-sm">دسته‌بندی *</label>
          <select name="categoryId" defaultValue={initialData?.categoryId} required 
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors appearance-none">
            <option value="">انتخاب کنید...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* فیلد برچسب */}
        <div>
          <label className="block text-slate-400 mb-2 text-sm">برچسب ویژه</label>
          <select name="badge" defaultValue={initialData?.badge || ''} 
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors appearance-none">
            <option value="">بدون برچسب</option>
            <option value="جدید">جدید</option>
            <option value="پرفروش">پرفروش</option>
          </select>
        </div>

        {/* فیلد عکس */}
        <div className="md:col-span-2">
          <label className="block text-slate-400 mb-2 text-sm">لینک تصویر محصول (موقتی)</label>
          <input type="url" name="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required
            className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors text-left" dir="ltr" placeholder="https://example.com/image.jpg" />
        </div>

      </div>

      {/* فیلد توضیحات */}
      <div className="mt-6">
        <label className="block text-slate-400 mb-2 text-sm">توضیحات کامل محصول *</label>
        <textarea name="description" defaultValue={initialData?.description} required rows={4}
          className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-gold focus:outline-none transition-colors"></textarea>
      </div>

      <div className="mt-8 flex justify-end">
        <button type="submit" disabled={loading}
          className="bg-gold text-[#0a0f1c] px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          {loading ? 'در حال پردازش...' : (initialData ? 'ذخیره تغییرات' : 'ثبت محصول جدید')}
        </button>
      </div>
    </form>
  );
}