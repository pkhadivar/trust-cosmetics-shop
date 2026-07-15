// src/components/profile-tabs.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, ShoppingBag, Shield, Phone, CheckCircle2, AlertCircle, Edit2, Trash2, X } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

// ----------------------------------------------------------------------
// ایمپورت ایمن پکیج iran-city
// ----------------------------------------------------------------------
import * as iranCityPkg from "iran-city";
const iranCity = (iranCityPkg as any).default || iranCityPkg;
const provincesList = typeof iranCity.allProvinces === 'function' ? iranCity.allProvinces() : [];

// ----------------------------------------------------------------------
// کامپوننت اختصاصی Dropdown برای رفع باگ اسکرول و ظاهر نیتیو مرورگر
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
  
  // ۱. استیت‌های تب اطلاعات حساب
  const [nameInput, setNameInput] = useState(user.name === "کاربر عزیز" ? "" : user.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  // ۲. استیت‌های تب آدرس‌ها
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  
  // استیت‌های مربوط به مودال حذف
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  
  const [addressMessage, setAddressMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // استیت‌های ویرایش آدرس
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | "">("");
  const [addressForm, setAddressForm] = useState({ 
    title: "", state: "", city: "", fullAddress: "", postalCode: "" 
  });

  const cityOptions = useMemo(() => {
    if (!selectedProvinceId || typeof iranCity.citiesOfProvince !== 'function') return [];
    return iranCity.citiesOfProvince(selectedProvinceId).map((c: any) => ({
      label: c.name,
      value: c.name
    }));
  }, [selectedProvinceId]);

  useEffect(() => {
    if (activeTab === "addresses") fetchAddresses();
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

  // ذخیره آدرس جدید یا ویرایش آدرس قبلی
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAddress(true);
    setAddressMessage(null);

    try {
      const method = editingAddressId ? "PUT" : "POST";
      const payload = editingAddressId 
        ? { ...addressForm, id: editingAddressId } 
        : addressForm;

      const res = await fetch("/api/user/addresses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطایی رخ داده است");

      setAddressMessage({ 
        type: "success", 
        text: editingAddressId ? "آدرس با موفقیت ویرایش شد!" : "آدرس با موفقیت ثبت شد!" 
      });

      // ریست فرم
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

  // تایید حذف آدرس از طریق مودال
  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    
    setIsDeletingId(addressToDelete);
    setAddressMessage(null);

    try {
      const res = await fetch(`/api/user/addresses?id=${addressToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در حذف آدرس");

      setAddresses(addresses.filter(addr => addr.id !== addressToDelete));
      setAddressMessage({ type: "success", text: "آدرس با موفقیت حذف شد!" });

      if (editingAddressId === addressToDelete) {
        cancelEditing();
      }
    } catch (error: any) {
      setAddressMessage({ type: "error", text: error.message });
    } finally {
      setIsDeletingId(null);
      setAddressToDelete(null); // بستن مودال
    }
  };

  // فعال کردن حالت ویرایش روی یک آدرس خاص
  const startEditing = (addr: any) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      title: addr.title,
      state: addr.state,
      city: addr.city,
      fullAddress: addr.fullAddress,
      postalCode: addr.postalCode,
    });

    const foundProvince = provincesList.find((p: any) => p.name === addr.state);
    if (foundProvince) {
      setSelectedProvinceId(foundProvince.id);
    } else {
      setSelectedProvinceId("");
    }

    document.getElementById("address-form-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // لغو حالت ویرایش
  const cancelEditing = () => {
    setEditingAddressId(null);
    setAddressForm({ title: "", state: "", city: "", fullAddress: "", postalCode: "" });
    setSelectedProvinceId("");
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
          <button onClick={() => { setActiveTab("info"); cancelEditing(); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === "info" ? "bg-gold text-primary-foreground shadow-md" : "text-foreground/80 hover:bg-secondary"}`}>
            <User className="size-4" /> اطلاعات حساب
          </button>
          
          <button onClick={() => setActiveTab("addresses")} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === "addresses" ? "bg-gold text-primary-foreground shadow-md" : "text-foreground/80 hover:bg-secondary"}`}>
            <MapPin className="size-4" /> آدرس‌های من
          </button>

          <button onClick={() => { setActiveTab("orders"); cancelEditing(); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === "orders" ? "bg-gold text-primary-foreground shadow-md" : "text-foreground/80 hover:bg-secondary"}`}>
            <ShoppingBag className="size-4" /> سفارشات من
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

            {/* لیست آدرس‌ها */}
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
                    
                    {/* دکمه‌های کنترل آدرس (ویرایش و باز کردن مودال حذف) */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => startEditing(addr)} 
                        className="p-1.5 text-foreground/70 hover:text-gold hover:bg-secondary rounded-lg transition-all"
                        title="ویرایش آدرس"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setAddressToDelete(addr.id)} 
                        disabled={isDeletingId === addr.id}
                        className="p-1.5 text-foreground/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                        title="حذف آدرس"
                      >
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
                  <button 
                    type="button" 
                    onClick={cancelEditing} 
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-bold bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    <X className="size-3" />
                    انصراف از ویرایش
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
                  <label className="text-sm font-semibold text-foreground">کد پستی (الزامی - ۱۰ رقمی)</label>
                  <input 
                    type="text" 
                    maxLength={10} 
                    minLength={10} 
                    value={addressForm.postalCode} 
                    onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})} 
                    placeholder="مثال: 1234567890" 
                    className="w-full p-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold transition-all text-right" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">آدرس پستی دقیق</label>
                <textarea rows={3} value={addressForm.fullAddress} onChange={(e) => setAddressForm({...addressForm, fullAddress: e.target.value})} placeholder="نام خیابان، کوچه، پلاک، واحد..." className="w-full p-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold transition-all resize-none text-right" required></textarea>
              </div>

              <div className="flex justify-end pt-2 gap-3">
                {editingAddressId && (
                  <Button 
                    type="button" 
                    onClick={cancelEditing} 
                    className="w-full md:w-auto px-6 py-6 text-base bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-all font-bold"
                  >
                    انصراف
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isSubmittingAddress || !addressForm.fullAddress.trim() || !addressForm.state || !addressForm.city || addressForm.postalCode.length !== 10} 
                  className="w-full md:w-auto px-8 py-6 text-base bg-gold text-primary-foreground hover:bg-gold-soft rounded-xl transition-all font-bold"
                >
                  {isSubmittingAddress ? "در حال پردازش..." : editingAddressId ? "بروزرسانی آدرس" : "ذخیره آدرس"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* تب سفارشات */}
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

      {/* مودال تایید حذف آدرس */}
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
                  آیا از حذف این آدرس اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-8">
              <Button
                type="button"
                onClick={() => setAddressToDelete(null)}
                className="flex-1 p-6 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl font-bold"
                disabled={isDeletingId === addressToDelete}
              >
                انصراف
              </Button>
              <Button
                type="button"
                onClick={confirmDeleteAddress}
                className="flex-1 p-6 bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold"
                disabled={isDeletingId === addressToDelete}
              >
                {isDeletingId === addressToDelete ? "در حال حذف..." : "بله، حذف کن"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}