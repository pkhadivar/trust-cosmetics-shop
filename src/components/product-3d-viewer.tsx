"use client";

import { useState, useRef, MouseEvent, TouchEvent } from "react";
import Image from "next/image";

type Product3DViewerProps = {
  images: string[];
  title: string;
};

export function Product3DViewer({ images, title }: Product3DViewerProps) {
  // اگر محصول فقط یک عکس داشت یا آرایه خالی بود، از عکس اول یا پلیس‌هولدر استفاده کند
  const frames = images.length > 0 ? images : ["/placeholder.jpg"];
  const totalFrames = frames.length;

  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const startX = useRef(0);
  const startFrame = useRef(0);

  // شروع لمس یا کلیک موس
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startX.current = clientX;
    startFrame.current = currentFrame;
  };

  const handleMouseDown = (e: MouseEvent) => handleStart(e.clientX);
  const handleTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);

  // حرکت موس یا انگشت و محاسبه زاویه چرخش چرخه تصاویر
  const handleMove = (clientX: number) => {
    if (!isDragging) return;

    const deltaX = clientX - startX.current;
    // سرعت چرخش: هر ۱۵ پیکسل حرکت موس، یک فریم تغییر کند
    const speed = 15; 
    const frameOffset = Math.floor(deltaX / speed);
    
    // محاسبه فریم جدید به صورت چرخشی (Loop)
    let nextFrame = (startFrame.current - frameOffset) % totalFrames;
    if (nextFrame < 0) nextFrame += totalFrames;

    setCurrentFrame(nextFrame);
  };

  const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

  const handleEnd = () => setIsDragging(false);

  return (
    <div 
      className="relative aspect-square w-full max-w-md mx-auto rounded-3xl bg-gradient-to-b from-secondary/20 to-transparent border border-border/40 flex items-center justify-center p-6 cursor-grab active:cursor-grabbing select-none overflow-hidden group"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
    >
      {/* رندر فریم فعلی محصول با نهایت شفافیت بدون لایه سایه کدر */}
      <div className="relative size-full">
        <Image
          src={frames[currentFrame]}
          alt={`${title} - زاویه سه‌بعدی ${currentFrame + 1}`}
          fill
          priority
          className="object-contain transition-transform duration-200"
          sizes="(max-w-md) 100vw, 450px"
        />
      </div>

      {/* راهنمای شناور تعاملی ادمین/کاربر */}
      <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-40">
        <span className="bg-background/80 border border-border px-3 py-1.5 rounded-full text-[11px] text-gold font-medium backdrop-blur-md">
          برای چرخش ۳۶۰ درجه، موس را بکشید
        </span>
      </div>
    </div>
  );
}