import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { SiteNavbar } from '@/components/site-navbar';
import { SiteFooter } from '@/components/site-footer';
import { ProductCard } from '@/components/product-card';
import { ShopFilters } from '@/components/shop/shop-filters';
import { ShopSort } from '@/components/shop/shop-sort';

export default async function ShopPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await searchParams;

  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const categoryId = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  const inStock = resolvedParams.inStock === 'true';
  const isDiscounted = resolvedParams.discount === 'true';
  const tagQuery = resolvedParams.tag;
  const tags = Array.isArray(tagQuery) ? tagQuery : typeof tagQuery === 'string' ? [tagQuery] : [];
  
  const sortParam = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'newest';

  const whereClause: any = {};
  
  if (q) {
    whereClause.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { subtitle: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (categoryId) {
    whereClause.categoryId = categoryId;
  }
  if (tags.length > 0) {
    whereClause.tags = { some: { name: { in: tags } } };
  }
  if (inStock) {
    whereClause.isAvailable = true;
  }
  if (isDiscounted) {
    whereClause.discountedPrice = { not: null };
  }

  let orderByClause: any = { createdAt: 'desc' };
  if (sortParam === 'price-asc') {
    orderByClause = { price: 'asc' };
  } else if (sortParam === 'price-desc') {
    orderByClause = { price: 'desc' };
  }

  const [categories, allTags, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.tag.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: { tags: true }
    })
  ]);

  const formattedProducts = products.map((product) => ({
    id: product.id,
    title: product.title,
    subtitle: product.subtitle,
    price: product.price,
    discountedPrice: product.discountedPrice,
    images: product.images,
    badge: product.tags?.[0]?.name || null,
    tags: product.tags.map(t => t.name),
    isAvailable: product.isAvailable, // 👈 فیلد وضعیت موجودی اضافه شد
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <div className="bg-card border-b border-border py-12 px-5">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            فروشگاه <span className="text-gold">تراست</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isDiscounted ? (
              <span className="text-gold font-medium">✨ مشاهده محصولات دارای تخفیف ویژه ✨</span>
            ) : (
              "محصولات مراقبتی و آرایشی با بالاترین کیفیت برای پوست و موی شما. با استفاده از فیلترهای زیر، محصول مورد نیاز خود را به راحتی پیدا کنید."
            )}
          </p>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-7xl w-full px-5 py-8 md:py-12 flex flex-col lg:flex-row gap-8">
        
        <ShopFilters categories={categories} tags={allTags} />

        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              نمایش <strong className="text-gold">{formattedProducts.length}</strong> محصول
            </span>
            
            <ShopSort />

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {formattedProducts.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground bg-card/30 rounded-3xl border border-border border-dashed">
                <p>محصولی با این فیلترها یافت نشد.</p>
                <Link href="/shop" className="text-xs mt-3 text-gold hover:underline">
                  پاک کردن تمام فیلترها
                </Link>
              </div>
            ) : (
              formattedProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))
            )}
          </div>
        </div>
      </main>
      
    </div>
  );
}