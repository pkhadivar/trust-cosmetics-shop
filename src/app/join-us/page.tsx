"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, CheckCircle2, ExternalLink, ShieldCheck, CreditCard, FileText, UserPlus, Fingerprint } from "lucide-react";
import toast from "react-hot-toast";

export default function JoinUsPage() {
  const [isCopied, setIsCopied] = useState(false);
  const referralCode = "299365";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setIsCopied(true);
    toast.success("کد معرف با موفقیت کپی شد!");
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[#0B1120] py-16 lg:py-24 border-b border-border/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="mx-auto max-w-4xl px-5 sm:px-8 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
            نماینده فروش <span className="text-gold">تراست</span> شوید
          </h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-0">
            با عضویت در سیستم همکاری در فروش (لیا تیم)، محصولات درمانی و مراقبتی تراست را بدون نیاز به سرمایه اولیه بفروشید و پورسانت مستقیم به حساب بانکی خود دریافت کنید. 
            مراحل تصویری زیر را قدم‌به‌قدم دنبال کنید تا در کمتر از ۵ دقیقه ثبت‌نام شما تکمیل شود.
          </p>
        </div>
      </section>

      {/* 2. Referral Code Box */}
      <section className="mx-auto max-w-3xl px-5 -mt-8 relative z-20 mb-16">
        <div className="bg-card border border-gold/30 rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.15)] text-center flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-gold font-bold mb-2">
            <ShieldCheck className="size-5" />
            <span>کد معرف اختصاصی شما (الزامی برای ثبت‌نام)</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <div className="bg-background border border-border rounded-2xl px-8 py-4 text-3xl font-black tracking-[0.2em] text-foreground w-full sm:w-auto text-center" dir="ltr">
              {referralCode}
            </div>
            <button 
              onClick={handleCopyCode}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${
                isCopied ? "bg-emerald-500 text-white" : "bg-gold text-[#0a0f1c] hover:bg-yellow-500"
              }`}
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="size-5" />
                  کپی شد!
                </>
              ) : (
                <>
                  <Copy className="size-5" />
                  کپی کردن کد
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            این کد را کپی کنید تا در <strong className="text-foreground">مرحله دوم</strong> ثبت‌نام آن را در کادر مربوطه جای‌گذاری کنید.
          </p>
        </div>
      </section>

      {/* 3. Steps Timeline */}
      <section className="mx-auto max-w-4xl px-5 sm:px-8 mb-20">
        <h2 className="text-2xl font-bold text-center mb-12">مراحل ثبت‌نام در سامانه</h2>
        
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gold before:via-border before:to-transparent">
          
          <StepItem 
            number="۱" 
            title="ثبت شماره موبایل و رمز عبور" 
            desc="ابتدا شماره موبایل فعال خود را وارد کنید. پس از دریافت پیامک تایید، یک رمز عبور امن برای ورودهای بعدی خود به پنل کاربری تعیین کنید."
            icon={<UserPlus className="size-5 text-gold" />}
            imagePath="/images/join-us/join-us-1.webp"
            imageAlt="ثبت شماره موبایل و رمز عبور"
          />

          <StepItem 
            number="۲" 
            title="ورود اطلاعات معرف (مهم)" 
            desc="در این صفحه، سیستم نیازمند بررسی اطلاعات معرف شماست. در کادر «شماره موبایل / کد معرف»، حتماً کدی که در بالای همین صفحه کپی کردید (299365) را وارد کرده و دکمه بررسی را بزنید."
            isHighlight
            icon={<ShieldCheck className="size-5 text-gold" />}
            imagePath="/images/join-us/join-us-2.webp"
            imageAlt="ورود کد معرف"
          />

          <StepItem 
            number="۳" 
            title="اطلاعات اولیه هویتی" 
            desc="نام، نام خانوادگی (فارسی و انگلیسی)، تاریخ تولد دقیق و جنسیت خود را وارد کنید. این اطلاعات برای ساخت حساب رسمی شما در سیستم ضروری است."
            icon={<Fingerprint className="size-5 text-gold" />}
            imagePath="/images/join-us/join-us-3.webp"
            imageAlt="اطلاعات هویتی"
          />

          <StepItem 
            number="۴" 
            title="اطلاعات تکمیلی، بانکی و آدرس" 
            desc="کد ملی و شماره شبای بانکی (به نام خودتان) را برای واریز پورسانت‌ها ثبت کنید. سپس اطلاعات دقیق پستی شامل استان، شهر، کد پستی و آدرس منزل را وارد نمایید."
            icon={<CreditCard className="size-5 text-gold" />}
            imagePath="/images/join-us/join-us-4.webp"
            imageAlt="اطلاعات بانکی و پستی"
          />

          <StepItem 
            number="۵" 
            title="تایید قوانین و اتمام" 
            desc="در مرحله آخر، تیک مربوط به بالای ۱۸ سال بودن و مطالعه قوانین و مقررات لیا تیم را بزنید. با کلیک روی «تکمیل ثبت‌نام»، پنل کاربری شما آماده استفاده خواهد بود!"
            icon={<FileText className="size-5 text-gold" />}
            imagePath="/images/join-us/join-us-5.webp"
            imageAlt="تایید قوانین"
          />

        </div>
      </section>

      {/* 4. Final CTA Section (جایگزین نوار چسبان) */}
      <section className="mx-auto max-w-4xl px-5 sm:px-8 mb-16">
        <div className="bg-gradient-to-br from-card via-card to-card/50 border border-gold/30 rounded-3xl p-8 md:p-12 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.15)] flex flex-col items-center text-center gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">آماده شروع هستید؟</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              فراموش نکنید که در <strong className="text-foreground">مرحله دوم</strong>، کد معرف <span className="bg-gold/10 text-gold font-bold px-2 py-1 rounded-md tracking-widest">{referralCode}</span> را وارد کنید.
            </p>
          </div>
          
          <Link
            href="https://liateam.ir/auth/sign-up?type=agent"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gold text-[#0a0f1c] px-8 py-4 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-lg shadow-gold/20 w-full sm:w-auto"
          >
            ورود به سایت لیا تیم و ثبت‌نام
            <ExternalLink className="size-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}

// کامپوننت رندر کننده مراحل با قاب عمودی برای نمایش کامل عکس‌ها
function StepItem({ number, title, desc, icon, isHighlight, imagePath, imageAlt }: { 
  number: string, 
  title: string, 
  desc: string, 
  icon?: React.ReactNode, 
  isHighlight?: boolean, 
  imagePath: string,
  imageAlt: string 
}) {
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md relative z-10">
        <span className="text-foreground font-bold text-sm">{number}</span>
      </div>
      
      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-3xl border border-border bg-card/50 transition-colors hover:bg-card hover:border-gold/30">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className={`font-bold text-lg md:text-xl ${isHighlight ? "text-gold" : "text-foreground"}`}>{title}</h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed mb-5">{desc}</p>
        
        <div className="relative w-full h-[350px] sm:h-[450px] rounded-2xl overflow-hidden border border-border/50 bg-secondary/10 flex items-center justify-center">
          <Image 
            src={imagePath} 
            alt={imageAlt}
            fill
            className="object-contain" 
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={100}
            priority
          />
        </div>
      </div>
    </div>
  );
}