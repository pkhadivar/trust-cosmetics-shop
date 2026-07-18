"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";

interface CampaignBannerProps {
  title: string;
  endDate: Date;
  link: string;
}

export function CampaignBanner({ title, endDate, link }: CampaignBannerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isActive, setIsActive] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const target = new Date(endDate).getTime();
    
    if (target > new Date().getTime()) {
      setIsActive(true);
    }
    
    setIsMounted(true);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsActive(false);
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  if (!isActive) return null;

  return (
    <div 
      className={`bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 sticky top-0 z-[100] shadow-sm w-full transition-all duration-500 origin-top overflow-hidden border-b border-yellow-600/30 ${
        isMounted ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 h-0"
      }`}
    >
      <Link 
        href={link} 
        className="block relative max-w-7xl mx-auto px-4 py-2.5 sm:py-3 transition-all hover:opacity-90"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8">
          
          {/* بخش عنوان جشنواره */}
          <div className="flex items-center gap-2 text-[#0a0f1c]">
            <Gift className="size-5 animate-bounce" />
            <span className="font-extrabold text-sm md:text-base">
              {title}
            </span>
          </div>

          {/* بخش تایمر شمارش معکوس - تراز شده با items-start */}
          <div className="flex items-start gap-1.5" dir="ltr">
            <TimeBox value={timeLeft.days} label="روز" />
            <span className="text-[#0a0f1c]/40 font-black text-lg mt-0.5">:</span>
            <TimeBox value={timeLeft.hours} label="ساعت" />
            <span className="text-[#0a0f1c]/40 font-black text-lg mt-0.5">:</span>
            <TimeBox value={timeLeft.minutes} label="دقیقه" />
            <span className="text-[#0a0f1c]/40 font-black text-lg mt-0.5">:</span>
            <TimeBox value={timeLeft.seconds} label="ثانیه" />
          </div>

          {/* دکمه ظریف‌تر و یکپارچه‌تر با طراحی */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#0a0f1c]/10 border border-[#0a0f1c]/20 text-[#0a0f1c] hover:bg-[#0a0f1c] hover:text-gold transition-colors px-5 py-1.5 rounded-full text-xs font-bold">
            مشاهده محصولات
            <ArrowLeft className="size-3.5" />
          </div>

        </div>
      </Link>
    </div>
  );
}

// سایز باکس‌ها کمی کوچک‌تر و ظریف‌تر شد
function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="bg-[#0a0f1c] text-gold w-9 h-9 flex items-center justify-center rounded-lg font-mono font-bold text-base shadow-sm">
        {value.toString().padStart(2, "0")}
      </div>
      <span className="text-[#0a0f1c] text-[10px] font-bold opacity-80">{label}</span>
    </div>
  );
}