"use client";

import { useState, useTransition } from "react";
import { createBrand, updateBrand, deleteBrand } from "@/actions/brand";
import { uploadFilesAction } from "@/actions/upload";
import { Loader2, Trash2, Edit2, AlertCircle } from "lucide-react";
import { getMediaUrl } from "@/utils/media"; // 👈 اضافه کردن تابع هلپر

export function BrandManager({ brands }: { brands: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<any | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    startTransition(async () => {
      try {
        let finalLogoUrl = editingBrand ? editingBrand.logo : null;

        if (selectedFile) {
          const imageUploadData = new FormData();
          imageUploadData.append("files", selectedFile);

          const uploadRes = await uploadFilesAction(imageUploadData);
          if (
            uploadRes.success &&
            uploadRes.urls &&
            uploadRes.urls.length > 0
          ) {
            finalLogoUrl = uploadRes.urls[0];
          } else {
            throw new Error(uploadRes.error || "خطا در آپلود لوگو");
          }
        }

        if (finalLogoUrl) {
          formData.set("logo", finalLogoUrl);
        }

        let res;
        if (editingBrand) {
          res = await updateBrand(editingBrand.id, formData);
        } else {
          res = await createBrand(formData);
        }

        if (res.success) {
          formElement.reset();
          setSelectedFile(null);
          setEditingBrand(null);
        } else {
          setError(res.error || "خطایی رخ داد.");
        }
      } catch (err: any) {
        setError(err.message || "خطا در برقراری ارتباط با سرور");
      }
    });
  };

  const handleEditClick = (brand: any) => {
    setEditingBrand(brand);
    setError(null);
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingBrand(null);
    setError(null);
    setSelectedFile(null);
  };

  async function confirmDelete() {
    if (!brandToDelete) return;

    startTransition(async () => {
      const res = await deleteBrand(brandToDelete.id);
      if (!res.success) {
        alert(res.error);
      }
      setBrandToDelete(null);
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
      {/* مودال تایید حذف */}
      {brandToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                <AlertCircle className="size-6" />
              </div>
              <h3 className="text-lg font-bold">حذف برند</h3>
              <p className="text-sm text-muted-foreground">
                آیا از حذف برند «
                <span className="text-foreground font-bold">
                  {brandToDelete.name}
                </span>
                » اطمینان دارید؟ این عمل غیرقابل بازگشت است.
              </p>
              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setBrandToDelete(null)}
                  disabled={isPending}
                  className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isPending}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  حذف قطعی
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* فرم ثبت / ویرایش */}
      <div
        className={`bg-card border p-5 rounded-2xl md:col-span-1 h-fit transition-colors ${editingBrand ? "border-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]" : "border-border"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            {editingBrand ? "ویرایش برند" : "افزودن برند جدید"}
          </h2>
          {editingBrand && (
            <button
              onClick={cancelEdit}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              انصراف از ویرایش
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div key={editingBrand ? editingBrand.id : "new"}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  نام برند *
                </label>
                <input
                  name="name"
                  defaultValue={editingBrand?.name || ""}
                  required
                  placeholder="مثال: تراست اسلیم"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  اسلاگ (انگلیسی) *
                </label>
                <input
                  name="slug"
                  defaultValue={editingBrand?.slug || ""}
                  required
                  placeholder="مثال: trust-slim"
                  dir="ltr"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  تصویر لوگو {editingBrand && "(اختیاری - برای تغییر عکس قبلی)"}
                </label>
                {editingBrand?.logo && !selectedFile && (
                  <div className="mb-2 p-2 border border-border rounded-lg bg-background/50 flex items-center gap-3">
                    {/* 👈 استفاده از getMediaUrl برای پیش‌نمایش لوگوی فعلی */}
                    <img
                      src={getMediaUrl(editingBrand.logo)}
                      alt="Current logo"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-xs text-muted-foreground">
                      لوگوی فعلی
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0])
                      setSelectedFile(e.target.files[0]);
                  }}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none file:bg-gold file:text-[#0a0f1c] file:border-0 file:px-3 file:py-1 file:mr-2 file:rounded-md file:cursor-pointer file:font-medium"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  توضیحات (اختیاری)
                </label>
                <textarea
                  name="description"
                  defaultValue={editingBrand?.description || ""}
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-gold focus:outline-none resize-y"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gold hover:bg-yellow-500 text-[#0a0f1c] font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending
                ? "در حال پردازش..."
                : editingBrand
                  ? "ذخیره تغییرات"
                  : "ثبت برند"}
            </button>
          </div>
        </form>
      </div>

      {/* لیست برندها */}
      <div className="bg-card border border-border p-5 rounded-2xl md:col-span-2">
        <h2 className="text-lg font-bold mb-4">
          برندهای ثبت شده ({brands.length})
        </h2>

        {brands.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            هنوز هیچ برندی ثبت نشده است.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 rounded-r-lg font-medium">
                    نام برند
                  </th>
                  <th className="px-4 py-3 font-medium">اسلاگ</th>
                  <th className="px-4 py-3 font-medium text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {brands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-3">
                        {brand.logo ? (
                          /* 👈 استفاده از getMediaUrl برای تصویر جدول */
                          <img
                            src={getMediaUrl(brand.logo)}
                            alt={brand.name}
                            className="w-8 h-8 rounded-full object-cover border border-border bg-background"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border border-border">
                            {brand.name.substring(0, 2)}
                          </div>
                        )}
                        {brand.name}
                      </div>
                    </td>
                    <td className="px-4 py-3" dir="ltr">
                      {brand.slug}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(brand)}
                          className="text-blue-400 hover:text-blue-300 font-medium text-xs px-2 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="size-3" />
                        </button>
                        <button
                          onClick={() => setBrandToDelete(brand)}
                          className="text-red-500 hover:text-red-400 font-medium text-xs px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
