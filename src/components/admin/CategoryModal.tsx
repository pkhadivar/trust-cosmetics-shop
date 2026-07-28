"use client";

import { useTransition, useState } from 'react';
import toast from 'react-hot-toast';
import { updateCategoryAction, deleteCategoryAction } from '@/actions/category';
import { uploadFilesAction } from '@/actions/upload'; // اکشن آپلود S3
import { UploadCloud, Trash2 } from 'lucide-react'; // آیکون‌ها

export default function CategoryModal({ category, isOpen, onClose }: any) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // استیت‌های مدیریت تصویر
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false); // آیا کاربر عکس قبلی را پاک کرده است؟

  if (!isOpen) return null;

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setSelectedImage(null);
    setRemoveExisting(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nameValue = formData.get('name') as string;
    
    if (!nameValue.trim()) {
      toast.error('نام دسته‌بندی نمی‌تواند خالی باشد');
      return;
    }

    startTransition(async () => {
      let finalImageUrl = category.imageUrl; // فرض اولیه: همان عکس قبلی باقی می‌ماند

      // اگر کاربر دکمه حذف عکس قبلی را زده باشد
      if (removeExisting) {
        finalImageUrl = null;
      }

      // اگر عکس جدیدی انتخاب شده باشد، آن را آپلود می‌کنیم
      if (selectedImage) {
        const uploadData = new FormData();
        uploadData.append("files", selectedImage);
        
        const uploadRes = await uploadFilesAction(uploadData);
        if (uploadRes.success && uploadRes.urls && uploadRes.urls.length > 0) {
          finalImageUrl = uploadRes.urls[0];
        } else {
          toast.error("خطا در آپلود تصویر جدید");
          return;
        }
      }

      // ارسال به دیتابیس با آدرس نهایی عکس
      const formData = new FormData();
      formData.set("name", nameValue);
      if (finalImageUrl) {
        formData.set("image", finalImageUrl);
      }
      
      // حالا فقط دو آرگومان می‌فرستیم
      const result = await updateCategoryAction(category.id, formData);
      if (result?.success !== false) {
        toast.success('دسته‌بندی با موفقیت ویرایش شد');
        handleClose();
      } else {
        toast.error(result?.error || 'خطا در ویرایش دسته‌بندی');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card p-6 rounded-2xl border border-border w-full max-w-md shadow-2xl">
        
        {!showDeleteConfirm ? (
          <>
            <h2 className="text-xl font-bold text-foreground mb-4">مدیریت: {category.name}</h2>
            
            <form onSubmit={handleSubmit}>
              
              <div className="mb-4">
                <label className="block text-slate-400 mb-2 text-xs font-bold">نام دسته‌بندی *</label>
                <input 
                  name="name" 
                  defaultValue={category.name} 
                  disabled={isPending}
                  className="w-full bg-background border border-border p-3 rounded-lg text-foreground focus:border-gold focus:outline-none transition-colors" 
                />
              </div>

              <div className="mb-8">
                <label className="block text-slate-400 mb-2 text-xs font-bold">تصویر دسته‌بندی (اختیاری)</label>
                
                {/* نمایش عکس قبلی (اگر وجود داشت و کاربر آن را پاک نکرده بود) */}
                {category.imageUrl && !removeExisting && !selectedImage && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20 mb-3">
                    <span className="text-sm text-foreground truncate" dir="ltr">
                      {category.imageUrl.substring(category.imageUrl.lastIndexOf('/') + 1)}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setRemoveExisting(true)}
                      className="text-red-500 hover:text-red-400 p-1 transition-colors"
                      title="حذف این تصویر"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}

                {/* دکمه آپلود فایل جدید */}
                {(!category.imageUrl || removeExisting || selectedImage) && (
                  <label className="flex items-center justify-center w-full bg-background border border-border border-dashed rounded-lg p-3 text-muted-foreground hover:border-gold hover:text-gold cursor-pointer transition-colors relative">
                    <UploadCloud className="size-5 ml-2" />
                    <span className="text-sm truncate">
                      {selectedImage ? selectedImage.name : "انتخاب تصویر جدید..."}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*"
                      disabled={isPending}
                      className="hidden"
                      onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
                
                {/* دکمه انصراف از آپلود عکس جدید */}
                {selectedImage && (
                  <div className="mt-2 text-right">
                    <button 
                      type="button" 
                      onClick={() => setSelectedImage(null)} 
                      className="text-xs text-red-500 hover:text-red-400 transition-colors"
                    >
                      حذف فایل انتخاب شده
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  type="submit" 
                  disabled={isPending} 
                  className="flex-1 bg-gold text-[#0a0f1c] px-4 py-2.5 rounded-xl font-bold disabled:opacity-50 transition-colors hover:bg-yellow-400 flex justify-center items-center"
                >
                  {isPending ? 'در حال آپلود و ذخیره...' : 'ذخیره تغییرات'}
                </button>
                <button 
                  type="button" 
                  disabled={isPending}
                  onClick={handleClose}
                  className="bg-secondary text-foreground hover:bg-secondary/80 px-4 py-2.5 rounded-xl font-medium transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-border/50 text-center">
              <button 
                type="button" 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
              >
                حذف کامل این دسته‌بندی
              </button>
            </div>
          </>
        ) : (
          <div className="text-center animate-fade-in py-4">
            <h2 className="text-2xl font-bold text-red-500 mb-4">حذف دسته‌بندی</h2>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              آیا از حذف دسته‌بندی <strong className="text-foreground">"{category.name}"</strong> مطمئن هستید؟<br/> این عملیات غیرقابل بازگشت است.
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
                className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2.5 rounded-xl font-bold flex-1 transition-all disabled:opacity-50"
              >
                {isPending ? 'در حال حذف...' : 'بله، حذف کن'}
              </button>
              <button 
                type="button" 
                disabled={isPending}
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-secondary text-foreground hover:bg-secondary/80 px-4 py-2.5 rounded-xl font-medium flex-1 transition-all"
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