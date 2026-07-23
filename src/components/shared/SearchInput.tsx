"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export function SearchInput({ placeholder = "جستجو..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentQ = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(currentQ);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== currentQ) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
          params.set("q", searchQuery);
        } else {
          params.delete("q");
        }
        params.set("page", "1"); // با هر جستجو برگرد به صفحه اول
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, pathname, router, currentQ, searchParams]);

  return (
    <div className="relative w-full lg:flex-1">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-gold focus:outline-none transition-colors"
      />
      <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}