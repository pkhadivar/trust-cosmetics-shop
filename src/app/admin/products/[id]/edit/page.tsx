import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';
import { getBrands } from "@/actions/brand";

// توجه کنید که تایپِ params به Promise تغییر کرده است
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // اینجا params را await می‌کنیم تا مقادیرش در دسترس قرار بگیرد
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const categories = await prisma.category.findMany();
  
  // دریافت لیست تمام برچسب‌ها برای نمایش در فرم
  const tags = await prisma.tag.findMany();
  
  // دریافت اطلاعات محصول به همراه تگ‌ها، مشخصات فنی و سوالات متداول
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { 
      tags: true,
      attributes: true, // <--- واکشی جدول مشخصات فنی اضافه شد
      faqs: true        // <--- واکشی جدول سوالات متداول اضافه شد
    }
  });
  const brands = await getBrands();

  if (!product) return <div className="p-8 text-center text-foreground">محصول یافت نشد</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-foreground">ویرایش محصول: {product.title}</h1>
      <ProductForm categories={categories} tags={tags} initialData={product} brands={brands} />
    </div>
  );
}