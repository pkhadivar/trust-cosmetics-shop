"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Video, Image as ImageIcon, UploadCloud, Link as LinkIcon } from "lucide-react";
import { createProductAction, updateProductAction } from "@/actions/product";
import { uploadFilesAction } from "@/actions/upload";

type Category = { id: string; name: string; };
type Tag = { id: string; name: string; };
type Brand = { id: string; name: string; }; // 👈 تایپ برند اضافه شد

type ProductFormProps = {
  categories: Category[];
  tags: Tag[];
  brands: Brand[]; // 👈 پراپ برندها اضافه شد
  initialData?: any;
};

export default function ProductForm({ categories, tags, brands, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.images?.length ? initialData.images : []
  );

  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>(
    initialData?.videoUrls?.length ? initialData.videoUrls : []
  );
  
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>(
    initialData?.attributes?.length ? initialData.attributes : [{ key: "", value: "" }]
  );
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(
    initialData?.faqs?.length ? initialData.faqs : [{ question: "", answer: "" }]
  );

  const removeSelectedImage = (index: number) => setSelectedImages(selectedImages.filter((_, i) => i !== index));
  const removeExistingImage = (index: number) => setExistingImages(existingImages.filter((_, i) => i !== index));

  const removeSelectedVideo = (index: number) => setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
  const removeExistingVideo = (index: number) => setExistingVideos(existingVideos.filter((_, i) => i !== index));

  const addAttributeField = () => setAttributes([...attributes, { key: "", value: "" }]);
  const removeAttributeField = (index: number) => setAttributes(attributes.filter((_, i) => i !== index));
  const handleAttributeChange = (index: number, field: "key" | "value", val: string) => {
    const newAttr = [...attributes];
    newAttr[index][field] = val;
    setAttributes(newAttr);
  };

  const addFaqField = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaqField = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));
  const handleFaqChange = (index: number, field: "question" | "answer", val: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = val;
    setFaqs(newFaqs);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formElement = e.currentTarget;
    const mainFormData = new FormData(formElement);

    // 🌟 تغییری که اضافه شد: ثبت اجباری وضعیت چک‌باکس‌ها در فرم دیتا
    const isAvailableInput = formElement.querySelector('input[name="isAvailable"]') as HTMLInputElement;
    mainFormData.set("isAvailable", isAvailableInput?.checked ? "true" : "false");

    const isFeaturedInput = formElement.querySelector('input[name="isFeatured"]') as HTMLInputElement;
    mainFormData.set("isFeatured", isFeaturedInput?.checked ? "true" : "false");
    // -------------------------------------------------------------

    if (existingImages.length === 0 && selectedImages.length === 0) {
      setError("لطفاً حداقل یک فایل تصویر برای محصول انتخاب کنید.");
      return;
    }

    startTransition(async () => {
      try {
        let finalImageUrls = [...existingImages];
        let finalVideoUrls = [...existingVideos];

        if (selectedImages.length > 0) {
          const imageUploadData = new FormData();
          selectedImages.forEach((file) => imageUploadData.append("files", file));
          
          const imgUploadRes = await uploadFilesAction(imageUploadData);
          if (imgUploadRes.success && imgUploadRes.urls) {
            finalImageUrls = [...finalImageUrls, ...imgUploadRes.urls];
          } else {
            throw new Error(imgUploadRes.error || "خطا در آپلود تصاویر");
          }
        }

        if (selectedVideos.length > 0) {
          const videoUploadData = new FormData();
          selectedVideos.forEach((file) => videoUploadData.append("files", file));
          
          const vidUploadRes = await uploadFilesAction(videoUploadData);
          if (vidUploadRes.success && vidUploadRes.urls) {
            finalVideoUrls = [...finalVideoUrls, ...vidUploadRes.urls];
          } else {
            throw new Error(vidUploadRes.error || "خطا در آپلود ویدیوها");
          }
        }

        const validAttributes = attributes.filter(a => a.key.trim() !== "" && a.value.trim() !== "");
        const validFaqs = faqs.filter(f => f.question.trim() !== "" && f.answer.trim() !== "");

        mainFormData.append("attributes", JSON.stringify(validAttributes));
        mainFormData.append("faqs", JSON.stringify(validFaqs));

        let result;
        if (initialData) {
          result = await updateProductAction(initialData.id, mainFormData, finalImageUrls, finalVideoUrls);
        } else {
          result = await createProductAction(mainFormData, finalImageUrls, finalVideoUrls);
        }

        if (result?.success) {
          router.push("/admin/products");
        } else {
          setError(result?.error || "خطایی رخ داد.");
        }
      } catch (err: any) {
        setError(err.message || "خطا در برقراری ارتباط با سرور آپلود");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2"><label className="text-sm text-muted-foreground">نام محصول *</label><input name="title" required defaultValue={initialData?.title} className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 focus:border-gold focus:outline-none" /></div>
        <div className="space-y-2"><label className="text-sm text-muted-foreground">عنوان کوتاه</label><input name="subtitle" defaultValue={initialData?.subtitle} className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 focus:border-gold focus:outline-none" /></div>
        <div className="space-y-2"><label className="text-sm text-muted-foreground">قیمت (تومان) *</label><input name="price" type="number" required defaultValue={initialData?.price} dir="ltr" className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-left focus:border-gold focus:outline-none" /></div>
        <div className="space-y-2"><label className="text-sm text-muted-foreground">قیمت با تخفیف</label><input name="discountedPrice" type="number" defaultValue={initialData?.discountedPrice} dir="ltr" className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-left focus:border-gold focus:outline-none" /></div>
        
        {/* فیلد دسته‌بندی */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">دسته‌بندی *</label>
          <select name="categoryId" required defaultValue={initialData?.categoryId} className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 focus:border-gold focus:outline-none appearance-none">
            <option value="">انتخاب دسته‌بندی...</option>
            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>
        </div>

        {/* 🌟 فیلد برند (جدید) */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">برند (اختیاری)</label>
          <select name="brandId" defaultValue={initialData?.brandId || ""} className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 focus:border-gold focus:outline-none appearance-none">
            <option value="">بدون برند</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>

        {/* فیلد لینک مرجع لیا تیم */}
        <div className="space-y-2 md:col-span-2">
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <LinkIcon className="size-4 text-gold" />
            لینک سایت لیا تیم (جهت آپدیت قیمت)
          </label>
          <input 
            name="referenceUrl" 
            type="url" 
            dir="ltr" 
            placeholder="https://liateam.ir/products/..."
            defaultValue={initialData?.referenceUrl} 
            className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-left focus:border-gold focus:outline-none" 
          />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-border/40 bg-secondary/10 p-5">
        <label className="text-sm font-bold text-foreground">برچسب‌های محصول</label>
        <div className="flex flex-wrap gap-3 mt-2">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 cursor-pointer bg-secondary/40 px-4 py-2 rounded-xl border border-border hover:border-gold transition-colors">
              <input type="checkbox" name="tags" value={tag.id} defaultChecked={initialData?.tags?.some((t: any) => t.id === tag.id)} className="size-4 accent-gold" />
              <span className="text-sm text-foreground">{tag.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border/40 bg-secondary/20 p-4">
        <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" name="isAvailable" value="true" defaultChecked={initialData ? initialData.isAvailable : true} className="size-4 mt-1 accent-gold" /><div className="flex flex-col"><span className="text-sm font-medium">وضعیت موجودی</span><span className="text-xs text-muted-foreground">در انبار موجود و قابل سفارش</span></div></label>
        <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" name="isFeatured" value="true" defaultChecked={initialData ? initialData.isFeatured : false} className="size-4 mt-1 accent-gold" /><div className="flex flex-col"><span className="text-sm font-medium text-gold">محصول منتخب</span><span className="text-xs text-muted-foreground">نمایش در هدر صفحه اصلی</span></div></label>
      </div>

      <div className="space-y-6 rounded-2xl border border-border/60 bg-secondary/10 p-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
            <ImageIcon className="size-4 text-gold" /> گالری تصاویر محصول *
          </label>
          <label className="flex flex-col items-center justify-center w-full bg-background border-2 border-border border-dashed rounded-xl p-8 hover:border-gold hover:bg-gold/5 cursor-pointer transition-colors">
            <UploadCloud className="size-8 text-muted-foreground mb-2" />
            <span className="text-sm font-medium text-foreground">برای انتخاب عکس‌های محصول کلیک کنید</span>
            <input 
              type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files) setSelectedImages((prev) => [...prev, ...Array.from(e.target.files!)]); }}
            />
          </label>
          <div className="mt-4 space-y-2">
            {existingImages.map((url, idx) => (
              <div key={`exist-${idx}`} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                <span className="text-sm text-foreground truncate" dir="ltr">{url.substring(url.lastIndexOf('/') + 1)} (موجود)</span>
                <button type="button" onClick={() => removeExistingImage(idx)} className="text-red-500 hover:text-red-400 p-1"><Trash2 className="size-4" /></button>
              </div>
            ))}
            {selectedImages.map((file, idx) => (
              <div key={`new-${idx}`} className="flex items-center justify-between p-3 rounded-lg border border-gold/30 bg-gold/5">
                <div className="flex items-center gap-2"><span className="text-xs bg-gold text-[#0a0f1c] px-2 py-0.5 rounded font-bold">جدید</span><span className="text-sm text-foreground truncate" dir="ltr">{file.name}</span></div>
                <button type="button" onClick={() => removeSelectedImage(idx)} className="text-red-500 hover:text-red-400 p-1"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-border/40" />

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
            <Video className="size-4 text-gold" /> گالری ویدیوهای محصول (اختیاری)
          </label>
          <label className="flex flex-col items-center justify-center w-full bg-background border-2 border-border border-dashed rounded-xl p-6 hover:border-gold hover:bg-gold/5 cursor-pointer transition-colors">
            <span className="text-sm font-medium text-foreground">برای انتخاب فایل‌های ویدیو کلیک کنید</span>
            <input 
              type="file" accept="video/mp4,video/webm" multiple className="hidden"
              onChange={(e) => { if (e.target.files) setSelectedVideos((prev) => [...prev, ...Array.from(e.target.files!)]); }}
            />
          </label>
          <div className="mt-4 space-y-2">
            {existingVideos.map((url, idx) => (
              <div key={`exist-vid-${idx}`} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                <span className="text-sm text-foreground truncate" dir="ltr">{url.substring(url.lastIndexOf('/') + 1)} (موجود)</span>
                <button type="button" onClick={() => removeExistingVideo(idx)} className="text-red-500 hover:text-red-400 p-1"><Trash2 className="size-4" /></button>
              </div>
            ))}
            {selectedVideos.map((file, idx) => (
              <div key={`new-vid-${idx}`} className="flex items-center justify-between p-3 rounded-lg border border-gold/30 bg-gold/5">
                <div className="flex items-center gap-2"><span className="text-xs bg-gold text-[#0a0f1c] px-2 py-0.5 rounded font-bold">جدید</span><span className="text-sm text-foreground truncate" dir="ltr">{file.name}</span></div>
                <button type="button" onClick={() => removeSelectedVideo(idx)} className="text-red-500 hover:text-red-400 p-1"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 bg-secondary/10 p-5">
        <div className="flex items-center justify-between"><label className="text-sm font-bold text-foreground">جدول مشخصات فنی</label><button type="button" onClick={addAttributeField} className="flex items-center gap-1.5 text-xs text-gold hover:text-yellow-400 transition-colors"><Plus className="size-4" />افزودن ویژگی</button></div>
        <div className="space-y-3">
          {attributes.map((attr, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center gap-3">
              <input placeholder="حجم" value={attr.key} onChange={(e) => handleAttributeChange(index, "key", e.target.value)} className="w-full sm:w-1/3 rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-gold focus:outline-none" />
              <input placeholder="۵۰ میلی‌لیتر" value={attr.value} onChange={(e) => handleAttributeChange(index, "value", e.target.value)} className="w-full sm:flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-gold focus:outline-none" />
              <button type="button" onClick={() => removeAttributeField(index)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors bg-secondary/40 rounded-xl"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 bg-secondary/10 p-5">
        <div className="flex items-center justify-between"><label className="text-sm font-bold text-foreground">سوالات متداول (FAQ)</label><button type="button" onClick={addFaqField} className="flex items-center gap-1.5 text-xs text-gold hover:text-yellow-400 transition-colors"><Plus className="size-4" />افزودن سوال</button></div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 bg-background/50 relative">
               <button type="button" onClick={() => removeFaqField(index)} className="absolute top-2 left-2 p-1.5 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="size-4" /></button>
               <input placeholder="صورت سوال..." value={faq.question} onChange={(e) => handleFaqChange(index, "question", e.target.value)} className="w-full pr-8 rounded-lg border-b border-border/50 bg-transparent px-2 py-1 text-sm focus:border-gold focus:outline-none font-medium" />
               <textarea placeholder="پاسخ سوال..." value={faq.answer} onChange={(e) => handleFaqChange(index, "answer", e.target.value)} rows={2} className="w-full rounded-lg border-none bg-transparent px-2 py-1 text-sm focus:border-gold focus:outline-none resize-y text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground font-bold">توضیحات کوتاه (ویژگی‌های کلیدی) *</label>
            <textarea name="description" required rows={4} defaultValue={initialData?.description} className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm focus:border-gold focus:outline-none resize-y leading-relaxed" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground font-bold">توضیحات کامل محصول</label>
            <textarea name="richDescription" rows={10} defaultValue={initialData?.richDescription} className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm focus:border-gold focus:outline-none resize-y leading-relaxed" />
          </div>
      </div>

      <button type="submit" disabled={isPending} className="w-full sm:w-auto px-8 py-3 bg-gold hover:bg-yellow-500 text-[#0a0f1c] font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "در حال آپلود و ذخیره..." : (initialData ? "ذخیره تغییرات محصول" : "ثبت محصول جدید")}
      </button>
    </form>
  );
}