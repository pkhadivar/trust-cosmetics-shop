import { prisma } from "@/lib/prisma";
import CreateTagForm from "@/components/admin/CreateTagForm";
import DeleteTagButton from "@/components/admin/DeleteTagButton";

export default async function AdminTagsPage() {
  // دریافت تگ‌ها به همراه تعداد محصولاتی که از آن تگ استفاده کرده‌اند
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">مدیریت برچسب‌ها (Tags)</h1>
      </div>

      {/* بخش افزودن برچسب جدید */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">ایجاد برچسب جدید</h2>
        <CreateTagForm />
      </div>

      {/* بخش لیست برچسب‌ها */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-right text-sm">
          <thead className="bg-white/5 text-gold border-b border-border">
            <tr>
              <th className="p-4 font-semibold">نام برچسب</th>
              <th className="p-4 font-semibold">محصولات متصل</th>
              <th className="p-4 font-semibold">تاریخ ایجاد</th>
              <th className="p-4 font-semibold w-24 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tags.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  هیچ برچسبی یافت نشد. اولین برچسب خود را اضافه کنید.
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag.id} className="transition-colors hover:bg-white/5">
                  <td className="p-4 font-medium text-foreground">{tag.name}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center justify-center rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                      {tag._count.products} محصول
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(tag.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="p-4 text-center">
                    <DeleteTagButton id={tag.id} name={tag.name} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}