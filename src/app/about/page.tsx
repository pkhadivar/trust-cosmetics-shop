// src/app/about/page.tsx
"use client";

import { motion, Variants } from "framer-motion"; // اضافه شدن Variants
import { Handshake, Users, Star, Lightbulb, Leaf } from "lucide-react";
import Image from "next/image";

// تعریف دقیق تایپ Variants برای جلوگیری از ارور تایپ‌اسکریپت
const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative h-[40vh] md:h-[60vh] w-full flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src="/images/about/hero.webp" 
            alt="درباره فروشگاه تراست" 
            fill 
            className="object-cover object-center brightness-75"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background" />
        </motion.div>

        <motion.h1 
          initial={{ y: 30, opacity: 0, filter: "blur(10px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative z-10 text-5xl md:text-7xl font-bold text-white drop-shadow-2xl"
        >
          درباره مـــــا
        </motion.h1>
      </section>

      {/* 2. Executive Section (بخش اجرایی) */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-16 md:mt-24">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* ستون تصاویر */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="w-full lg:w-1/2 grid grid-cols-2 gap-4"
          >
            <motion.div variants={fadeUpVariant} className="col-span-1 row-span-2 relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-xl">
              <Image src="/images/about/office-1.webp" alt="دفتر اجرایی تراست" fill className="object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>
            <motion.div variants={fadeUpVariant} className="col-span-1 relative h-[140px] md:h-[190px] rounded-3xl overflow-hidden shadow-xl">
              <Image src="/images/about/office-2.webp" alt="تیم تراست" fill className="object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>
            <motion.div variants={fadeUpVariant} className="col-span-1 relative h-[140px] md:h-[190px] rounded-3xl overflow-hidden shadow-xl">
              <Image src="/images/about/office-3.webp" alt="بخش فنی تراست" fill className="object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>
          </motion.div>

          {/* ستون متن و آیکون‌ها */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="w-full lg:w-1/2 flex flex-col justify-center text-right"
          >
            <motion.h2 variants={fadeUpVariant} className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              بخش اجرایی
            </motion.h2>
            <motion.p variants={fadeUpVariant} className="text-muted-foreground leading-relaxed text-lg mb-12">
              رویکرد تیم اجرایی لیاتیم تکمیل زنجیره خلق ارزش برای بهبود اقتصاد محصولات مراقبتی، آرایشی و بهداشتی ایران بوده و در این مسیر، زیرساخت‌های لازم برای پاسخگویی به نیازهای این کسب‌وکار را فراهم کرده است.
            </motion.p>

            {/* آیکون‌ها */}
            <div className="flex flex-wrap justify-between gap-6">
              {[
                { icon: Handshake, label: "احترام" },
                { icon: Users, label: "مشتری" },
                { icon: Star, label: "کیفیت" },
                { icon: Lightbulb, label: "نوآوری" },
                { icon: Leaf, label: "سادگی" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  variants={fadeUpVariant}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center border border-border group-hover:border-gold group-hover:bg-gold/10 transition-all duration-300">
                    <item.icon className="size-6 text-foreground group-hover:text-gold transition-colors" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-semibold text-foreground/80">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* 3. Opening Section (افتتاحیه دفتر جدید) */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-24 md:mt-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* ستون متن */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="w-full lg:w-1/2 text-right"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              افتتاحیه دفتر جدید تهران
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              مؤسسان و پایه‌گذاران هلدینگ مهران فعالیت‌شان را از سال ۱۳۶۰ با تولید شمع آغاز کردند و با غلبه بر چالش‌های متعدد و دستیابی به دستاوردهای کلیدی مختلف، موفق شدند نام‌شان را به عنوان یک کسب‌وکار صد ساله در بین بزرگ‌ترین تولیدکنندگان محصولات آرایشی، بهداشتی در ایران ثبت کنند.
            </p>
          </motion.div>

          {/* ستون تصاویر با افکت Overlap (روی هم افتاده) */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="w-full lg:w-1/2 relative h-[400px] md:h-[500px]"
          >
            {/* عکس پس‌زمینه (ساختمان) */}
            <motion.div 
              variants={fadeUpVariant}
              className="absolute top-0 right-0 w-2/3 h-[60%] md:h-[70%] rounded-3xl overflow-hidden shadow-2xl z-0"
            >
              <Image src="/images/about/opening-1.webp" alt="ساختمان دفتر جدید" fill className="object-cover" />
            </motion.div>
            
            {/* عکس پیش‌زمینه (مراسم افتتاحیه) */}
            <motion.div 
              variants={fadeUpVariant}
              className="absolute bottom-0 left-0 w-2/3 h-[60%] md:h-[70%] rounded-3xl overflow-hidden shadow-2xl z-10 border-4 border-background"
            >
              <Image src="/images/about/opening-2.webp" alt="مراسم افتتاحیه" fill className="object-cover" />
            </motion.div>
          </motion.div>

        </div>
      </section>
      {/* 4. Conference Video Section (سالن کنفرانس) */}

     <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-24 md:mt-32">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="relative w-full h-[40vh] md:h-[70vh] rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          {/* ویدیو پلیر - پخش خودکار، بدون صدا و تکرار شونده */}
          <video 
            className="w-full h-full object-cover"
            autoPlay 
            //muted 
            loop 
            playsInline
          >
            <source src="/videos/conference.mp4" type="video/mp4" />
            مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
          </video>
        </motion.div>
      </section>

{/* 5. Brands Strip (بخش برندها) */}
      <section className="mt-16 w-full">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
          className="text-center mb-6 space-y-1"
        >
          <h2 className="text-2xl font-bold text-foreground">برندها</h2>
          <p className="text-muted-foreground text-sm">انتخاب برند</p>
        </motion.div>

        {/* نوار رنگی پس‌زمینه با عکس یکپارچه برندها */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full bg-[#FFEAE0] dark:bg-orange-950/20 py-8 md:py-12 flex items-center"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full flex justify-center">
            {/* حذف fill و استفاده از width و height برای نمایش طبیعی و بزرگ */}
            <Image 
              src="/images/about/brands-strip.png" 
              alt="برندهای تراست" 
              width={1600}
              height={200}
              className="w-full h-auto max-w-5xl object-contain" 
            />
          </div>
        </motion.div>
      </section>

      {/* 6. Image Gallery (تصاویر مجموعه ما) */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-24 md:mt-32">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
          className="text-left mb-10 rtl:text-right"
        >
          <h2 className="text-2xl font-bold text-foreground">تصاویر</h2>
          <p className="text-muted-foreground font-medium mt-1">مجموعه ما</p>
        </motion.div>

        {/* چیدمان شبکه‌ای نامتقارن (Masonry/Grid) مشابه طراحی */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {/* عکس 1 (عریض) */}
          <motion.div variants={fadeUpVariant} className="col-span-2 row-span-2 relative h-[250px] md:h-[400px] rounded-3xl overflow-hidden shadow-lg">
            <Image src="/images/about/gallery-1.webp" alt="گالری تراست" fill className="object-cover hover:scale-110 transition-transform duration-700" />
          </motion.div>
          
          {/* عکس 2 (کوچک) */}
          <motion.div variants={fadeUpVariant} className="col-span-1 relative h-[150px] md:h-[200px] rounded-3xl overflow-hidden shadow-lg">
            <Image src="/images/about/gallery-2.webp" alt="گالری تراست" fill className="object-cover hover:scale-110 transition-transform duration-700" />
          </motion.div>

          {/* عکس 3 (کوچک) */}
          <motion.div variants={fadeUpVariant} className="col-span-1 relative h-[150px] md:h-[200px] rounded-3xl overflow-hidden shadow-lg">
            <Image src="/images/about/gallery-3.webp" alt="گالری تراست" fill className="object-cover hover:scale-110 transition-transform duration-700" />
          </motion.div>

          {/* عکس 4 (متوسط کشیده) */}
          <motion.div variants={fadeUpVariant} className="col-span-2 relative h-[200px] md:h-[250px] rounded-3xl overflow-hidden shadow-lg -mt-4 md:-mt-8">
            <Image src="/images/about/gallery-4.webp" alt="گالری تراست" fill className="object-cover hover:scale-110 transition-transform duration-700" />
          </motion.div>

          {/* عکس 5 (کوچک) */}
          <motion.div variants={fadeUpVariant} className="col-span-2 relative h-[200px] md:h-[250px] rounded-3xl overflow-hidden shadow-lg -mt-4 md:-mt-8">
            <Image src="/images/about/gallery-5.webp" alt="گالری تراست" fill className="object-cover hover:scale-110 transition-transform duration-700" />
          </motion.div>

          {/* عکس 6 (کوچک) */}
          <motion.div variants={fadeUpVariant} className="col-span-2 md:col-span-1 relative h-[180px] md:h-[250px] rounded-3xl overflow-hidden shadow-lg mt-4 md:mt-0">
            <Image src="/images/about/gallery-6.webp" alt="گالری تراست" fill className="object-cover hover:scale-110 transition-transform duration-700" />
          </motion.div>

          {/* عکس 7 (کوچک) */}
          <motion.div variants={fadeUpVariant} className="col-span-2 md:col-span-1 relative h-[180px] md:h-[250px] rounded-3xl overflow-hidden shadow-lg mt-4 md:mt-0">
            <Image src="/images/about/gallery-7.webp" alt="گالری تراست" fill className="object-cover hover:scale-110 transition-transform duration-700" />
          </motion.div>

        </motion.div>
      </section>
      {/* 7. History Timeline (پیشینه ما) */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 mt-24 md:mt-32">
        
        {/* هدر بخش تاریخچه */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">پیشینه ما؛ یک قرن تجربه</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            در لیاتیم، به عنوان یک شرکت فعال در صنف بازاریابی شبکه‌ای با تمرکز بر عرضه محصولات مراقبتی، آرایشی و بهداشتی، به دنبال نوآوری و تعالی هستیم. سفر ما به پشتوانه بیش از یک قرن تجربه هلدینگ مهلران، از سال ۱۲۹۷ در مسیر پیشرفت و موفقیت آغاز شده است. تعدادی از فعالیت‌ها و رویدادهای کلیدی هلدینگ مهلران:
          </p>
        </motion.div>

        {/* تایم‌لاین زیگزاگی */}
        <div className="relative flex flex-col gap-12 md:gap-24">
          
          {/* خط عمودی وسط در حالت دسکتاپ (اختیاری برای زیبایی بیشتر) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 z-0" />

          {[
            {
              year: "سال ۱۲۶۰",
              desc: "بزرگترین تولید کننده صنعت شمع تا سال ۱۲۸۵ و توزیع کننده شمع در ایران با برند شمعی",
              img: "/images/about/history-1.webp"
            },
            {
              year: "سال ۱۳۰۰",
              desc: "راه‌اندازی اولین کارگاه صابون سازی در کشور هم‌زمان با واردات ماشین آلات از کشور شوروی و دریافت اولین پروانه تولید صابون در کشور با نام تجارتی «حقیقت شعاعی»",
              img: "/images/about/history-2.webp"
            },
            {
              year: "سال ۱۳۵۳",
              desc: "تاسیس کارخانه الهی و واردات ماشین آلات پیشرفته و ارتقای سطح کیفی تولید و همکاری شرکت‌های آمریکایی",
              img: "/images/about/history-3.webp"
            },
            {
              year: "سال ۱۳۵۷",
              desc: "تولید اولین صابون و محصولات کودک در ایران با نام تجارتی «شمیز»",
              img: "/images/about/history-4.webp"
            },
            {
              year: "سال ۱۳۷۴",
              desc: "تاسیس شرکت مهلران و واردات ماشین آلات مدرن از کشور ایتالیا با هدف تولید طیف گسترده‌ای از محصولات آرایشی و بهداشتی",
              img: "/images/about/history-5.webp"
            },
            {
              year: "سال ۱۳۸۲",
              desc: "اخذ گواهینامه معتبر کیفیت از کشور سوییس \"Swiss Fine Cosmetic\" تحت شماره‌های ۱۹۰۴ و ۱۹۰۵ و اخذ عنوان صادر کننده نمونه به ۱۸ کشور جهان",
              img: "/images/about/history-6.webp"
            },
            {
              year: "سال ۱۳۹۵",
              desc: "راه‌اندازی شرکت داروسازی فارماسان سینا با هدف تولید محصولات تخصصی و دارویی در صنعت پوست و مو و داروهای ترکیبی",
              img: "/images/about/history-7.webp"
            },
            {
              year: "سال ۱۳۹۷",
              desc: "راه‌اندازی شرکت آرمان تدبیر اطلس با نام تجاری لیاتیم در حوزه مراقبتی، آرایشی و بهداشتی با مدل کسب و کار فروش مستقیم شبکه‌ای",
              img: "/images/about/history-8.webp"
            }
          ].map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: isEven ? 50 : -50, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-16 ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* ستون عکس */}
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="relative w-[200px] h-[200px] md:w-[250px] md:h-[250px] rounded-3xl overflow-hidden shadow-xl border border-border bg-card">
                    <Image src={item.img} alt={item.year} fill className="object-cover hover:scale-110 transition-transform duration-700" />
                  </div>
                </div>

                {/* ستون متن */}
                <div className={`w-full md:w-1/2 flex flex-col text-center ${isEven ? 'md:text-right' : 'md:text-left rtl:md:text-left'} px-4`}>
                  {/* دایره روی خط وسط در دسکتاپ */}
                  <div className={`hidden md:block absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-gold -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(212,175,55,0.5)]`} />
                  
                  <h3 className="text-2xl font-bold text-foreground mb-3">{item.year}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

    </div>
  );
}