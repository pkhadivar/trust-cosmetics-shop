import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getMediaUrl } from "@/utils/media"; // اضافه کردن تابع getMediaUrl

export async function CategoriesSection() {
  const dbCategories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      _count: { select: { products: true } },
      children: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <section id="categories" className="bg-secondary/40 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-start">
          <div>
            <span className="text-sm font-medium text-gold">
              دسته‌بندی هوشمند
            </span>
            <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl text-foreground">
              محصول مناسب خود را پیدا کنید
            </h2>
          </div>
          <Link
            href="/shop"
            className="rounded-full border border-border bg-card px-5 py-2 text-sm text-foreground/80 transition-colors hover:border-gold/50 hover:text-gold"
          >
            مشاهده همه محصولات
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {dbCategories.map((category) => {
            const productCount = category._count.products;
            const subLabels = category.children
              .map((c) => c.name)
              .slice(0, 3)
              .join("، ");
            const remaining = category.children.length - 3;
            const description =
              remaining > 0
                ? `${subLabels} و ${remaining.toLocaleString("fa-IR")} مورد دیگر`
                : subLabels;

            // پردازش تصویر با استفاده از تابع getMediaUrl
            const categoryImage = getMediaUrl(category.imageUrl);

            return (
              <Link
                key={category.id}
                href={`/shop?category=${category.id}`}
                className="group relative aspect-[16/10] overflow-hidden rounded-3xl border border-border bg-[#0B1120] transition-shadow hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.2)]"
              >
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 bg-no-repeat"
                  style={{
                    backgroundImage: categoryImage
                      ? `url(${categoryImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "left center",
                  }}
                  aria-hidden
                />

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to left, rgba(11,17,32,1) 15%, rgba(11,17,32,0.85) 50%, transparent 95%)",
                  }}
                  aria-hidden
                />

                <div className="absolute inset-0 p-7 z-10 flex flex-col justify-center w-[75%]">
                  <span className="text-xs text-gold font-medium mb-1.5">
                    {productCount.toLocaleString("fa-IR")} محصول
                  </span>
                  <h3 className="text-2xl font-bold text-foreground transition-colors group-hover:text-gold">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground/90 line-clamp-2">
                    {description || "مشاهده محصولات این دسته"}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gold">
                    مشاهده محصولات
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
