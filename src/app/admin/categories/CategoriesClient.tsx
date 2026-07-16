"use client";

import { useState, useTransition, useRef } from 'react';
import CategoryModal from '@/components/admin/CategoryModal';
import DeleteCategoryButton from '@/components/admin/DeleteCategoryButton';
import { createCategoryAction } from '@/actions/category';
import { uploadFilesAction } from '@/actions/upload'; // اکشن آپلود S3
import toast from 'react-hot-toast';
import { UploadCloud } from 'lucide-react'; // آیکون آپلود

export default function CategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  
  // استیت برای نگهداری فایل انتخاب شده
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const mainFormData = new FormData(formElement);
    
    const name = mainFormData.get('name') as string;
    if (!name.trim()) {
      toast.error('نام دسته‌بندی نمی‌تواند خالی باشد');
      return;
    }

    startTransition(async () => {
      let finalImageUrl = "";

      // مرحله اول: آپلود عکس در S3 (اگر عکسی انتخاب شده باشد)
      if (selectedImage) {
        const uploadData = new FormData();
        uploadData.append("files", selectedImage);
        
        const uploadRes = await uploadFilesAction(uploadData);
        if (uploadRes.success && uploadRes.urls && uploadRes.urls.length > 0) {
          finalImageUrl = uploadRes.urls[0]; // دریافت لینک S3 لیارا
        } else {
          toast.error("خطا در آپلود تصویر دسته‌بندی");
          return; // توقف عملیات در صورت شکست آپلود
        }
      }

      // تنظیم لینک آپلود شده در فرم دیتا برای ارسال به دیتابیس
      mainFormData.set('imageUrl', finalImageUrl);

      // مرحله دوم: ثبت دسته‌بندی در دیتابیس
      const result = await createCategoryAction(mainFormData);
      
      if (result?.success) {
        toast.success('دسته‌بندی جدید با موفقیت ذخیره شد!');
        formRef.current?.reset();
        setSelectedImage(null); // ریست کردن استیت فایل
      } else {
        toast.error(result?.error || 'خطا در ثبت دسته‌بندی');
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-foreground mb-8">مدیریت دسته‌بندی‌ها</h1>
      
      <form ref={formRef} onSubmit={handleSubmit} className="bg-card p-6 rounded-xl border border-border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
          
          {/* فیلد آپلود فایل جایگزین input متنی شد */}
          <div>
            <label className="block text-slate-400 mb-2 text-sm">تصویر دسته‌بندی (اختیاری)</label>
            <label className="flex items-center justify-center w-full bg-background border border-border border-dashed rounded-lg p-3 text-muted-foreground hover:border-gold hover:text-gold cursor-pointer transition-colors relative">
              <UploadCloud className="size-5 ml-2" />
              <span className="text-sm truncate">
                {selectedImage ? selectedImage.name : "انتخاب فایل تصویر..."}
              </span>
              <input 
                type="file" 
                accept="image/*"
                disabled={isPending}
                className="hidden"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full sm:w-auto bg-gold text-[#0a0f1c] px-6 py-2 rounded-lg font-bold transition-all hover:bg-yellow-400 disabled:opacity-50"
        >
          {isPending ? 'در حال آپلود و ثبت...' : 'ذخیره دسته‌بندی جدید'}
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