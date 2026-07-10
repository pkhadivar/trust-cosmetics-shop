import React from 'react';
import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm'; // <-- تغییر مهم: ایمپورت فرم جدید
import { prisma } from '@/lib/prisma';

export default async function NewProductPage() {
  // دریافت لیست دسته‌بندی‌ها از دیتابیس
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/products" className="text-slate-400 hover:text-gold transition-colors flex items-center gap-2">
          <span>&rarr;</span>
          <span>بازگشت به لیست</span>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mr-4">افزودن محصول جدید</h1>
      </div>

      {/* <-- تغییر مهم: استفاده از فرم جدید و هوشمند */}
      <ProductForm categories={categories} />
    </div>
  );
}