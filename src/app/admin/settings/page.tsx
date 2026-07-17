"use client";

import { useState, useEffect, useTransition } from "react";
import { getStoreSettings, updateShippingCostAction } from "@/actions/settings";
import { Settings, Truck, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [shippingCost, setShippingCost] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getStoreSettings()
      .then((settings) => setShippingCost(settings.shippingCost.toString()))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const costNumber = parseInt(shippingCost, 10);

    if (isNaN(costNumber) || costNumber < 0) {
      toast.error("مبلغ وارد شده معتبر نیست.");
      return;
    }

    startTransition(async () => {
      const result = await updateShippingCostAction(costNumber);
      if (result.success) {
        toast.success("هزینه ارسال با موفقیت بروزرسانی شد.");
      } else {
        toast.error(result.error || "خطا در ذخیره‌سازی.");
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gold/10 rounded-xl">
          <Settings className="size-6 text-gold" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">تنظیمات فروشگاه</h1>
      </div>

      <div className="grid gap-6">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
            <Truck className="size-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">هزینه ارسال (پست)</h2>
          </div>
          
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="size-5 animate-spin" />
              <span>در حال دریافت اطلاعات...</span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 max-w-sm">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  مبلغ پایه هزینه پستی (تومان)
                </label>
                <input 
                  type="number" 
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  className="w-full p-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold transition-all"
                  required
                  min="0"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  این مبلغ برای سبدهای خرید کمتر از ۴ میلیون تومان محاسبه خواهد شد.
                </p>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-gold text-[#0a0f1c] hover:bg-yellow-500 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    در حال ذخیره
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    ذخیره تغییرات
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}