import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  CATEGORIES,
  getCategoryHref,
  type CategorySlug,
} from "@/lib/categories";
import { mockProducts } from "@/lib/products";

const categoryEntries = Object.entries(CATEGORIES) as [
  CategorySlug,
  (typeof CATEGORIES)[CategorySlug],
][];

function getProductCount(category: CategorySlug): number {
  return mockProducts.filter((product) => product.category === category).length;
}

function getSubcategorySummary(category: CategorySlug): string {
  const subcategories = CATEGORIES[category].subcategories;
  const labels = Object.values(subcategories).slice(0, 3);
  const remaining = Object.keys(subcategories).length - labels.length;

  if (remaining > 0) {
    return `${labels.join("، ")} و ${remaining.toLocaleString("fa-IR")} مورد دیگر`;
  }

  return labels.join("، ");
}

export function CategoriesSection() {
  return (
    <section id="categories" className="bg-secondary/40 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-start">
          <div>
            <span className="text-sm font-medium text-gold">
              دسته‌بندی هوشمند
            </span>
            <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl">
              محصول مناسب خود را پیدا کنید
            </h2>
          </div>
          <Link
            href="/#products"
            className="rounded-full border border-border bg-card px-5 py-2 text-sm text-foreground/80 transition-colors hover:border-gold/50 hover:text-gold"
          >
            مشاهده همه محصولات
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categoryEntries.map(([slug, category]) => {
            const productCount = getProductCount(slug);
            const subcategoryCount = Object.keys(category.subcategories).length;

            return (
              <Link
                key={slug}
                href={getCategoryHref(slug)}
                className="group relative aspect-[16/10] overflow-hidden rounded-3xl border border-border"
              >
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(24,34,58,1) 0%, rgba(11,17,32,1) 45%, rgba(212,175,55,0.18) 100%)",
                  }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(11,17,32,0.95), rgba(11,17,32,0.35) 55%, transparent)",
                  }}
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <span className="text-xs text-gold">
                    {productCount > 0
                      ? `${productCount.toLocaleString("fa-IR")} محصول`
                      : `${subcategoryCount.toLocaleString("fa-IR")} زیردسته`}
                  </span>
                  <h3 className="mt-1 text-2xl font-bold text-foreground">
                    {category.label}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {getSubcategorySummary(slug)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold">
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
