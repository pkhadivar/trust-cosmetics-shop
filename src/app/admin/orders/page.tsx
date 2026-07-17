import { prisma } from "@/lib/prisma";
import { OrderStatusClient } from "./OrderStatusClient"; // کامپوننتی که در ادامه همین فایل می‌نویسیم

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: true, // دریافت اطلاعات کاربری که سفارش داده
      items: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">مدیریت سفارشات</h1>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-sm">
            <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="p-5 font-medium whitespace-nowrap">شماره سفارش</th>
                <th className="p-5 font-medium whitespace-nowrap">مشتری</th>
                <th className="p-5 font-medium whitespace-nowrap">تاریخ ثبت</th>
                <th className="p-5 font-medium whitespace-nowrap">مبلغ کل (تومان)</th>
                <th className="p-5 font-medium whitespace-nowrap">وضعیت پرداخت</th>
                <th className="p-5 font-medium whitespace-nowrap text-center">عملیات / تغییر وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="p-5 font-mono font-medium text-foreground">
                    {order.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{order.customerName || 'کاربر مهمان'}</span>
                      <span className="text-xs text-muted-foreground mt-1">{order.customerPhone}</span>
                    </div>
                  </td>
                  <td className="p-5 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="p-5 font-bold text-gold">
                    {order.totalAmount.toLocaleString('fa-IR')}
                  </td>
                  <td className="p-5">
                    {order.status === "PENDING" ? (
                      <span className="text-xs px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full">پرداخت نشده</span>
                    ) : (
                      <span className="text-xs px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full">موفق</span>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    {/* فراخوانی کامپوننت تغییر وضعیت */}
                    <OrderStatusClient orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              ))}
              
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    هیچ سفارشی در سیستم ثبت نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}