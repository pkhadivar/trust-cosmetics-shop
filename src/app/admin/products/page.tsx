import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DeleteProductButton from '@/components/admin/DeleteProductButton';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">مدیریت محصولات</h1>
        <Link href="/admin/products/new" className="bg-gold text-[#0a0f1c] px-6 py-2 rounded-xl font-bold hover:bg-yellow-400">
          + افزودن محصول جدید
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
        <table className="w-full text-right">
          <thead className="bg-white/5 border-b border-border text-gold">
            <tr>
              <th className="p-4">تصویر</th>
              <th className="p-4">نام محصول</th>
              <th className="p-4">قیمت (تومان)</th>
              <th className="p-4">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-white/5">
                <td className="p-4">
                  <img src={product.images[0]} className="w-12 h-12 rounded-lg object-cover" alt={product.title} />
                </td>
                <td className="p-4">{product.title}</td>
                <td className="p-4">{product.price.toLocaleString('fa-IR')}</td>
                <td className="p-4 flex gap-3">
                  {/* دکمه ویرایش (هدایت به صفحه ویرایش) */}
                  <Link href={`/admin/products/${product.id}/edit`} className="text-blue-400 hover:text-blue-300 text-sm">
                    ویرایش
                  </Link>
                  
                  {/* دکمه حذف (فرمِ سرور اکشن) */}
                  <DeleteProductButton id={product.id} title={product.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}