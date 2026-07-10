"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { createTagAction } from "@/actions/tag";

export default function CreateTagForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createTagAction(formData);
      if (result.success) {
        formRef.current?.reset(); // پاک کردن فرم بعد از ثبت موفق
      } else {
        setError(result.error || "خطایی رخ داد.");
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex-1 w-full relative">
        <input
          type="text"
          name="name"
          required
          placeholder="نام برچسب جدید (مثال: پیشنهاد ویژه)"
          className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-[#0a0f1c] transition-colors hover:bg-yellow-500 disabled:opacity-50 w-full sm:w-auto"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        افزودن برچسب
      </button>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </form>
  );
}