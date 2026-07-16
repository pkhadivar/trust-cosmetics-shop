"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ReviewForm } from "@/components/review-form";

type Attribute = { id: string; key: string; value: string };
type FAQ = { id: string; question: string; answer: string };
type Review = { id: string; userName: string; text: string; adminReply?: string | null; createdAt: Date };

type ProductTabsProps = {
  productId: string;
  description: string | null;
  attributes: Attribute[];
  faqs: FAQ[];
  videoUrls: string[]; // <--- تغییر از videoUrl به videoUrls (آرایه)
  reviews: Review[];
};

export function ProductTabs({ productId, description, attributes, faqs, videoUrls, reviews }: ProductTabsProps) {
  const availableTabs = [
    { id: "description", label: "توضیحات", hasData: !!description },
    { id: "attributes", label: "جزئیات", hasData: attributes.length > 0 },
    // بررسی وجود ویدیو با چک کردن طول آرایه
    { id: "video", label: "ویدئو", hasData: videoUrls && videoUrls.length > 0 },
    { id: "reviews", label: "نظرات", hasData: true }, 
    { id: "faqs", label: "سوالات", hasData: faqs.length > 0 },
  ].filter((tab) => tab.hasData);

  const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || "description");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  return (
    <div className="w-full mt-12 bg-card rounded-3xl border border-border overflow-hidden">
      
      {/* هدر تب‌ها */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-border/50 bg-secondary/20">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-8 py-5 text-sm font-bold transition-all relative ${
              activeTab === tab.id
                ? "text-gold bg-gold/5"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold shadow-[0_-2px_10px_rgba(212,175,55,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* محتوای تب‌ها */}
      <div className="p-6 md:p-10">
        
        {/* ۱. تب توضیحات */}
        {activeTab === "description" && description && (
          <div className="prose prose-invert prose-gold max-w-none text-foreground/90 leading-loose text-sm md:text-base">
            <div dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br/>') }} />
          </div>
        )}

        {/* ۲. تب جزئیات و مشخصات فنی */}
        {activeTab === "attributes" && (
          <div className="border border-border/50 rounded-2xl overflow-hidden">
            {attributes.map((attr, index) => (
              <div 
                key={attr.id} 
                className={`flex flex-col sm:flex-row border-b border-border/50 last:border-0 ${
                  index % 2 === 0 ? 'bg-secondary/10' : 'bg-transparent'
                }`}
              >
                <div className="sm:w-1/3 p-4 text-sm font-bold text-foreground bg-secondary/20 sm:bg-transparent">
                  {attr.key}
                </div>
                <div className="sm:w-2/3 p-4 text-sm text-muted-foreground">
                  {attr.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ۳. تب ویدیو (ویرایش شده برای پشتیبانی از چند ویدیو) */}
        {activeTab === "video" && videoUrls && videoUrls.length > 0 && (
          <div className={`grid gap-8 ${videoUrls.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
            {videoUrls.map((url, index) => (
              <div key={index} className="aspect-video w-full rounded-2xl overflow-hidden border border-border shadow-lg bg-[#050810]">
                <video
                  src={url}
                  controls
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* ۴. تب سوالات متداول */}
        {activeTab === "faqs" && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className="border border-border/60 rounded-2xl overflow-hidden bg-secondary/10 transition-all hover:border-gold/30"
              >
                <button
                  onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-5 text-right focus:outline-none"
                >
                  <span className="font-bold text-sm text-foreground">{faq.question}</span>
                  <ChevronDown 
                    className={`size-5 text-gold transition-transform duration-300 shrink-0 ${
                      openFaqId === faq.id ? "rotate-180" : ""
                    }`} 
                  />
                </button>
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    openFaqId === faq.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="p-5 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border/30 mt-2">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ۵. تب نظرات */}
        {activeTab === "reviews" && (
          <div className="max-w-4xl mx-auto">
            
            {/* لیست نظرات تایید شده */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-secondary/5 rounded-2xl border border-dashed border-border">
                  هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهد!
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="p-5 rounded-2xl bg-secondary/5 border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-foreground">{review.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.text}
                    </p>
                    
                    {/* پاسخ ادمین */}
                    {review.adminReply && (
                      <div className="mt-4 p-4 rounded-xl bg-gold/5 border border-gold/20 mr-4 md:mr-8">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="size-2 rounded-full bg-gold"></span>
                          <span className="text-xs font-bold text-gold">پاسخ مدیریت:</span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {review.adminReply}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* فرم ثبت نظر جدید */}
            <ReviewForm productId={productId} />
            
          </div>
        )}

      </div>
    </div>
  );
}