"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

// 🌟 لیست سوالات متداول (استاتیک و بهینه‌شده برای مدل کسب‌وکار شما)
const faqData: FAQItem[] = [
  {
    question: "آیا محصولات شما اورجینال هستند؟",
    answer: "بله، تمامی محصولات تراست (Trust) ارائه شده در این سایت، مستقیماً از انبار مرکزی شرکت تولیدکننده (لیا تیم) تامین شده و دارای ضمانت اصالت کالا، سیب سلامت و تاییدیه‌های وزارت بهداشت می‌باشند."
  },
  {
    question: "چطور می‌توانم وضعیت سفارش خود را پیگیری کنم؟",
    answer: "پس از ثبت سفارش و پرداخت، وضعیت آن به «پرداخت شده» تغییر می‌کند. سپس تیم ما محصول را برای شما پردازش می‌کند. به محض تحویل به پست، وضعیت سفارش در پنل کاربری شما به «ارسال شده» تغییر کرده و کد رهگیری مرسوله برایتان پیامک می‌شود."
  },
  {
    question: "آیا برای خرید از سایت نیاز به ثبت‌نام است؟",
    answer: "بله، برای پیگیری دقیق سفارشات و امنیت خرید، ثبت‌نام الزامی است. اما نگران نباشید، ورود و ثبت‌نام در سایت ما تنها با وارد کردن شماره موبایل و دریافت رمز یکبار مصرف (OTP) در کمتر از ۱۰ ثانیه انجام می‌شود."
  },
  {
    question: "آیا امکان پرداخت در محل (درب منزل) وجود دارد؟",
    answer: "خیر، با توجه به اینکه سفارشات مستقیماً از انبار مرکزی شرکت مرجع پردازش و ارسال می‌شوند، ثبت نهایی سفارش تنها پس از پرداخت آنلاین از طریق درگاه‌های امن اینترنتی امکان‌پذیر است."
  },
  {
    question: "آیا امکان لغو یا تغییر سفارش پس از پرداخت وجود دارد؟",
    answer: "در صورتی که سفارش شما در وضعیت «پرداخت شده» باشد، امکان پیگیری برای لغو وجود دارد. اما اگر وضعیت سفارش به «در حال پردازش» یا «ارسال شده» تغییر کرده باشد، با توجه به قوانین شرکت تامین‌کننده، امکان لغو یا تغییر وجود نخواهد داشت."
  },
  {
    question: "نحوه ارسال محصولات به چه صورت است و چند روز زمان می‌برد؟",
    answer: "تمامی سفارشات از طریق پست پیشتاز به سراسر ایران ارسال می‌گردند. با توجه به زمان پردازش انبار و ارسال پستی، معمولاً بین ۳ تا ۷ روز کاری زمان می‌برد تا محصول به دست شما برسد."
  },
  {
    question: "آیا امکان دریافت مشاوره پیش از خرید وجود دارد؟",
    answer: "بله قطعا! شما می‌توانید از طریق شماره تماس، واتس‌اپ پشتیبانی و یا فرم تماس با ما، با کارشناسان پوست و موی ما در ارتباط باشید تا بهترین محصول را متناسب با نیاز خود انتخاب کنید."
  },
  {
    question: "چگونه می‌توانم به عنوان نماینده فروش (بازاریاب) تراست فعالیت کنم؟",
    answer: "شما می‌توانید بدون نیاز به سرمایه اولیه، به عنوان نماینده فروش ما فعالیت کنید. با ثبت‌نام در طرح همکاری، یک کد یا لینک معرف اختصاصی دریافت می‌کنید و از خرید کاربرانی که معرفی کرده‌اید، پورسانت عالی دریافت خواهید کرد."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full bg-background py-16" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* هدر بخش سوالات */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            سوالات <span className="text-gold">متداول</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            پاسخ پرتکرارترین سوالات مشتریان درباره خرید محصولات تراست
          </p>
        </div>
        
        {/* لیست آکاردئونی */}
        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
                  isOpen ? "bg-card border-gold/30" : "bg-card/50 border-border hover:border-gold/20"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-5 text-right cursor-pointer group"
                >
                  <span className={`font-bold transition-colors ${isOpen ? "text-gold" : "text-foreground group-hover:text-gold-soft"}`}>
                    {item.question}
                  </span>
                  <div className={`p-1.5 rounded-full transition-colors ${isOpen ? "bg-gold/10" : "bg-secondary/50 group-hover:bg-gold/10"}`}>
                    <ChevronDown className={`size-5 transition-transform duration-300 ${isOpen ? "rotate-180 text-gold" : "text-muted-foreground group-hover:text-gold"}`} />
                  </div>
                </button>
                
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-6 pt-2 text-sm text-muted-foreground leading-loose border-t border-border/40 mx-5 mt-2">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* بخش پشتیبانی */}
        <div className="mt-12 text-center p-6 bg-secondary/20 rounded-3xl border border-border/50">
          <p className="text-sm text-foreground font-medium mb-3">
            پاسخ سوال خود را پیدا نکردید؟
          </p>
          <a 
            href="tel:09905301182" 
            className="inline-flex items-center gap-2 bg-gold text-[#0a0f1c] px-6 py-2.5 rounded-xl font-bold hover:bg-yellow-400 transition-colors text-sm"
          >
            تماس با پشتیبانی: ۰۹۱۱۲۲۸۵۹۹۱
          </a>
        </div>

      </div>
    </div>
  );
}