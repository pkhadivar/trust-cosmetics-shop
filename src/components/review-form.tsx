"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { submitReviewAction } from "@/actions/review";

export function ReviewForm({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    
    const formData = new FormData(e.currentTarget);
    const formElement = e.currentTarget;

    startTransition(async () => {
      const result = await submitReviewAction(productId, formData);
      
      if (result.success) {
        setStatus({ type: 'success', message: 'نظر شما با موفقیت ثبت شد و پس از تایید مدیریت نمایش داده خواهد شد.' });
        formElement.reset(); // پاک کردن فرم بعد از موفقیت
      } else {
        setStatus({ type: 'error', message: result.error || 'خطایی رخ داد.' });
      }
    });
  };

  return (
    <div className="bg-secondary/10 border border-border/50 rounded-2xl p-6 mt-8">
      <h4 className="text-lg font-bold text-foreground mb-4">ثبت نظر جدید</h4>
      
      {status.type === 'success' && (
        <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
          {status.message}
        </div>
      )}

      {status.type === 'error' && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {status.message}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">نام شما</label>
          <input 
            name="userName" 
            required 
            placeholder="مثال: ساناز محمدی"
            className="w-full md:w-1/2 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm focus:border-gold focus:outline-none" 
          />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">متن نظر</label>
          <textarea 
            name="text" 
            required 
            rows={4}
            placeholder="تجربه استفاده خود از این محصول را بنویسید..."
            className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm focus:border-gold focus:outline-none resize-y" 
          />
        </div>
        <button 
          type="submit" 
          disabled={isPending} 
          className="px-8 py-2.5 bg-gold hover:bg-yellow-500 text-[#0a0f1c] font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          ارسال نظر
        </button>
      </form>
    </div>
  );
}