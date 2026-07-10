"use client";

import { useState, useTransition, useRef } from 'react';
import CategoryModal from '@/components/admin/CategoryModal';
import DeleteCategoryButton from '@/components/admin/DeleteCategoryButton';
import { createCategoryAction } from '@/actions/category';
import toast from 'react-hot-toast'; // ۱. اضافه شدن توست

export default function CategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [isPending, startTransition] = useTransition(); // ۲. برای مدیریت حالت لودینگ
  const formRef = useRef<HTMLFormElement>(null); // ۳. برای ریست کردن فرم بعد از ثبت

  // ۴. تابع هوشمند برای هندل کردن ایجاد دسته‌بندی
  const handleCreate = (formData: FormData) => {
    const name = formData.get('name') as string;
    
    if (!name.trim()) {
      toast.error('نام دسته‌بندی نمی‌تواند خالی باشد');
      return;
    }

    startTransition(async () => {
      const result = await createCategoryAction(formData);
      
      if (result?.success) {
        toast.success('دسته‌بندی جدید با موفقیت ذخیره شد!');
        formRef.current?.reset(); // فرم خالی می‌شود تا آماده ثبت بعدی باشد
      } else {
        toast.error(result?.error || 'خطا در ثبت دسته‌بندی');
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-foreground mb-8">مدیریت دسته‌بندی‌ها</h1>
      
      {/* ۵. اتصال فرم به تابع هوشمند و اضافه کردن ref */}
<form ref={formRef} action={handleCreate} className="bg-card p-6 rounded-xl border border-border mb-8">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    <div>
      <label className="block text-slate-400 mb-2 text-sm">نام دسته‌بندی جدید *</label>
      <input 
        name="name" 
        required 
        disabled={isPending}
        className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-gold focus:outline-none transition-colors" 
        placeholder="مثال: آرایشی" 
      />
    </div>
    <div>
      <label className="block text-slate-400 mb-2 text-sm">لینک تصویر دسته‌بندی (اختیاری)</label>
      <input 
        name="imageUrl" 
        disabled={isPending}
        className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-gold focus:outline-none transition-colors text-left" 
        dir="ltr"
        placeholder="https://example.com/category.jpg" 
      />
    </div>
  </div>
  <button 
    type="submit" 
    disabled={isPending}
    className="bg-gold text-[#0a0f1c] px-6 py-2 rounded-lg font-bold transition-all hover:bg-yellow-400 disabled:opacity-50"
  >
    {isPending ? 'در حال ثبت...' : 'ذخیره دسته‌بندی جدید'}
  </button>
</form>

      <div className="space-y-2">
        {initialCategories.map(cat => (
          <div key={cat.id} 
               className="bg-card p-4 rounded-lg border border-border flex justify-between items-center text-foreground cursor-pointer hover:border-gold transition-colors group"
               onClick={() => setSelectedCat(cat)}>
            
            <span>{cat.name}</span>
            
            <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DeleteCategoryButton id={cat.id} name={cat.name} />
            </div>

          </div>
        ))}
      </div>

      {selectedCat && (
        <CategoryModal category={selectedCat} isOpen={true} onClose={() => setSelectedCat(null)} />
      )}
    </div>
  );
}