import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { ProductSearchFilter } from "./ProductSearchFilter";
import { Pagination } from "@/components/shared/Pagination";

const ITEMS_PER_PAGE = 10; // تعداد محصول در هر صفحه

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "";
  // استخراج فیلترها از URL
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;
  const categoryId =
    typeof resolvedParams.categoryId === "string"
      ? resolvedParams.categoryId
      : undefined;
  const isAvailableParam =
    typeof resolvedParams.isAvailable === "string"
      ? resolvedParams.isAvailable
      : undefined;

  // استخراج و اعتبارسنجی شماره صفحه
  const parsedPage =
    typeof resolvedParams.page === "string" ? Number(resolvedParams.page) : 1;
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  // ساخت شرط دیتابیس (Filter)
  const whereClause: any = {};

  if (q) {
    whereClause.title = { contains: q, mode: "insensitive" };
  }

  if (categoryId && categoryId !== "ALL") {
    whereClause.categoryId = categoryId;
  }

  if (isAvailableParam && isAvailableParam !== "ALL") {
    whereClause.isAvailable = isAvailableParam === "TRUE";
  }

  // دریافت همزمان داده‌ها برای سرعت بالا
  const [totalProductsCount, products, categories] = await Promise.all([
    prisma.product.count({ where: whereClause }), // شمارش کل محصولات فیلتر شده
    prisma.product.findMany({
      where: whereClause,
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.category.findMany({ select: { id: true, name: true } }), // برای دراپ‌داون فیلتر
  ]);

  const totalPages = Math.ceil(totalProductsCount / ITEMS_PER_PAGE);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">مدیریت محصولات</h1>
        <Link
          href="/admin/products/new"
          className="bg-gold text-[#0a0f1c] px-6 py-2 rounded-xl font-bold hover:bg-yellow-400 transition-colors"
        >
          + افزودن محصول جدید
        </Link>
      </div>

      {/* کامپوننت فیلتر و جستجو */}
      <ProductSearchFilter categories={categories} />

      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-2xl flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-right text-sm">
            <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="p-5 font-medium whitespace-nowrap">تصویر</th>
                <th className="p-5 font-medium whitespace-nowrap">نام محصول</th>
                <th className="p-5 font-medium whitespace-nowrap">دسته‌بندی</th>
                <th className="p-5 font-medium whitespace-nowrap">
                  قیمت (تومان)
                </th>
                <th className="p-5 font-medium whitespace-nowrap text-center">
                  وضعیت
                </th>
                <th className="p-5 font-medium whitespace-nowrap text-center">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products.map((product) => {
                const rawImage = product.images[0];
                const imgSrc = rawImage
                  ? rawImage.startsWith("http")
                    ? rawImage
                    : `${baseUrl}/${rawImage}`
                  : "/placeholder.jpg";
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-secondary/10 transition-colors"
                  >
                    <td className="p-4">
                      <div className="w-14 h-14 bg-[#050810] border border-border rounded-xl overflow-hidden flex items-center justify-center p-1 shrink-0">
                        <img
                          src={product.images[0] || "/placeholder.jpg"}
                          className="w-full h-full object-contain"
                          alt={product.title}
                        />
                      </div>
                    </td>
                    <td
                      className="p-5 font-bold text-foreground max-w-[250px] truncate"
                      title={product.title}
                    >
                      {product.title}
                    </td>
                    <td className="p-5 text-muted-foreground">
                      {product.category?.name || "بدون دسته"}
                    </td>
                    <td className="p-5 font-bold text-gold">
                      {product.price.toLocaleString("fa-IR")}
                    </td>
                    <td className="p-5 text-center">
                      {product.isAvailable ? (
                        <span className="text-xs px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full font-medium">
                          موجود
                        </span>
                      ) : (
                        <span className="text-xs px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-medium">
                          ناموجود
                        </span>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 px-4 py-2 rounded-lg transition-colors"
                        >
                          ویرایش
                        </Link>

                        <DeleteProductButton
                          id={product.id}
                          title={product.title}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-muted-foreground"
                  >
                    محصولی با این مشخصات یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* کامپوننت صفحه‌بندی */}
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}
