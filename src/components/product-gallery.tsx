"use client";

import { useState, useRef, MouseEvent, TouchEvent } from "react";
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
        className="relative aspect-square w-full rounded-3xl bg-secondary/20 border border-border/40 flex items-center justify-center p-6 cursor-grab active:cursor-grabbing overflow-hidden group"
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseUp={(e) => handleEnd(e.clientX)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}
      >
        <Image
          src={frames[currentIndex]}
          alt={`${title} - تصویر ${currentIndex + 1}`}
          fill
          priority
          className="object-contain p-4 select-none"
          sizes="(max-width: 768px) 100vw, 500px"
          draggable={false}
        />

        {frames.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 p-2 rounded-full bg-background/80 border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-gold hover:border-gold">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 p-2 rounded-full bg-background/80 border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-gold hover:border-gold">
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
              className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                currentIndex === idx ? "border-gold opacity-100" : "border-transparent opacity-50 hover:opacity-100 bg-secondary/30"
              }`}
            >
              <Image src={src} alt={`thumbnail ${idx}`} fill className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}