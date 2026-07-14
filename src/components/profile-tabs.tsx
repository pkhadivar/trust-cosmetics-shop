// src/components/profile-tabs.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, ShoppingBag, Shield, Phone, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

interface ProfileTabsProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function ProfileTabs({ user }: ProfileTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "addresses" | "orders">("info");
  
  // استیت‌های مربوط به فرم آپدیت نام
  const [nameInput, setNameInput] = useState(user.name === "کاربر عزیز" ? "" : user.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // تابع ارسال نام جدید به بک‌اند
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "خطایی رخ داده است");
      }

      setUpdateMessage({ type: "success", text: "نام شما با موفقیت ثبت شد!" });
      
      // این دستور باعث می‌شود سرور کامپوننت پروفایل دوباره اجرا شده و نام جدید را به این کامپوننت پاس بدهد
      router.refresh(); 

    } catch (error: any) {
      setUpdateMessage({ type: "error", text: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* سایدبار پروفایل */}
      <aside className="w-full md:w-72 space-y-6">
        <div className="bg-card border border-border rounded-3xl p-6 text-center shadow-sm relative overflow-hidden">
          <div className="w-20 h-20 bg-background text-gold rounded-full flex items-center justify-center mx-auto border-4 border-gold/20 mb-4 relative">
            <User className="size-8" />
            {user.role === "ADMIN" && (
              <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1 rounded-full border-2 border-background shadow-sm">
                <Shield className="size-3" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">{user.name}</h2>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground bg-secondary/40 w-fit mx-auto px-2 py-1 rounded-full">
            <Phone className="size-3" />
            <span dir="ltr">{user.email}</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
              activeTab === "info" ? "bg-gold text-primary-foreground shadow-md" : "text-foreground/80 hover:bg-secondary"
            }`}
          >
            <User className="size-4" />
            اطلاعات حساب
          </button>
          
          <button
            onClick={() => setActiveTab("addresses")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
              activeTab === "addresses" ? "bg-gold text-primary-foreground shadow-md" : "text-foreground/80 hover:bg-secondary"
            }`}
          >
            <MapPin className="size-4" />
            آدرس‌های من
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
              activeTab === "orders" ? "bg-gold text-primary-foreground shadow-md" : "text-foreground/80 hover:bg-secondary"
            }`}
          >
            <ShoppingBag className="size-4" />
            سفارشات من
          </button>

          {user.role === "ADMIN" && (
            <Link 
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-gold border border-border hover:bg-secondary mt-4 shadow-sm"
            >
              <Shield className="size-4" />
              پنل مدیریت
            </Link>
          )}

          <div className="mt-4 pt-4 border-t border-border/50">
            <LogoutButton />
          </div>
        </nav>
      </aside>

      {/* محتوای تب‌ها */}
      <main className="flex-1 bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
        
        {activeTab === "info" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-lg font-bold">اطلاعات شخصی</h3>
              <p className="text-sm text-muted-foreground mt-1">
                مشخصات خود را وارد کنید تا در سفارشات از آن‌ها استفاده شود.
              </p>
            </div>
            
            <form onSubmit={handleUpdateInfo} className="space-y-5 max-w-md">
              
              {/* نمایش پیام موفقیت یا خطا */}
              {updateMessage && (
                <div className={`flex items-center gap-2 p-3 text-sm rounded-xl ${
                  updateMessage.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                }`}>
                  {updateMessage.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                  <span>{updateMessage.text}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-foreground">نام و نام خانوادگی</label>
                <input
                  id="name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="مثال: پوریا..."
                  className="w-full p-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold transition-all"
                  required
                />
              </div>

              <div className="space-y-2 opacity-60">
                <label className="text-sm font-semibold text-foreground">شماره تماس (غیرقابل تغییر)</label>
                <div className="w-full p-3 border border-border rounded-xl bg-secondary/50 text-foreground flex items-center justify-between" dir="ltr">
                  <span>{user.email}</span>
                  <Shield className="size-4 text-muted-foreground" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isUpdating || !nameInput.trim()}
                className="w-full p-6 text-base bg-gold text-primary-foreground hover:bg-gold-soft rounded-xl transition-all font-bold mt-4"
              >
                {isUpdating ? "در حال ذخیره..." : "ثبت اطلاعات"}
              </Button>
            </form>
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-border pb-4">آدرس‌های ثبت شده</h3>
            <div className="bg-secondary/30 border border-border border-dashed rounded-2xl p-8 text-center">
              <MapPin className="size-8 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">شما هنوز آدرسی ثبت نکرده‌اید.</p>
              {/* دکمه اضافه کردن آدرس در مراحل بعدی اینجا قرار میگیرد */}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-border pb-4">تاریخچه سفارشات</h3>
            <div className="bg-secondary/30 border border-border border-dashed rounded-2xl p-8 text-center">
              <ShoppingBag className="size-8 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">شما هنوز سفارشی ثبت نکرده‌اید.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}