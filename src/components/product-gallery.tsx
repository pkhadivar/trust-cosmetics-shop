"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductGalleryProps = {
  images: string[];
  title: string;
};

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const frames = images.length > 0 ? images : ["/placeholder.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % frames.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + frames.length) % frames.length);

  // منطق Swipe برای موبایل و دسکتاپ
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startX.current = clientX;
  };

  const handleEnd = (clientX: number) => {
    if (!isDragging) return;
    setIsDragging(false);
    const diffX = startX.current - clientX;
    
    // اگر کاربر بیشتر از 50 پیکسل کشید، عکس عوض شود
    if (diffX > 50) nextImage();
    else if (diffX < -50) prevImage();
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
      {/* عکس اصلی */}
      <div 
        className="relative aspect-square w-full rounded-3xl bg-[#050810] border border-border/40 flex items-center justify-center p-6 cursor-grab active:cursor-grabbing overflow-hidden group shadow-2xl"
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseUp={(e) => handleEnd(e.clientX)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}
      >
        {/* 🌟 هاله نور محو در پس‌زمینه برای برجسته کردن محصول */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] h-[65%] bg-gold/5 rounded-full blur-[50px] pointer-events-none z-0" />

        {/* 🌟 کادر نامرئی برای جلوگیری از بریده شدن سایه‌ها هنگام کشیدن (Drag) */}
        <div className="absolute -inset-4 z-10 pointer-events-none">
          <Image
            src={frames[currentIndex]}
            alt={`${title} - تصویر ${currentIndex + 1}`}
            fill
            priority
            // 🌟 اعمال سایه سه‌بعدی سنگین برای القای حس یک محصول فیزیکی
            className="object-contain p-8 select-none drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 500px"
            draggable={false}
            // 🌟 حفظ بالاترین کیفیت (جلوگیری از تار شدن)
            quality={100}
            unoptimized={true}
          />
        </div>

        {frames.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 p-2 rounded-full bg-background/80 border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-gold hover:border-gold z-20 backdrop-blur-md shadow-lg">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 p-2 rounded-full bg-background/80 border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-gold hover:border-gold z-20 backdrop-blur-md shadow-lg">
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* تصاویر بندانگشتی (Thumbnails) */}
      {frames.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {frames.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all bg-[#050810] ${
                currentIndex === idx ? "border-gold opacity-100 shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              <Image 
                src={src} 
                alt={`thumbnail ${idx}`} 
                fill 
                // 🌟 اعمال کیفیت و سایه برای تصاویر کوچک پایین گالری
                className="object-contain p-2 drop-shadow-[0_8px_10px_rgba(0,0,0,0.9)]" 
                quality={100}
                unoptimized={true}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}