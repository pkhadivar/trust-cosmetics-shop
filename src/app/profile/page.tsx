import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { User, Phone, Mail } from "lucide-react";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function ProfilePage() {
  // دریافت اطلاعات سشن کاربر از سمت سرور
  const session = await getServerSession();

  // محافظت از مسیر: اگر کاربر لاگین نبود، به صفحه اصلی برگردانده شود
  if (!session) {
    redirect("/");
  }

  // استخراج اطلاعات کاربر (با در نظر گرفتن حالت Fallback)
  // در NextAuth معمولاً اگر نامی ثبت نشده باشد، می‌توانیم یک متن پیش‌فرض نمایش دهیم
  const userName = session.user?.name || "کاربر عزیز";
  
  // بسته به اینکه در تنظیمات NextAuth شماره موبایل را در کدام فیلد ذخیره کنیم 
  // (معمولاً در کاستوم سشن یا فیلد ایمیل قرار می‌گیرد)
  const userContact = session.user?.email || "شماره ثبت نشده";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteNavbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-5 py-12 flex items-start justify-center">
        <div className="w-full max-w-md space-y-6">
          
          {/* کارت اصلی پروفایل */}
          <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-lg relative overflow-hidden">
            {/* یک افکت بک‌گراند ملایم برای زیبایی بیشتر */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gold/10 to-transparent -z-10" />

            {/* ۱. آواتار کاربر (در بالاترین نقطه) */}
            <div className="w-24 h-24 bg-background text-gold rounded-full flex items-center justify-center mx-auto border-4 border-gold/20 shadow-xl mb-6">
              {session.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={userName} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="size-10" />
              )}
            </div>

            {/* ۲. پیام خوش‌آمدگویی و نام کاربر */}
            <div className="space-y-2 mb-8">
              <h1 className="text-2xl font-bold text-foreground">
                خوش آمدید، {userName}
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-secondary/30 w-fit mx-auto px-3 py-1.5 rounded-full">
                <Phone className="size-3.5" />
                <span dir="ltr">{userContact}</span>
              </div>
            </div>

            {/* ۳. دکمه خروج */}
            <div className="pt-6 border-t border-border/50 flex justify-center">
              <LogoutButton />
            </div>
          </div>

          {/* در آینده می‌توانیم بخش‌های دیگری مثل "سفارشات من" یا "آدرس‌ها" را اینجا اضافه کنیم */}
          
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}