import { prisma } from '@/lib/prisma';
import { ReviewActions } from '@/components/admin/review-actions';

export default async function AdminReviewsPage() {
  // دریافت تمام نظرات همراه با اطلاعات محصولِ مربوط به آن‌ها
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: { title: true, images: true }
      }
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">مدیریت نظرات کاربران</h1>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
        {reviews.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            هیچ نظری در سیستم ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-white/5 border-b border-border text-gold text-sm">
                <tr>
                  <th className="p-4 w-1/4">محصول</th>
                  <th className="p-4 w-1/4">کاربر و تاریخ</th>
                  <th className="p-4 w-2/4">متن نظر و وضعیت</th>
                  <th className="p-4 w-48 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-white/5 transition-colors">
                    
                    {/* ستون محصول */}
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-3">
                        <img 
                          src={review.product.images[0]} 
                          className="w-12 h-12 rounded-lg object-cover bg-secondary/50" 
                          alt={review.product.title} 
                        />
                        <span className="text-sm font-medium text-foreground/90 line-clamp-2">
                          {review.product.title}
                        </span>
                      </div>
                    </td>

                    {/* ستون کاربر */}
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-foreground">{review.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                    </td>

                    {/* ستون متن نظر */}
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-foreground/80 leading-relaxed bg-secondary/20 p-3 rounded-xl">
                          {review.text}
                        </p>
                        
                        {/* نمایش وضعیت تایید و پاسخ ادمین */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${
                            review.isApproved ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            {review.isApproved ? 'تایید شده' : 'در انتظار تایید'}
                          </span>
                          
                          {review.adminReply && (
                            <span className="text-[10px] px-2 py-1 rounded-md font-bold bg-gold/10 text-gold">
                              پاسخ داده شده
                            </span>
                          )}
                        </div>

                        {review.adminReply && (
                          <div className="mt-2 text-xs text-muted-foreground border-r-2 border-gold pr-3">
                            <strong className="text-gold">پاسخ شما: </strong>
                            {review.adminReply}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ستون عملیات */}
                    <td className="p-4 align-top">
                      <ReviewActions 
                        review={{
                          id: review.id,
                          isApproved: review.isApproved,
                          adminReply: review.adminReply
                        }} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}