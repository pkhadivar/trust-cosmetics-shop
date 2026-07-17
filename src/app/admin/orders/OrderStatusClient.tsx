"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction, deleteOrderAction } from "@/actions/order";
import { Loader2, Trash2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  orderId: string;
  currentStatus: OrderStatus;
};

const statusOptions = [
  { value: "PENDING", label: "در انتظار پرداخت" },
  { value: "PAID", label: "پرداخت شده" },
  { value: "PROCESSING", label: "در حال پردازش" },
  { value: "SHIPPED", label: "ارسال شده" },
  { value: "DELIVERED", label: "تحویل داده شده" },
  { value: "CANCELLED", label: "لغو شده" },
];

export function OrderStatusClient({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  
  // استیت مربوط به باز و بسته شدن مودال حذف
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    setStatus(newStatus);
    
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus);
      if (result.success) {
        toast.success("وضعیت سفارش بروزرسانی شد");
      } else {
        toast.error(result.error || "خطا در بروزرسانی");
        setStatus(currentStatus);
      }
    });
  };

  const confirmDelete = () => {
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteOrderAction(orderId);
      if (result.success) {
        toast.success("سفارش با موفقیت حذف شد");
        setShowDeleteModal(false); // بستن مودال پس از موفقیت
      } else {
        toast.error(result.error || "خطا در حذف سفارش");
        setIsDeleting(false); // خروج دکمه از حالت لودینگ
        setShowDeleteModal(false); // بستن مودال در صورت خطا
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        {/* منوی کشویی تغییر وضعیت */}
        <div className="relative inline-flex items-center justify-center">
          <select
            disabled={isPending || isDeleting}
            value={status}
            onChange={handleChange}
            className="appearance-none bg-background border border-border text-xs text-foreground font-medium py-2 pl-8 pr-4 rounded-xl focus:outline-none focus:border-gold transition-colors disabled:opacity-50 cursor-pointer text-center min-w-[140px]"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          
          {isPending && !isDeleting && (
            <Loader2 className="absolute left-2 size-4 text-gold animate-spin pointer-events-none" />
          )}
        </div>

        {/* دکمه باز کردن مودال حذف */}
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={isPending || isDeleting}
          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
          title="حذف سفارش"
        >
          {isDeleting ? (
            <Loader2 className="size-4 animate-spin text-red-500" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
      </div>

      {/* مودال تایید حذف اختصاصی */}
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
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    در حال پردازش
                  </>
                ) : (
                  "بله، حذف کن"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}