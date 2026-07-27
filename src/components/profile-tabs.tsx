"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { User, MapPin, ShoppingBag, Shield, Phone, CheckCircle2, AlertCircle, Edit2, Trash2, X, Package, Clock, Truck, Heart } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

// ----------------------------------------------------------------------
import * as iranCityPkg from "iran-city";
const iranCity = (iranCityPkg as any).default || iranCityPkg;
const provincesList = typeof iranCity.allProvinces === 'function' ? iranCity.allProvinces() : [];

// ----------------------------------------------------------------------
// کامپوننت اختصاصی Dropdown
// ----------------------------------------------------------------------
function DropdownSelect({ value, onChange, options, placeholder, disabled }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full text-right">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full p-3 border border-border rounded-xl bg-background flex items-center justify-between transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gold/50"
        }`}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {options.find((o: any) => o.value === value)?.label || placeholder}
        </span>
        <svg 
          className={`size-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-gold" : "opacity-50 text-foreground"}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto py-2">
            {options.length > 0 ? (
              options.map((opt: any) => (
                <div
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={`px-4 py-2.5 cursor-pointer hover:bg-secondary/60 transition-colors text-sm ${
                    value === opt.value ? "text-gold bg-gold/10 font-bold" : "text-foreground"
                  }`}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">موردی یافت نشد</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// مپ کردن وضعیت سفارشات
// ----------------------------------------------------------------------
const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "در انتظار پرداخت", color: "text-orange-500 bg-orange-500/10 border-orange-500/20", icon: Clock },
  PAID: { label: "پرداخت شده", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: CheckCircle2 },
  PROCESSING: { label: "در حال پردازش", color: "text-purple-500 bg-purple-500/10 border-purple-500/20", icon: Package },
  SHIPPED: { label: "ارسال شده", color: "text-teal-500 bg-teal-500/10 border-teal-500/20", icon: Truck },
  DELIVERED: { label: "تحویل داده شده", color: "text-green-500 bg-green-500/10 border-green-500/20", icon: CheckCircle2 },
  CANCELLED: { label: "لغو شده", color: "text-red-500 bg-red-500/10 border-red-500/20", icon: X },
};

// ----------------------------------------------------------------------

interface ProfileTabsProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

// 🌟 برای جلوگیری از ارور Suspense در Next.js هنگام استفاده از useSearchParams
export function ProfileTabs({ user }: ProfileTabsProps) {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-secondary/20 rounded-3xl w-full" />}>
      <ProfileTabsContent user={user} />
    </Suspense>
  )
}

function ProfileTabsContent({ user }: ProfileTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 🌟 خواندن تب پیش‌فرض از URL
  const tabParam = searchParams.get("tab") as "info" | "addresses" | "orders" | "wishlist" | null;
  const validTabs = ["info", "addresses", "orders", "wishlist"];
  
  const [activeTab, setActiveTab] = useState<"info" | "addresses" | "orders" | "wishlist">(
    tabParam && validTabs.includes(tabParam) ? tabParam : "info"
  );
  
  // ۱. استیت‌های اطلاعات حساب
  const [nameInput, setNameInput] = useState(user.name === "کاربر عزیز" ? "" : user.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 🌟 همگام‌سازی اینپوت فرم با اطلاعات جدید دریافت شده از سرور
  useEffect(() => {
    if (user.name && user.name !== "کاربر عزیز") {
      setNameInput(user.name);
    }
  }, [user.name]);

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
      if (!res.ok) throw new Error(data.error || "خطایی رخ داده است");
      setUpdateMessage({ type: "success", text: "نام شما با موفقیت ثبت شد!" });
      router.refresh(); 
    } catch (error: any) {
      setUpdateMessage({ type: "error", text: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  // ۲. استیت‌های آدرس‌ها
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [addressMessage, setAddressMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | "">("");
  const [addressForm, setAddressForm] = useState({ title: "", state: "", city: "", fullAddress: "", postalCode: "" });

  const cityOptions = useMemo(() => {
    if (!selectedProvinceId || typeof iranCity.citiesOfProvince !== 'function') return [];
    return iranCity.citiesOfProvince(selectedProvinceId).map((c: any) => ({ label: c.name, value: c.name }));
  }, [selectedProvinceId]);

  // ۳. استیت‌های تاریخچه سفارشات
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // ۴. استیت‌های علاقه‌مندی‌ها
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  // 🌟 همگام‌سازی استیت با URL در صورت استفاده کاربر از دکمه Back مرورگر
  useEffect(() => {
    const currentTab = searchParams.get("tab") as any;
    if (currentTab && validTabs.includes(currentTab)) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "addresses") fetchAddresses();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "wishlist") fetchWishlist();
  }, [activeTab]);

  const fetchAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) setAddresses(await res.json());
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch("/api/user/orders");
      if (res.ok) setOrders(await res.json());
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchWishlist = async () => {
    setIsLoadingWishlist(true);
    try {
      const res = await fetch("/api/user/wishlist");
      if (res.ok) setWishlist(await res.json());
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAddress(true);
    setAddressMessage(null);
    try {
      const method = editingAddressId ? "PUT" : "POST";
      const payload = editingAddressId ? { ...addressForm, id: editingAddressId } : addressForm;
      const res = await fetch("/api/user/addresses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطایی رخ داده است");
      setAddressMessage({ type: "success", text: editingAddressId ? "آدرس با موفقیت ویرایش شد!" : "آدرس با موفقیت ثبت شد!" });
      setAddressForm({ title: "", state: "", city: "", fullAddress: "", postalCode: "" }); 
      setSelectedProvinceId("");
      setEditingAddressId(null);
      fetchAddresses(); 
    } catch (error: any) {
      setAddressMessage({ type: "error", text: error.message });
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    setIsDeletingId(addressToDelete);
    setAddressMessage(null);
    try {
      const res = await fetch(`/api/user/addresses?id=${addressToDelete}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در حذف آدرس");
      setAddresses(addresses.filter(addr => addr.id !== addressToDelete));
      setAddressMessage({ type: "success", text: "آدرس با موفقیت حذف شد!" });
      if (editingAddressId === addressToDelete) cancelEditing();
    } catch (error: any) {
      setAddressMessage({ type: "error", text: error.message });
    } finally {
      setIsDeletingId(null);
      setAddressToDelete(null);
    }
  };

  const startEditing = (addr: any) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      title: addr.title, state: addr.state, city: addr.city, fullAddress: addr.fullAddress, postalCode: addr.postalCode,
    });
    const foundProvince = provincesList.find((p: any) => p.name === addr.state);
    if (foundProvince) setSelectedProvinceId(foundProvince.id);
    else setSelectedProvinceId("");
    document.getElementById("address-form-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const cancelEditing = () => {
    setEditingAddressId(null);
    setAddressForm({ title: "", state: "", city: "", fullAddress: "", postalCode: "" });
    setSelectedProvinceId("");
  };

  // 🌟 تابع تغییر تب و آپدیت همزمان URL
  const handleTabChange = (tabId: "info" | "addresses" | "orders" | "wishlist") => {
    setActiveTab(tabId);
    if (tabId !== "addresses") {
      cancelEditing();
    }
    // آپدیت کردن آدرس مرورگر بدون رفرش شدن صفحه
    router.replace(`${pathname}?tab=${tabId}`, { scroll: false });
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
          <button onClick={() => handleTabChange("info")} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === "info" ? "bg-gold text-primary-foreground shadow-md" : "text-foreground/80 hover:bg-secondary"}`}>
            <User className="size-4" /> اطلاعات حساب
          </button>
          
          <button onClick={() => handleTabChange("addresses")} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === "addresses" ? "bg-gold text-primary-foreground shadow-md" : "text-foreground/80 hover:bg-secondary"}`}>
            <MapPin className="size-4" /> آدرس‌های من
          </button>

          <button onClick={() => handleTabChange("orders")} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === "orders" ? "bg-gold text-primary-foreground shadow-md" : "text-foreground/80 hover:bg-secondary"}`}>
            <ShoppingBag className="size-4" /> سفارشات من
          </button>
          
          <button onClick={() => handleTabChange("wishlist")} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === "wishlist" ? "bg-gold text-primary-foreground shadow-md" : "text-foreground/80 hover:bg-secondary"}`}>
            <Heart className="size-4" /> علاقه‌مندی‌ها
          </button>

          {user.role === "ADMIN" && (
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-gold border border-border hover:bg-secondary mt-4 shadow-sm">
              <Shield className="size-4" /> پنل مدیریت
            </Link>
          )}

          <div className="mt-4 pt-4 border-t border-border/50">
            <LogoutButton />
          </div>
        </nav>
      </aside>

      {/* محتوای تب‌ها */}
      <main className="flex-1 bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm relative">
        
        {/* تب اطلاعات شخصی */}
        {activeTab === "info" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-lg font-bold">اطلاعات شخصی</h3>
              <p className="text-sm text-muted-foreground mt-1">مشخصات خود را وارد کنید تا در سفارشات از آن‌ها استفاده شود.</p>
            </div>
            <form onSubmit={handleUpdateInfo} className="space-y-5 max-w-md">
              {updateMessage && (
                <div className={`flex items-center gap-2 p-3 text-sm rounded-xl ${updateMessage.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                  {updateMessage.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                  <span>{updateMessage.text}</span>
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-foreground">نام و نام خانوادگی</label>
                <input id="name" type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="مثال: پوریا..." className="w-full p-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold transition-all" required />
              </div>
              <div className="space-y-2 opacity-60">
                <label className="text-sm font-semibold text-foreground">شماره تماس (غیرقابل تغییر)</label>
                <div className="w-full p-3 border border-border rounded-xl bg-secondary/50 text-foreground flex items-center justify-between" dir="ltr">
                  <span>{user.email}</span>
                  <Shield className="size-4 text-muted-foreground" />
                </div>
              </div>
              <Button type="submit" disabled={isUpdating || !nameInput.trim()} className="w-full p-6 text-base bg-gold text-primary-foreground hover:bg-gold-soft rounded-xl transition-all font-bold mt-4">
                {isUpdating ? "در حال ذخیره..." : "ثبت اطلاعات"}
              </Button>
            </form>
          </div>
        )}

        {/* تب آدرس‌ها */}
        {activeTab === "addresses" && (
          <div className="space-y-8">
            <div className="border-b border-border pb-4">
              <h3 className="text-lg font-bold">آدرس‌های ثبت شده</h3>
              <p className="text-sm text-muted-foreground mt-1">آدرس‌های خود را برای ارسال سریع‌تر سفارشات مدیریت کنید.</p>
            </div>

            {isLoadingAddresses ? (
              <p className="text-sm text-muted-foreground animate-pulse">در حال دریافت آدرس‌ها...</p>
            ) : addresses.length > 0 ? (
              <div className="grid gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-5 border border-border rounded-2xl bg-secondary/20 flex flex-col gap-2 relative">
                    <h4 className="font-bold text-gold">{addr.title}</h4>
                    <p className="text-sm text-foreground/90 font-medium">{addr.state}، {addr.city}</p>
                    <p className="text-sm leading-relaxed text-foreground/80">{addr.fullAddress}</p>
                    <span className="text-xs text-muted-foreground mt-1">کد پستی: <span dir="ltr">{addr.postalCode}</span></span>
                    
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <button type="button" onClick={() => startEditing(addr)} className="p-1.5 text-foreground/70 hover:text-gold hover:bg-secondary rounded-lg transition-all" title="ویرایش">
                        <Edit2 className="size-4" />
                      </button>
                      <button type="button" onClick={() => setAddressToDelete(addr.id)} disabled={isDeletingId === addr.id} className="p-1.5 text-foreground/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50" title="حذف">
                        <Trash2 className="size-4 animate-none" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-secondary/30 border border-border border-dashed rounded-2xl p-8 text-center">
                <MapPin className="size-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">شما هنوز آدرسی ثبت نکرده‌اید.</p>
              </div>
            )}

            {/* فرم ثبت یا ویرایش آدرس */}
            <form id="address-form-section" className="space-y-5 bg-secondary/10 p-6 rounded-2xl border border-border mt-8 scroll-mt-6" onSubmit={handleSaveAddress}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold flex items-center gap-2">
                  <MapPin className="size-4 text-gold" />
                  {editingAddressId ? `ویرایش آدرس (${addressForm.title})` : "ثبت آدرس جدید"}
                </h4>
                {editingAddressId && (
                  <button type="button" onClick={cancelEditing} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-bold bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-all">
                    <X className="size-3" /> انصراف
                  </button>
                )}
              </div>

              {addressMessage && (
                <div className={`flex items-center gap-2 p-3 text-sm rounded-xl mb-4 ${addressMessage.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                  {addressMessage.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                  <span>{addressMessage.text}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">عنوان آدرس</label>
                  <input type="text" value={addressForm.title} onChange={(e) => setAddressForm({...addressForm, title: e.target.value})} placeholder="مثال: خانه، محل کار" className="w-full p-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold transition-all text-right" required />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">استان</label>
                  <DropdownSelect
                    value={selectedProvinceId}
                    onChange={(val: number) => {
                      setSelectedProvinceId(val);
                      const pName = provincesList?.find((p: any) => p.id === val)?.name || "";
                      setAddressForm({ ...addressForm, state: pName, city: "" });
                    }}
                    options={provincesList.map((p: any) => ({ label: p.name, value: p.id }))}
                    placeholder="انتخاب استان..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">شهر</label>
                  <DropdownSelect
                    value={addressForm.city}
                    onChange={(val: string) => setAddressForm({ ...addressForm, city: val })}
                    disabled={!selectedProvinceId}
                    options={cityOptions}
                    placeholder={selectedProvinceId ? "انتخاب شهر..." : "ابتدا استان را انتخاب کنید"}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">کد پستی (الزامی)</label>
                  <input type="text" maxLength={10} minLength={10} value={addressForm.postalCode} onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})} placeholder="مثال: 1234567890" className="w-full p-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold transition-all text-right" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">آدرس پستی دقیق</label>
                <textarea rows={3} value={addressForm.fullAddress} onChange={(e) => setAddressForm({...addressForm, fullAddress: e.target.value})} placeholder="نام خیابان، کوچه، پلاک..." className="w-full p-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold transition-all resize-none text-right" required></textarea>
              </div>

              <div className="flex justify-end pt-2 gap-3">
                {editingAddressId && (
                  <Button type="button" onClick={cancelEditing} className="w-full md:w-auto px-6 py-6 text-base bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-all font-bold">
                    انصراف
                  </Button>
                )}
                <Button type="submit" disabled={isSubmittingAddress || !addressForm.fullAddress.trim() || !addressForm.state || !addressForm.city || addressForm.postalCode.length !== 10} className="w-full md:w-auto px-8 py-6 text-base bg-gold text-primary-foreground hover:bg-gold-soft rounded-xl transition-all font-bold">
                  {isSubmittingAddress ? "در حال پردازش..." : editingAddressId ? "بروزرسانی آدرس" : "ذخیره آدرس"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* تب سفارشات */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-lg font-bold">تاریخچه سفارشات</h3>
              <p className="text-sm text-muted-foreground mt-1">لیست تمامی خریدهای شما در فروشگاه.</p>
            </div>
            
            {isLoadingOrders ? (
              <p className="text-sm text-muted-foreground animate-pulse">در حال دریافت سفارشات...</p>
            ) : orders.length > 0 ? (
              <div className="grid gap-6">
                {orders.map((order) => {
                  const StatusIcon = statusMap[order.status]?.icon || Clock;
                  
                  return (
                    <div key={order.id} className="bg-background border border-border rounded-2xl p-5 md:p-6 transition-all hover:border-gold/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5 mb-5">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                          <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs">تاریخ ثبت سفارش</span>
                            <span className="font-medium text-foreground">{new Date(order.createdAt).toLocaleDateString('fa-IR')}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs">شماره سفارش</span>
                            <span className="font-mono font-medium text-foreground">{order.id.slice(-8).toUpperCase()}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs">مبلغ کل (با هزینه پست)</span>
                            <span className="font-medium text-gold">{order.totalAmount.toLocaleString('fa-IR')} تومان</span>
                          </div>
                        </div>
                        
                        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${statusMap[order.status]?.color}`}>
                          <StatusIcon className="size-4" />
                          <span className="text-sm font-bold">{statusMap[order.status]?.label}</span>
                        </div>
                      </div>

                 <div className="flex flex-col gap-3 mt-4">
                   {order.items.map((item: any) => (
                     <div key={item.id} className="flex items-center justify-between bg-secondary/10 hover:bg-secondary/20 rounded-xl p-3 border border-border/40 w-full transition-colors">
      
                       {/* بخش عکس و نام محصول */}
      <                 div className="flex items-center gap-4">
                         <div className="relative size-14 rounded-lg overflow-hidden bg-[#050810] border border-border shrink-0">
                           <Image 
                             src={item.product.images[0] || "/placeholder.jpg"} 
                             alt={item.product.title} 
                             fill 
                             className="object-contain p-1"
                           />
                         </div>
                         <div className="flex flex-col text-right">
                           <span className="text-sm font-bold text-foreground line-clamp-1">{item.product.title}</span>
                           <span className="text-xs text-muted-foreground mt-1">
            {                 item.price.toLocaleString('fa-IR')} تومان <span className="mx-1 text-gold">×</span> {item.quantity} عدد
                           </span>
                         </div>
                       </div>

                       {/* جمع مبلغ این سطر (اختیاری برای زیبایی بیشتر - فقط در دسکتاپ نمایش داده می‌شود) */}
                       <div className="hidden sm:block text-sm font-bold text-gold shrink-0 pl-2">
                         {(item.price * item.quantity).toLocaleString('fa-IR')} تومان
                       </div>
      
                     </div>
                   ))}
                 </div>
                      
                      {order.refId && (
                        <div className="mt-5 pt-5 border-t border-border/50 flex items-center gap-2 text-sm text-muted-foreground bg-secondary/10 p-4 rounded-xl">
                          کد پیگیری تراکنش بانکی: <span className="font-mono text-foreground font-medium">{order.refId}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-secondary/30 border border-border border-dashed rounded-2xl p-8 text-center">
                <ShoppingBag className="size-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">شما هنوز سفارشی ثبت نکرده‌اید.</p>
              </div>
            )}
          </div>
        )}

        {/* تب علاقه‌مندی‌ها */}
        {activeTab === "wishlist" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-lg font-bold">علاقه‌مندی‌های من</h3>
              <p className="text-sm text-muted-foreground mt-1">محصولاتی که برای بررسی یا خرید در آینده ذخیره کرده‌اید.</p>
            </div>
            
            {isLoadingWishlist ? (
              <p className="text-sm text-muted-foreground animate-pulse">در حال دریافت لیست علاقه‌مندی‌ها...</p>
            ) : wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:border-gold/50">
                    <Link href={`/products/${item.id}`} className="relative block aspect-square overflow-hidden rounded-xl bg-[#050810]">
                      <Image src={item.images[0] || "/placeholder.jpg"} alt={item.title} fill className="object-contain p-4 transition-transform group-hover:scale-110" />
                    </Link>
                    <Link href={`/products/${item.id}`} className="mt-4 text-sm font-bold hover:text-gold line-clamp-1">
                      {item.title}
                    </Link>
                    <div className="mt-2 text-gold font-bold text-sm flex items-center gap-2">
                      {item.discountedPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {item.price.toLocaleString('fa-IR')}
                        </span>
                      )}
                      <span>
                        {(item.discountedPrice || item.price).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-secondary/30 border border-border border-dashed rounded-2xl p-8 text-center">
                <Heart className="size-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">شما هنوز هیچ محصولی را ذخیره نکرده‌اید.</p>
                <button onClick={() => router.push("/#products")} className="mt-4 text-sm font-bold text-gold hover:underline">
                  مشاهده محصولات
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* مودال حذف آدرس */}
      {addressToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 transition-all">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border-4 border-red-500/5">
                <Trash2 className="size-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">حذف آدرس</h3>
                <p className="text-sm text-muted-foreground px-2">
                  آیا از حذف این آدرس اطمینان دارید؟
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-8">
              <Button type="button" onClick={() => setAddressToDelete(null)} className="flex-1 p-6 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl font-bold" disabled={isDeletingId === addressToDelete}>انصراف</Button>
              <Button type="button" onClick={confirmDeleteAddress} className="flex-1 p-6 bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold" disabled={isDeletingId === addressToDelete}>{isDeletingId === addressToDelete ? "در حال حذف..." : "بله، حذف کن"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}