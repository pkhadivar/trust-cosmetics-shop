"use client";

import { useState, useTransition } from "react";
import { Role } from "@prisma/client";
import { updateUserRoleAction } from "@/actions/user";
import { Eye, X, ShieldAlert, User as UserIcon, MapPin, Phone, Mail, Calendar, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function UserActionsClient({ user }: { user: any }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  
  const [isPending, startTransition] = useTransition();

  // زمانی که ادمین نقش جدیدی را انتخاب می‌کند
  const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    if (newRole !== user.role) {
      setPendingRole(newRole);
      setShowWarningModal(true); // نمایش مودال هشدار
    }
  };

  // تایید نهایی و ارسال درخواست به سرور
  const confirmRoleChange = () => {
    if (!pendingRole) return;
    
    startTransition(async () => {
      const result = await updateUserRoleAction(user.id, pendingRole);
      
      if (result.success) {
        toast.success("نقش کاربر با موفقیت تغییر کرد!");
        setShowWarningModal(false);
      } else {
        toast.error(result.error || "خطا در تغییر نقش");
      }
    });
  };

  // انصراف از تغییر نقش
  const cancelRoleChange = () => {
    setPendingRole(null);
    setShowWarningModal(false);
  };

  return (
    <>
      {/* دکمه اصلی در جدول */}
      <button 
        onClick={() => setShowDetailsModal(true)}
        className="text-sm font-medium text-foreground bg-secondary/50 hover:bg-gold hover:text-black px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
      >
        <Eye className="size-4" /> مشاهده جزئیات
      </button>

      {/* ==================================================== */}
      {/* مودال ۱: جزئیات کامل کاربر (شامل آدرس‌ها) */}
      {/* ==================================================== */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-right">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* هدر مودال */}
            <div className="border-b border-border p-5 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UserIcon className="size-5 text-gold" />
                پرونده مشتری
              </h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="p-2 bg-secondary/50 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* بدنه مودال */}
            <div className="p-6 space-y-6">
              
              {/* اطلاعات هویتی */}
              <div className="flex items-center gap-4 bg-secondary/20 p-4 rounded-2xl border border-border/50">
                <div className="w-16 h-16 bg-secondary border border-border rounded-full flex items-center justify-center shrink-0">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserIcon className="size-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-foreground">{user.name || "کاربر بدون نام"}</h4>
                  <span className="text-xs text-muted-foreground font-mono mt-1 block">ID: {user.id}</span>
                </div>
              </div>

              {/* اطلاعات تماس */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-foreground bg-secondary/10 p-3 rounded-xl">
                  <Phone className="size-4 text-muted-foreground" />
                  <span dir="ltr">{user.phone || "ثبت نشده"}</span>
                </div>
                <div className="flex items-center gap-3 text-foreground bg-secondary/10 p-3 rounded-xl">
                  <Mail className="size-4 text-muted-foreground" />
                  <span dir="ltr">{user.email || "ثبت نشده"}</span>
                </div>
                <div className="flex items-center gap-3 text-foreground bg-secondary/10 p-3 rounded-xl">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>عضویت: {new Date(user.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>

              {/* بخش آدرس‌های کاربر */}
              <div className="pt-6 border-t border-border">
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="size-4 text-gold" /> آدرس‌های ثبت‌شده
                </h4>
                
                {user.addresses && user.addresses.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {user.addresses.map((addr: any) => (
                      <div key={addr.id} className="bg-secondary/10 p-4 rounded-xl border border-border/50 text-sm transition-colors hover:border-gold/30">
                        <div className="font-bold text-gold mb-1">{addr.title}</div>
                        <div className="text-foreground font-medium mb-1">
                          {addr.state} - {addr.city}
                        </div>
                        <div className="text-muted-foreground text-xs leading-relaxed">
                          {addr.fullAddress}
                        </div>
                        <div className="text-muted-foreground text-xs mt-2 font-mono flex items-center gap-1 bg-background/50 w-fit px-2 py-1 rounded">
                          کد پستی: {addr.postalCode}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground bg-secondary/10 p-5 rounded-xl border border-dashed border-border text-center">
                    هیچ آدرسی برای این کاربر ثبت نشده است.
                  </div>
                )}
              </div>

              {/* تغییر نقش کاربری */}
              <div className="pt-6 border-t border-border">
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <ShieldAlert className="size-4 text-gold" /> تغییر سطح دسترسی
                </h4>
                <select
                  disabled={isPending}
                  value={pendingRole || user.role}
                  onChange={handleRoleSelect}
                  className="w-full appearance-none bg-background border border-border text-sm text-foreground py-3 px-4 rounded-xl focus:outline-none focus:border-gold transition-colors cursor-pointer"
                >
                  <option value="USER">کاربر عادی (مشتری)</option>
                  <option value="ADMIN">مدیر سیستم (دسترسی کامل)</option>
                </select>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* مودال ۲: هشدار امنیتی تغییر نقش */}
      {/* ==================================================== */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 transition-all">
          <div className="bg-card border border-red-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border-4 border-red-500/5">
                <ShieldAlert className="size-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-red-500">هشدار امنیتی حساس!</h3>
                <p className="text-sm text-muted-foreground px-2 leading-relaxed">
                  آیا از تغییر نقش این کاربر به <strong className="text-foreground">{pendingRole === "ADMIN" ? "مدیر سیستم" : "کاربر عادی"}</strong> اطمینان دارید؟ 
                  {pendingRole === "ADMIN" && (
                    <span className="block mt-2 text-red-400">
                      این کاربر به تمام بخش‌های مدیریت، سفارشات و مالی دسترسی پیدا خواهد کرد!
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-8">
              <button
                type="button"
                onClick={cancelRoleChange}
                className="flex-1 py-3.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl font-bold transition-all"
                disabled={isPending}
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={confirmRoleChange}
                className="flex-1 py-3.5 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                disabled={isPending}
              >
                {isPending ? (
                  <><Loader2 className="size-4 animate-spin" /> در حال پردازش</>
                ) : (
                  "تایید و تغییر نقش"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}