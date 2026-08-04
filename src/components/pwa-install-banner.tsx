"use client";

import { useState, useEffect } from "react";
import { X, DownloadCloud } from "lucide-react";
import Image from "next/image";

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // گرفتن رویداد نصب از مرورگر
    const handler = (e: Event) => {
      e.preventDefault(); // جلوگیری از نمایش پاپ‌آپ پیش‌فرض زشت مرورگر
      setDeferredPrompt(e); // ذخیره رویداد برای دکمه خودمان
      setIsVisible(true); // نمایش بنر اختصاصی
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // اجرای رویداد نصب
    deferredPrompt.prompt();
    
    // منتظر می‌مانیم تا کاربر دکمه نصب یا لغو را بزند
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsVisible(false); // اگر نصب کرد، بنر را ببند
    }
    
    // پاک کردن رویداد
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="mx-auto max-w-md bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
        
        {/* آیکون و متن */}
        <div className="flex items-center gap-3">
          <div className="size-12 shrink-0 bg-[#0a0f1c] rounded-xl flex items-center justify-center border border-gold/20 overflow-hidden relative">
             <Image 
               src="/icon-192x192.png" 
               alt="TRUST App" 
               fill 
               className="object-cover"
             />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              نصب اپلیکیشن تراست
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              تجربه خرید سریع‌تر و راحت‌تر
            </span>
          </div>
        </div>

        {/* دکمه‌ها */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 bg-gold text-[#0a0f1c] hover:bg-yellow-500 transition-colors px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
          >
            <DownloadCloud className="size-4" />
            نصب
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
            aria-label="بستن"
          >
            <X className="size-4" />
          </button>
        </div>

      </div>
    </div>
  );
}