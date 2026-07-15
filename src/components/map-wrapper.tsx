"use client";

import dynamic from "next/dynamic";

// لود کردن نقشه با ssr: false در یک کلاینت کامپوننت
const ContactMap = dynamic(() => import("@/components/contact-map"), { 
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-3xl bg-secondary/50 animate-pulse flex items-center justify-center text-muted-foreground">
      در حال بارگذاری نقشه...
    </div>
  )
});

export default function MapWrapper() {
  return <ContactMap />;
}