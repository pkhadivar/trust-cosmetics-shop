"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";

interface CampaignBannerProps {
  title: string;
  startDate: Date; // Added startDate
  endDate: Date;
  link: string;
}

export function CampaignBanner({ title, startDate, endDate, link }: CampaignBannerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Convert target dates to timestamps
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const checkTimeAndCountdown = () => {
      const now = new Date().getTime();

      // Check if current time is between start and end
      if (now >= start && now < end) {
        setIsVisible(true);
        const difference = end - now;

        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        // Hide if the time hasn't started yet, or if it has passed
        setIsVisible(false);
      }

      // If the time has passed the end date, tell the interval to stop
      if (now >= end) {
        return true; 
      }
      return false;
    };

    // Run immediately on mount
    const isEnded = checkTimeAndCountdown();

    // If it hasn't ended completely, set up the interval to check every second
    if (!isEnded) {
      const interval = setInterval(() => {
        const hasEnded = checkTimeAndCountdown();
        if (hasEnded) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startDate, endDate]);

  if (!isVisible) return null;

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

          {/* بخش تایمر شمارش معکوس */}
          <div className="flex items-start gap-1.5" dir="ltr">
            <TimeBox value={timeLeft.days} label="روز" />
            <span className="text-[#0a0f1c]/40 font-black text-lg mt-0.5">:</span>
            <TimeBox value={timeLeft.hours} label="ساعت" />
            <span className="text-[#0a0f1c]/40 font-black text-lg mt-0.5">:</span>
            <TimeBox value={timeLeft.minutes} label="دقیقه" />
            <span className="text-[#0a0f1c]/40 font-black text-lg mt-0.5">:</span>
            <TimeBox value={timeLeft.seconds} label="ثانیه" />
          </div>

          {/* دکمه */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#0a0f1c]/10 border border-[#0a0f1c]/20 text-[#0a0f1c] hover:bg-[#0a0f1c] hover:text-gold transition-colors px-5 py-1.5 rounded-full text-xs font-bold">
            مشاهده محصولات
            <ArrowLeft className="size-3.5" />
          </div>

        </div>
      </Link>
    </div>
  );
}

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