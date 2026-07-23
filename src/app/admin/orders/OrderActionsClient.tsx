"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction, deleteOrderAction } from "@/actions/order";
import { Loader2, Trash2, AlertCircle, Eye, Copy, CheckCircle2, X, MapPin, User, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  order: any; // دریافت کل آبجکت سفارش
};

const statusOptions = [
  { value: "PENDING", label: "در انتظار پرداخت" },
  { value: "PAID", label: "پرداخت شده" },
  { value: "PROCESSING", label: "در حال پردازش" },
  { value: "SHIPPED", label: "ارسال شده" },
  { value: "DELIVERED", label: "تحویل داده شده" },
  { value: "CANCELLED", label: "لغو شده" },
];

export function OrderActionsClient({ order }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  
  // استیت مودال‌ها
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // عملیات تغییر وضعیت
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    setStatus(newStatus);
    
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, newStatus);
      if (result.success) {
        toast.success("وضعیت سفارش بروزرسانی شد");
      } else {
        toast.error(result.error || "خطا در بروزرسانی");
        setStatus(order.status);
      }
    });
  };

  // عملیات حذف
  const confirmDelete = () => {
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteOrderAction(order.id);
      if (result.success) {
        toast.success("سفارش با موفقیت حذف شد");
        setShowDeleteModal(false);
      } else {
        toast.error(result.error || "خطا در حذف سفارش");
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    });
  };

  // عملیات کپی هوشمند
  const handleCopyOrderDetails = () => {
    let copyText = `🛒 سفارش جدید (کد: ${order.id.slice(-6).toUpperCase()})\n`;
    copyText += `👤 نام مشتری: ${order.customerName}\n`;
    copyText += `📱 شماره تماس: ${order.customerPhone}\n`;
    copyText += `📍 استان و شهر: ${order.shippingState} - ${order.shippingCity}\n`;
    copyText += `🏠 آدرس دقیق: ${order.shippingAddress}\n`;
    copyText += `📮 کد پستی: ${order.postalCode}\n\n`;
    copyText += `📦 لیست محصولات:\n`;
    
    order.items.forEach((item: any, index: number) => {
      copyText += `${index + 1}. ${item.product?.title || 'محصول حذف شده'} (تعداد: ${item.quantity} عدد)\n`;
    });

    navigator.clipboard.writeText(copyText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <>
      {/* دکمه‌های عملیاتی داخل جدول */}
      <div className="flex items-center justify-center gap-2">
        
        {/* دکمه مشاهده جزئیات */}
        <button
          onClick={() => setShowDetailsModal(true)}
          className="p-2 text-foreground bg-secondary/50 hover:bg-gold hover:text-black rounded-xl transition-all flex items-center justify-center"
          title="مشاهده جزئیات سفارش"
        >
          <Eye className="size-4" />
        </button>

        {/* منوی کشویی تغییر وضعیت */}
        <div className="relative inline-flex items-center justify-center">
          <select
            disabled={isPending || isDeleting}
            value={status}
            onChange={handleChange}
            className="appearance-none bg-background border border-border text-xs text-foreground font-medium py-2 pl-8 pr-4 rounded-xl focus:outline-none focus:border-gold transition-colors disabled:opacity-50 cursor-pointer text-center min-w-[130px]"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {isPending && !isDeleting && (
            <Loader2 className="absolute left-2 size-4 text-gold animate-spin pointer-events-none" />
          )}
        </div>

        {/* دکمه حذف سفارش */}
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={isPending || isDeleting}
          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
          title="حذف سفارش"
        >
          {isDeleting ? <Loader2 className="size-4 animate-spin text-red-500" /> : <Trash2 className="size-4" />}
        </button>
      </div>

      {/* ==================================================== */}
      {/* مودال ۱: جزئیات سفارش و خرید */}
      {/* ==================================================== */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-right">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShoppingBag className="size-5 text-gold" />
                جزئیات سفارش <span className="font-mono text-muted-foreground ml-2">#{order.id.slice(-8).toUpperCase()}</span>
              </h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="p-2 bg-secondary/50 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 bg-secondary/20 p-5 rounded-2xl border border-border/50">
                  <h4 className="font-bold text-gold flex items-center gap-2 mb-2"><User className="size-4" /> اطلاعات خریدار</h4>
                  <div className="text-sm space-y-2">
                    <p className="text-foreground"><span className="text-muted-foreground ml-1">نام:</span> {order.customerName}</p>
                    <p className="text-foreground"><span className="text-muted-foreground ml-1">شماره:</span> {order.customerPhone}</p>
                  </div>
                </div>

                <div className="space-y-4 bg-secondary/20 p-5 rounded-2xl border border-border/50">
                  <h4 className="font-bold text-gold flex items-center gap-2 mb-2"><MapPin className="size-4" /> اطلاعات ارسال</h4>
                  <div className="text-sm space-y-2">
                    <p className="text-foreground"><span className="text-muted-foreground ml-1">استان/شهر:</span> {order.shippingState} - {order.shippingCity}</p>
                    <p className="text-foreground leading-relaxed"><span className="text-muted-foreground ml-1">آدرس:</span> {order.shippingAddress}</p>
                    <p className="text-foreground"><span className="text-muted-foreground ml-1">کد پستی:</span> {order.postalCode}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-foreground border-b border-border/50 pb-2">محصولات خریداری شده</h4>
                <div className="flex flex-col gap-3">
                  {order.items.map((item: any, idx: number) => (
                    <div key={item.id} className="flex items-center justify-between bg-secondary/10 p-3 rounded-xl border border-border/30">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground font-bold w-4">{idx + 1}.</span>
                        <span className="text-sm font-bold text-foreground">{item.product?.title || 'محصول حذف شده'}</span>
                      </div>
                      <div className="text-sm font-bold bg-gold/10 text-gold px-3 py-1 rounded-lg">
                        {item.quantity} عدد
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleCopyOrderDetails}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all ${
                    isCopied ? "bg-green-500 text-white" : "bg-gold hover:bg-yellow-500 text-[#0a0f1c]"
                  }`}
                >
                  {isCopied ? <><CheckCircle2 className="size-5" /> کپی شد!</> : <><Copy className="size-5" /> کپی اطلاعات برای خرید از سایت مرجع</>}
                </button>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="px-8 py-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl font-bold transition-colors"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* مودال ۲: تایید حذف سفارش */}
      {/* ==================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 transition-all">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border-4 border-red-500/5">
                <AlertCircle className="size-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">حذف دائم سفارش</h3>
                <p className="text-sm text-muted-foreground px-2">
                  آیا از حذف کامل این سفارش اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-8">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl font-bold transition-all"
                disabled={isDeleting}
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-3.5 bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? <><Loader2 className="size-4 animate-spin" /> پردازش...</> : "بله، حذف کن"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}