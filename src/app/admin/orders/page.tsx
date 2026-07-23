import { prisma } from "@/lib/prisma";
import { OrderActionsClient } from "./OrderActionsClient";
import { OrderSearchFilter } from "./OrderSearchFilter";
import { Pagination } from "@/components/shared/Pagination";
import { OrderStatus } from "@prisma/client";

const ITEMS_PER_PAGE = 10; // 🌟 تعداد سفارش در هر صفحه (می‌توانید تغییر دهید)

export default async function AdminOrdersPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const statusParam = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;
  
  // 🌟 استخراج شماره صفحه از URL (پیش‌فرض صفحه 1)
// دریافت شماره صفحه و تبدیل آن به عدد
const parsedPage = typeof resolvedParams.page === 'string' ? Number(resolvedParams.page) : 1;

// جلوگیری از باگ: اگر عدد نامعتبر، صفر یا منفی بود، همیشه صفحه 1 را در نظر بگیر
const currentPage = (isNaN(parsedPage) || parsedPage < 1) ? 1 : parsedPage;

  // ساخت شرط دیتابیس
  const whereClause: any = {};

  if (q) {
    whereClause.OR = [
      { id: { contains: q, mode: 'insensitive' } },
      { customerName: { contains: q, mode: 'insensitive' } },
      { customerPhone: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (statusParam && statusParam !== 'ALL') {
    whereClause.status = statusParam as OrderStatus;
  }

  // 🌟 واکشی همزمانِ لیست سفارشات و تعداد کل سفارشات (برای سرعت بالا)
  const [totalOrdersCount, orders] = await Promise.all([
    prisma.order.count({ where: whereClause }),
    prisma.order.findMany({
      where: whereClause,
      take: ITEMS_PER_PAGE, // فقط 10 تا بگیر
      skip: (currentPage - 1) * ITEMS_PER_PAGE, // رد کردن صفحات قبلی
      include: {
        user: true, 
        items: {
          include: {
            product: true 
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  // محاسبه تعداد کل صفحات
  const totalPages = Math.ceil(totalOrdersCount / ITEMS_PER_PAGE);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">مدیریت سفارشات</h1>

      <OrderSearchFilter />

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
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
                    <OrderActionsClient order={order} />
                  </td>
                </tr>

                
              ))}
              
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    با این فیلترها سفارشی یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🌟 نمایش دکمه‌های صفحه‌بندی در پایین جدول */}
        <Pagination totalPages={totalPages} currentPage={currentPage} />
        
      </div>
    </div>
  );
}