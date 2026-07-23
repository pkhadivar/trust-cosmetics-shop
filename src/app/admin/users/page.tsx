import { prisma } from "@/lib/prisma";
import { UserSearchFilter } from "./UserSearchFilter";
import { Pagination } from "@/components/shared/Pagination";
import { UserActionsClient } from "./UserActionsClient";
import { Role } from "@prisma/client";
import { Shield, User as UserIcon, MapPin, ShoppingBag } from "lucide-react";
import Image from "next/image";

const ITEMS_PER_PAGE = 10;

export default async function AdminUsersPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await searchParams;
  
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const roleParam = typeof resolvedParams.role === 'string' ? resolvedParams.role : undefined;
  
  const parsedPage = typeof resolvedParams.page === 'string' ? Number(resolvedParams.page) : 1;
  const currentPage = (isNaN(parsedPage) || parsedPage < 1) ? 1 : parsedPage;

  // ساخت شرط دیتابیس برای جستجو و فیلتر
  const whereClause: any = {};

  if (q) {
    whereClause.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (roleParam && roleParam !== 'ALL') {
    whereClause.role = roleParam as Role;
  }

  // دریافت همزمان تعداد کل و لیست کاربران همراه با آدرس‌ها و آمار
  const [totalUsersCount, users] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      orderBy: { createdAt: 'desc' },
      include: {
        addresses: true, // دریافت آدرس‌ها برای نمایش در مودال
        _count: {
          select: { orders: true, addresses: true, savedProducts: true }
        }
      }
    })
  ]);

  const totalPages = Math.ceil(totalUsersCount / ITEMS_PER_PAGE);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">مدیریت کاربران</h1>
        <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-xl border border-border">
          تعداد کل: <strong className="text-gold">{totalUsersCount.toLocaleString('fa-IR')}</strong> کاربر
        </div>
      </div>

      {/* کامپوننت فیلتر و جستجو */}
      <UserSearchFilter />

      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-2xl flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-right text-sm">
            <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="p-5 font-medium whitespace-nowrap">کاربر</th>
                <th className="p-5 font-medium whitespace-nowrap">اطلاعات تماس</th>
                <th className="p-5 font-medium whitespace-nowrap text-center">نقش</th>
                <th className="p-5 font-medium whitespace-nowrap text-center">آمار فعالیت</th>
                <th className="p-5 font-medium whitespace-nowrap">تاریخ عضویت</th>
                <th className="p-5 font-medium whitespace-nowrap text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/10 transition-colors">
                  
                  {/* تصویر و نام کاربر */}
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/80 border border-border rounded-full overflow-hidden flex items-center justify-center shrink-0">
                        {user.image ? (
                          <Image src={user.image} alt={user.name || "User"} width={40} height={40} className="object-cover" />
                        ) : (
                          <UserIcon className="size-5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-bold text-foreground">
                        {user.name || 'کاربر بدون نام'}
                      </span>
                    </div>
                  </td>

                  {/* اطلاعات تماس */}
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      {user.phone ? (
                        <span className="text-foreground font-mono" dir="ltr">{user.phone}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">بدون شماره</span>
                      )}
                      
                      {user.email ? (
                        <span className="text-muted-foreground text-xs" dir="ltr">{user.email}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">بدون ایمیل</span>
                      )}
                    </div>
                  </td>

                  {/* نقش کاربری */}
                  <td className="p-5 text-center">
                    {user.role === "ADMIN" ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-bold">
                        <Shield className="size-3.5" /> مدیر
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary text-muted-foreground border border-border rounded-full text-xs font-bold">
                        <UserIcon className="size-3.5" /> مشتری
                      </div>
                    )}
                  </td>

                  {/* آمار فعالیت با Tooltip حرفه‌ای */}
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-4 text-xs">
                      
                      {/* آیکون سفارشات */}
                      <div className="group relative flex flex-col items-center text-muted-foreground cursor-help">
                        <ShoppingBag className="size-4 mb-1 text-gold" />
                        <span className="font-bold text-foreground">{user._count.orders}</span>
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0a0f1c] border border-border text-white text-[11px] py-1 px-2.5 rounded-lg whitespace-nowrap pointer-events-none z-10 shadow-xl">
                          تعداد سفارشات
                        </div>
                      </div>

                      {/* آیکون آدرس‌ها */}
                      <div className="group relative flex flex-col items-center text-muted-foreground cursor-help">
                        <MapPin className="size-4 mb-1 text-blue-400" />
                        <span className="font-bold text-foreground">{user._count.addresses}</span>
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0a0f1c] border border-border text-white text-[11px] py-1 px-2.5 rounded-lg whitespace-nowrap pointer-events-none z-10 shadow-xl">
                          تعداد آدرس‌ها
                        </div>
                      </div>

                    </div>
                  </td>

                  {/* تاریخ عضویت */}
                  <td className="p-5 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                  </td>

                  {/* دکمه‌های عملیات */}
                  <td className="p-5">
                    <div className="flex items-center justify-center">
                      <UserActionsClient user={user} />
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    کاربری با این مشخصات یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* کامپوننت عمومی صفحه‌بندی */}
        <Pagination totalPages={totalPages} currentPage={currentPage} />

      </div>
    </div>
  );
}