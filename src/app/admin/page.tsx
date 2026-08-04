import { prisma } from "@/lib/prisma";
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CalendarClock
} from "lucide-react";

export default async function AdminDashboardPage() {
  // ۱. کل محصولات
  const totalProducts = await prisma.product.count();

  // 🌟 محصولات ناموجود یا غیرفعال (بر اساس isAvailable و stock)
  const unavailableProductsCount = await prisma.product.count({
    where: {
      OR: [
        { stock: 0 },
        { isAvailable: false }
      ]
    }
  });

  // ۲. سفارشات نیازمند بررسی (تغییر از PENDING به PAID)
  const actionRequiredOrdersCount = await prisma.order.count({
    where: { status: 'PAID' }
  });

  // ۳. تعداد سفارشات ثبت شده در امروز
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0); 
  const todaysOrdersCount = await prisma.order.count({
    where: { 
      createdAt: { gte: startOfToday } 
    }
  });

  // ۴. محاسبه درآمد ماه جاری
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const currentMonthOrders = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      createdAt: { gte: firstDayOfMonth },
      status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } 
    }
  });
  const currentMonthRevenue = currentMonthOrders._sum.totalAmount || 0;

  // ۵. تعداد کل کاربران سایت (بدون فیلتر Role)
  const totalUsers = await prisma.user.count();

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold text-foreground mb-8 text-right">
        خلاصه وضعیت فروشگاه
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" dir="rtl">
        
        {/* کارت 1: سفارشات نیازمند بررسی */}
        <div className="flex flex-col justify-between rounded-2xl border border-gold/30 bg-gold/5 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-gold"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-foreground">نیازمند بررسی (پرداخت شده)</span>
            <div className="p-2 bg-gold/20 rounded-lg">
              <ShoppingBag className="size-5 text-gold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gold">
              {actionRequiredOrdersCount.toLocaleString("fa-IR")}
            </span>
            {actionRequiredOrdersCount > 0 && (
              <span className="text-xs text-red-400 font-medium animate-pulse">
                نیاز به اقدام!
              </span>
            )}
          </div>
        </div>

        {/* کارت 2: محصولات ناموجود یا غیرفعال */}
        <div className="flex flex-col justify-between rounded-2xl border border-red-500/30 bg-red-500/5 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-foreground">محصولات غیرفعال یا موجودی صفر</span>
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="size-5 text-red-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-red-500">
              {unavailableProductsCount.toLocaleString("fa-IR")}
            </span>
            {unavailableProductsCount > 0 && (
              <span className="text-xs text-muted-foreground font-medium">
                نیاز به بررسی
              </span>
            )}
          </div>
        </div>

        {/* کارت 3: درآمد ماه جاری */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">درآمد کل ماه جاری</span>
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

        {/* کارت 4: سفارشات امروز */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">سفارشات ثبت شده امروز</span>
            <div className="p-2 bg-secondary/50 rounded-lg">
              <CalendarClock className="size-5 text-gold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {todaysOrdersCount.toLocaleString("fa-IR")}
            </span>
            <span className="text-sm text-muted-foreground">سفارش</span>
          </div>
        </div>

        {/* کارت 5: کل محصولات */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">تنوع کل محصولات</span>
            <div className="p-2 bg-secondary/50 rounded-lg">
              <Package className="size-5 text-gold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {totalProducts.toLocaleString("fa-IR")}
            </span>
            <span className="text-sm text-muted-foreground">کالا</span>
          </div>
        </div>

        {/* کارت 6: کل کاربران */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">کل کاربران سایت</span>
            <div className="p-2 bg-secondary/50 rounded-lg">
              <Users className="size-5 text-gold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {totalUsers.toLocaleString("fa-IR")}
            </span>
            <span className="text-sm text-muted-foreground">نفر</span>
          </div>
        </div>

      </div>
    </div>
  );
}