"use client";

import { useState, useTransition } from 'react';
import { deleteProductAction } from '@/actions/product';
import toast from 'react-hot-toast';

export default function DeleteProductButton({ id, title }: { id: string, title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (result.success) {
        toast.success('محصول با موفقیت حذف شد');
      } else {
        toast.error(result.error || 'خطا در حذف محصول');
      }
      setIsOpen(false);
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-red-400 hover:text-red-300 text-sm transition-colors"
      >
        حذف
      </button>

      {/* مودال تایید حذف */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-2xl border border-border w-96 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">حذف محصول</h2>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
              آیا از حذف محصول <strong className="text-gold">"{title}"</strong> مطمئن هستید؟ این عملیات غیرقابل بازگشت است.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={handleDelete}
                disabled={isPending}
                className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-medium flex-1 transition-all"
              >
                {isPending ? 'در حال حذف...' : 'بله، حذف کن'}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="bg-slate-700 text-white hover:bg-slate-600 px-4 py-2 rounded-lg font-medium flex-1 transition-all"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}