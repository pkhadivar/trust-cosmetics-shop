import { prisma } from "@/lib/prisma";
import { Package, ShoppingBag, DollarSign, Users } from "lucide-react";

export default async function AdminDashboardPage() {
  // ۱. کل محصولات (تمام محصولاتی که در دیتابیس ثبت شده‌اند)
  const totalProducts = await prisma.product.count();

  // ۲. سفارشات جدید (سفارشاتی که وضعیت آن‌ها PENDING یا "در انتظار" است)
  const newOrdersCount = await prisma.order.count({
    where: { status: 'PENDING' }
  });

  // ۳. محاسبه درآمد ماه جاری (فقط سفارشات پرداخت شده یا ارسال شده در این ماه)
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // روز اول ماه جاری

  const currentMonthOrders = await prisma.order.aggregate({
    _sum: {
      totalAmount: true
    },
    where: {
      createdAt: {
        gte: firstDayOfMonth // تاریخ ثبت سفارش بزرگتر یا مساوی روز اول ماه باشد
      },
      status: {
        in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] // فقط سفارشات موفق
      }
    }
  });
  
  const currentMonthRevenue = currentMonthOrders._sum.totalAmount || 0;

  // ۴. گزارش اضافه: تعداد کل مشتریان (کاربران با نقش USER)
  const totalUsers = await prisma.user.count({
    where: { role: 'USER' }
  });

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold text-foreground mb-8 text-right">
        خلاصه وضعیت فروشگاه
      </h1>

      {/* گرید کارت‌های آماری */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" dir="rtl">
        
        {/* کارت 1: کل محصولات */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">کل محصولات</span>
            <div className="p-2 bg-secondary/50 rounded-lg">
              <Package className="size-5 text-gold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gold">
              {totalProducts.toLocaleString("fa-IR")}
            </span>
          </div>
        </div>

        {/* کارت 2: سفارشات جدید */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">سفارشات جدید (در انتظار)</span>
            <div className="p-2 bg-secondary/50 rounded-lg">
              <ShoppingBag className="size-5 text-gold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gold">
              {newOrdersCount.toLocaleString("fa-IR")}
            </span>
          </div>
        </div>

        {/* کارت 3: درآمد ماه جاری */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">درآمد ماه جاری</span>
            <div className="p-2 bg-secondary/50 rounded-lg">
              <DollarSign className="size-5 text-gold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gold">
              {currentMonthRevenue.toLocaleString("fa-IR")}
            </span>
            <span className="text-sm text-muted-foreground">تومان</span>
          </div>
        </div>

        {/* کارت 4: کل مشتریان (گزارش جدید) */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">کل مشتریان ثبت‌نامی</span>
            <div className="p-2 bg-secondary/50 rounded-lg">
              <Users className="size-5 text-gold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gold">
              {totalUsers.toLocaleString("fa-IR")}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}