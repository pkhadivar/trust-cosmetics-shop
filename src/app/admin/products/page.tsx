import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminProductsPage() {
  // دریافت لیست محصولات از دیتابیس به همراه نام دسته‌بندی آن‌ها
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });

  return (
    <div>
      {/* هدر صفحه */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">مدیریت محصولات</h1>
        <Link 
          href="/admin/products/new" 
          className="bg-gold text-[#0a0f1c] px-6 py-2 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]"
        >
          + افزودن محصول جدید
        </Link>
      </div>

      {/* جدول محصولات */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-white/5 border-b border-border text-gold">
              <tr>
                <th className="p-4 font-semibold">تصویر</th>
                <th className="p-4 font-semibold">نام محصول</th>
                <th className="p-4 font-semibold">دسته‌بندی</th>
                <th className="p-4 font-semibold">قیمت (تومان)</th>
                <th className="p-4 font-semibold">موجودی</th>
                <th className="p-4 font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    هنوز هیچ محصولی ثبت نشده است.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      {/* نمایش یک تصویر پیش‌فرض اگر عکسی نبود */}
                      <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                        {product.images[0] ? (
                           // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-500">بدون عکس</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground">{product.title}</td>
                    <td className="p-4 text-slate-400">{product.category?.name || 'بدون دسته'}</td>
                    <td className="p-4 text-slate-300">{product.price.toLocaleString('fa-IR')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {product.stock > 0 ? product.stock : 'ناموجود'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-blue-400 hover:text-blue-300 ml-3 text-sm">ویرایش</button>
                      <button className="text-red-400 hover:text-red-300 text-sm">حذف</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}