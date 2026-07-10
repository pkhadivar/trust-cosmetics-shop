"use client";

import { useTransition, useState } from 'react';
import toast from 'react-hot-toast';
import { updateCategoryAction, deleteCategoryAction } from '@/actions/category';

export default function CategoryModal({ category, isOpen, onClose }: any) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-2xl border border-border w-96 shadow-2xl">
        
        {!showDeleteConfirm ? (
          <>
            <h2 className="text-xl font-bold text-foreground mb-4">مدیریت: {category.name}</h2>
            
            <form action={async (formData) => {
              const nameValue = formData.get('name') as string;
              const imageValue = formData.get('imageUrl') as string || null; // دریافت لینک تصویر
              
              if (!nameValue.trim()) {
                toast.error('نام دسته‌بندی نمی‌تواند خالی باشد');
                return;
              }

              startTransition(async () => {
                // ارسال مقادیر آپدیت‌شده به اکشن سرور
                const result = await updateCategoryAction(category.id, nameValue, imageValue);
                if (result?.success !== false) {
                  toast.success('دسته‌بندی با موفقیت ویرایش شد');
                  handleClose();
                } else {
                  toast.error(result?.error || 'خطا در ویرایش دسته‌بندی');
                }
              });
            }}>
              
              <div className="mb-4">
                <label className="block text-slate-400 mb-1 text-xs">نام دسته‌بندی *</label>
                <input 
                  name="name" 
                  defaultValue={category.name} 
                  disabled={isPending}
                  className="w-full bg-background border border-border p-3 rounded-lg text-foreground focus:border-gold focus:outline-none transition-colors" 
                />
              </div>

              <div className="mb-6">
                <label className="block text-slate-400 mb-1 text-xs">لینک تصویر (اختیاری)</label>
                <input 
                  name="imageUrl" 
                  defaultValue={category.imageUrl || ''} 
                  disabled={isPending}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-background border border-border p-3 rounded-lg text-foreground focus:border-gold focus:outline-none transition-colors text-left" 
                  dir="ltr"
                />
              </div>
              
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={isPending} 
                  className="flex-1 bg-gold text-[#0a0f1c] px-4 py-2 rounded-lg font-bold disabled:opacity-50 transition-colors hover:bg-yellow-400"
                >
                  {isPending ? 'در حال ذخیره...' : 'ذخیره'}
                </button>
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="bg-slate-700 text-white hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-border">
              <button 
                type="button" 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400 hover:text-red-300 w-full text-sm transition-colors"
              >
                حذف این دسته‌بندی
              </button>
            </div>
          </>
        ) : (
          <div className="text-center animate-fade-in">
            <h2 className="text-xl font-bold text-red-400 mb-4">حذف دسته‌بندی</h2>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
              آیا از حذف دسته‌بندی <strong className="text-gold">"{category.name}"</strong> مطمئن هستید؟ این عملیات غیرقابل بازگشت است.
            </p>
            
            <form action={async () => {
              startTransition(async () => {
                const result = await deleteCategoryAction(category.id);
                if (result?.success !== false) {
                  toast.success('دسته‌بندی با موفقیت حذف شد');
                  handleClose();
                } else {
                  toast.error(result?.error || 'خطا در حذف دسته‌بندی');
                }
              });
            }} className="flex gap-3">
              <button 
                type="submit" 
                disabled={isPending}
                className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-medium flex-1 transition-all disabled:opacity-50"
              >
                {isPending ? 'در حال حذف...' : 'بله، حذف کن'}
              </button>
              <button 
                type="button" 
                disabled={isPending}
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-slate-700 text-white hover:bg-slate-600 px-4 py-2 rounded-lg font-medium flex-1 transition-all"
              >
                انصراف
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}