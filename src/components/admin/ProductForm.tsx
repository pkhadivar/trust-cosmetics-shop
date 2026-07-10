"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { createProductAction, updateProductAction } from "@/actions/product";

type Category = { id: string; name: string; };
type Tag = { id: string; name: string; }; // <--- تایپ تگ اضافه شد

type ProductFormProps = {
  categories: Category[];
  tags: Tag[]; // <--- پراپ تگ‌های موجود در دیتابیس
  initialData?: any; 
};

export default function ProductForm({ categories, tags, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [images, setImages] = useState<string[]>(
    initialData?.images && initialData.images.length > 0 ? initialData.images : [""]
  );

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };
  const addImageField = () => setImages([...images, ""]);
  const removeImageField = (index: number) => {
    if (images.length === 1) return setImages([""]);
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const validImages = images.filter((img) => img.trim() !== "");

    if (validImages.length === 0) {
      setError("لطفاً حداقل یک تصویر برای محصول وارد کنید.");
      return;
    }

    startTransition(async () => {
      let result;
      if (initialData) result = await updateProductAction(initialData.id, formData, validImages);
      else result = await createProductAction(formData, validImages);

      if (result?.success) router.push("/admin/products");
      else setError(result?.error || "خطایی رخ داد.");
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* اینپوت‌های نام، عنوان کوتاه، قیمت و تخفیف */}
        <div className="space-y-2"><label className="text-sm text-muted-foreground">نام محصول *</label><input name="title" required defaultValue={initialData?.title} className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 focus:border-gold focus:outline-none" /></div>
        <div className="space-y-2"><label className="text-sm text-muted-foreground">عنوان کوتاه</label><input name="subtitle" defaultValue={initialData?.subtitle} className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 focus:border-gold focus:outline-none" /></div>
        <div className="space-y-2"><label className="text-sm text-muted-foreground">قیمت *</label><input name="price" type="number" required defaultValue={initialData?.price} dir="ltr" className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-left focus:border-gold focus:outline-none" /></div>
        <div className="space-y-2"><label className="text-sm text-muted-foreground">قیمت با تخفیف</label><input name="discountedPrice" type="number" defaultValue={initialData?.discountedPrice} dir="ltr" className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-left focus:border-gold focus:outline-none" /></div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">دسته‌بندی *</label>
          <select name="categoryId" required defaultValue={initialData?.categoryId} className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 focus:border-gold focus:outline-none appearance-none">
            <option value="">انتخاب...</option>
            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>
        </div>
      </div>

      {/* بخش جدید چک‌باکس‌های تگ (چندگانه) */}
      <div className="space-y-3 rounded-2xl border border-border/40 bg-secondary/10 p-5 mt-4">
        <label className="text-sm font-bold text-foreground">برچسب‌های محصول (امکان انتخاب چندگانه)</label>
        <div className="flex flex-wrap gap-3 mt-2">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 cursor-pointer bg-secondary/40 px-4 py-2 rounded-xl border border-border hover:border-gold transition-colors">
              <input
                type="checkbox"
                name="tags" // ارسال آرایه در فرم‌دیتا
                value={tag.id}
                defaultChecked={initialData?.tags?.some((t: any) => t.id === tag.id)}
                className="size-4 accent-gold"
              />
              <span className="text-sm text-foreground">{tag.name}</span>
            </label>
          ))}
          {tags.length === 0 && <span className="text-xs text-muted-foreground">هیچ برچسبی در سیستم ثبت نشده است.</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border/40 bg-secondary/20 p-4 mt-4">
        <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" name="isAvailable" value="true" defaultChecked={initialData ? initialData.isAvailable : true} className="size-4 mt-1 accent-gold" /><div className="flex flex-col"><span className="text-sm font-medium">وضعیت موجودی</span><span className="text-xs text-muted-foreground">در انبار موجود و قابل سفارش</span></div></label>
        <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" name="isFeatured" value="true" defaultChecked={initialData ? initialData.isFeatured : false} className="size-4 mt-1 accent-gold" /><div className="flex flex-col"><span className="text-sm font-medium text-gold">محصول منتخب</span><span className="text-xs text-muted-foreground">نمایش در کلکسیون صفحه اصلی</span></div></label>
      </div>

      {/* تصاویر محصول */}
      <div className="space-y-4 rounded-2xl border border-border/60 bg-secondary/10 p-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-foreground">گالری تصاویر محصول *</label>
          <button type="button" onClick={addImageField} className="flex items-center gap-1.5 text-xs text-gold hover:text-yellow-400 transition-colors"><Plus className="size-4" />افزودن فیلد</button>
        </div>
        <div className="space-y-3">
          {images.map((img, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
              <input value={img} onChange={(e) => handleImageChange(index, e.target.value)} dir="ltr" className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm text-left focus:border-gold focus:outline-none" />
              <button type="button" onClick={() => removeImageField(index)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors bg-secondary/40 rounded-xl"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2"><label className="text-sm text-muted-foreground">توضیحات کامل محصول *</label><textarea name="description" required rows={6} defaultValue={initialData?.description} className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm focus:border-gold focus:outline-none resize-y" /></div>
      <button type="submit" disabled={isPending} className="w-full sm:w-auto px-8 py-3 bg-gold hover:bg-yellow-500 text-[#0a0f1c] font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">{isPending && <Loader2 className="size-4 animate-spin" />}{initialData ? "ذخیره تغییرات" : "ثبت محصول جدید"}</button>
    </form>
  );
}