"use client";

import { useState, useEffect, useTransition } from "react";
import { getStoreSettings, updateShippingCostAction, updateCampaignSettingsAction } from "@/actions/settings";
import { Settings, Truck, Loader2, Save, Megaphone } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // استیت‌های هزینه ارسال
  const [shippingCost, setShippingCost] = useState<string>("0");
  const [isPendingShipping, startTransitionShipping] = useTransition();

  // استیت‌های کمپین (بنر تخفیف)
  const [campaignIsActive, setCampaignIsActive] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignStartDate, setCampaignStartDate] = useState(""); // استیت جدید
  const [campaignEndDate, setCampaignEndDate] = useState(""); 
  const [isPendingCampaign, startTransitionCampaign] = useTransition();

  // تابع کمکی برای تبدیل تاریخ UTC دیتابیس به زمان محلی برای input
  const formatForInput = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  useEffect(() => {
    getStoreSettings()
      .then((settings: any) => {
        setShippingCost(settings.shippingCost?.toString() || "50000");
        setCampaignIsActive(settings.campaignIsActive || false);
        setCampaignTitle(settings.campaignTitle || "");
        
        if (settings.campaignStartDate) {
          setCampaignStartDate(formatForInput(settings.campaignStartDate));
        }
        
        if (settings.campaignEndDate) {
          setCampaignEndDate(formatForInput(settings.campaignEndDate));
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    const costNumber = parseInt(shippingCost, 10);
    if (isNaN(costNumber) || costNumber < 0) return toast.error("مبلغ وارد شده معتبر نیست.");

    startTransitionShipping(async () => {
      const result = await updateShippingCostAction(costNumber);
      if (result.success) toast.success("هزینه ارسال بروزرسانی شد.");
      else toast.error(result.error || "خطا در ذخیره‌سازی.");
    });
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (campaignIsActive && !campaignTitle) {
      return toast.error("برای فعال‌سازی کمپین، وارد کردن عنوان الزامی است.");
    }
    if (campaignIsActive && (!campaignStartDate || !campaignEndDate)) {
      return toast.error("لطفاً زمان شروع و پایان کمپین را مشخص کنید.");
    }

    // چک کردن اینکه تاریخ پایان بعد از تاریخ شروع باشد
    if (campaignIsActive && new Date(campaignStartDate) >= new Date(campaignEndDate)) {
      return toast.error("زمان پایان باید بعد از زمان شروع باشد.");
    }

    startTransitionCampaign(async () => {
      const result = await updateCampaignSettingsAction({
        campaignIsActive,
        campaignTitle: campaignTitle || null,
        campaignStartDate: campaignStartDate ? new Date(campaignStartDate) : null, // ارسال تاریخ شروع
        campaignEndDate: campaignEndDate ? new Date(campaignEndDate) : null,
      });

      if (result.success) toast.success("تنظیمات بنر جشنواره بروزرسانی شد.");
      else toast.error(result.error || "خطا در ذخیره‌سازی بنر.");
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gold">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gold/10 rounded-xl">
          <Settings className="size-6 text-gold" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">تنظیمات فروشگاه</h1>
      </div>

      {/* بخش تنظیمات هزینه ارسال */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        {/* ... (کد قبلی بدون تغییر) ... */}
        <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
          <Truck className="size-5 text-muted-foreground" />
          <h2 className="text-xl font-bold">هزینه ارسال (پست)</h2>
        </div>
        
        <form onSubmit={handleSaveShipping} className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">مبلغ پایه هزینه پستی (تومان)</label>
            <input 
              type="number" 
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              className="w-full p-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold transition-all"
              required
              min="0"
            />
          </div>
          <button type="submit" disabled={isPendingShipping} className="w-full h-12 bg-secondary text-foreground hover:bg-gold hover:text-[#0a0f1c] rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {isPendingShipping ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} ذخیره هزینه پست
          </button>
        </form>
      </div>

      {/* بخش تنظیمات بنر جشنواره */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <Megaphone className="size-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">بنر جشنواره تخفیف (بالای سایت)</h2>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={campaignIsActive} onChange={(e) => setCampaignIsActive(e.target.checked)} />
            <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            <span className="mr-3 text-sm font-medium text-foreground">{campaignIsActive ? "آماده‌سازی" : "غیرفعال"}</span>
          </label>
        </div>
        
        <form onSubmit={handleSaveCampaign} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-foreground">عنوان جشنواره</label>
            <input 
              type="text" 
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              placeholder="مثال: تخفیف‌های شگفت‌انگیز تابستانه!"
              className="w-full p-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold transition-all"
              disabled={!campaignIsActive}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">تاریخ و ساعت شروع جشنواره</label>
            <input 
              type="datetime-local" 
              value={campaignStartDate}
              onChange={(e) => setCampaignStartDate(e.target.value)}
              className="w-full p-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold transition-all text-left"
              dir="ltr"
              disabled={!campaignIsActive}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">تاریخ و ساعت پایان جشنواره</label>
            <input 
              type="datetime-local" 
              value={campaignEndDate}
              onChange={(e) => setCampaignEndDate(e.target.value)}
              className="w-full p-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold transition-all text-left"
              dir="ltr"
              disabled={!campaignIsActive}
            />
          </div>

          <div className="md:col-span-2 flex justify-end mt-2">
            <button type="submit" disabled={isPendingCampaign} className="px-8 h-12 bg-gold text-[#0a0f1c] hover:bg-yellow-500 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {isPendingCampaign ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} ذخیره تنظیمات جشنواره
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}