import { getBrands } from "@/actions/brand";
import { BrandManager } from "@/components/admin/brand-manager";

export const metadata = {
  title: "مدیریت برندها | پنل ادمین",
};

export default async function AdminBrandsPage() {
  const brands = await getBrands();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">برندها</h1>
        <p className="text-sm text-muted-foreground mt-2">
          مدیریت برندهای محصولات (مثلاً تراست، تراست اسلیم و غیره).
        </p>
      </div>
      
      <BrandManager brands={brands} />
    </div>
  );
}