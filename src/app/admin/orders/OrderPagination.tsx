"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";

export function OrderPagination({ totalPages, currentPage }: { totalPages: number; currentPage: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between border-t border-border/50 bg-secondary/10 px-6 py-4">
      <span className="text-sm text-muted-foreground font-medium">
        صفحه <strong className="text-foreground">{currentPage}</strong> از <strong className="text-foreground">{totalPages}</strong>
      </span>
      
      {/* 
        اصلاح چیدمان برای حالت RTL: 
        دکمه «بعدی» در سمت راست و دکمه «قبلی» در سمت چپ قرار گرفت 
      */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push(createPageURL(currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-background border border-border rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
        >
          <ChevronRight className="size-4" />
          بعدی
        </button>
        
        <button
          onClick={() => router.push(createPageURL(currentPage - 1))}
          disabled={currentPage <= 1}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-background border border-border rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
        >
          قبلی
          <ChevronLeft className="size-4" />
        </button>
      </div>
    </div>
  );
}