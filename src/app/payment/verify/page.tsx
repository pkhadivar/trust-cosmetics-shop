import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight } from "lucide-react";

export default async function VerifyPaymentPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ Authority?: string; Status?: string }> 
}) {
  const { Authority, Status } = await searchParams;

  // ۱. بررسی وجود پارامترهای بازگشتی از بانک
  if (!Authority || !Status) {
    return <PaymentResultUI success={false} message="اطلاعات پرداخت نامعتبر است." />;
  }

  // ۲. پیدا کردن سفارشی که با این Authority در دیتابیس ثبت شده است
  const order = await prisma.order.findUnique({
    where: { authority: Authority },
  });

  if (!order) {
    return <PaymentResultUI success={false} message="سفارشی با این شناسه پرداخت یافت نشد." />;
  }

  // اگر سفارش قبلاً تایید شده باشد (جلوگیری از تایید مجدد با رفرش صفحه)
  if (order.status === "PAID" || order.status === "PROCESSING" || order.status === "SHIPPED") {
    return (
      <PaymentResultUI 
        success={true} 
        message="این پرداخت قبلاً تایید شده است." 
        refId={order.refId || undefined} 
      />
    );
  }

  // ۳. بررسی وضعیت پرداخت از سمت کاربر (انصراف یا خطا در درگاه)
  if (Status !== "OK") {
    // کاربر از پرداخت منصرف شده یا موجودی کافی نبوده است
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    return <PaymentResultUI success={false} message="پرداخت توسط شما لغو شد یا با خطا مواجه گردید." />;
  }

  // ۴. استعلام صحت پرداخت از سرور زرین‌پال (Verify)
  try {
    const merchantId = process.env.ZARINPAL_MERCHANT_ID as string;
    const amountInRial = order.totalAmount * 10;

    const response = await fetch('https://sandbox.zarinpal.com/pg/v4/payment/verify.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: amountInRial,
        authority: Authority,
      })
    });

    const verifyData = await response.json();

    // کدهای 100 (موفق) و 101 (قبلا تایید شده) در زرین‌پال به معنای پرداخت صحیح است
    if (verifyData.data && (verifyData.data.code === 100 || verifyData.data.code === 101)) {
      const refId = verifyData.data.ref_id.toString();

      // پرداخت کاملاً موفق بود! وضعیت را به PAID تغییر می‌دهیم و کد پیگیری (RefID) را ذخیره می‌کنیم
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: "PAID",
          refId: refId
        },
      });

      // کاهش موجودی انبار کالاها (اختیاری و حرفه‌ای)
      // در یک سناریوی واقعی، اینجا موجودی محصول (Product.stock) را بر اساس order.items کم می‌کنیم.

      return <PaymentResultUI success={true} message="پرداخت شما با موفقیت انجام شد و سفارش در صف بررسی قرار گرفت." refId={refId} />;
    } else {
      // پول کسر شده ولی به حساب زرین‌پال ننشسته (بانک تا ۷۲ ساعت بعد برمی‌گرداند)
      return <PaymentResultUI success={false} message={`تراکنش ناموفق بود. خطا: ${verifyData.errors?.message || 'نامشخص'}`} />;
    }
  } catch (error) {
    console.error("Verification Error:", error);
    return <PaymentResultUI success={false} message="خطا در ارتباط با سرور بانک. اگر پولی کسر شده است، تا ۷۲ ساعت آینده برگشت داده می‌شود." />;
  }
}

// کامپوننت رابط کاربری برای نمایش نتیجه پرداخت (هماهنگ با تم دارک و طلایی تراست)
function PaymentResultUI({ success, message, refId }: { success: boolean; message: string; refId?: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 text-center shadow-2xl">
        
        <div className="flex justify-center mb-6">
          {success ? (
            <div className="size-20 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500/20">
              <CheckCircle2 className="size-10 text-green-500" />
            </div>
          ) : (
            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/20">
              <XCircle className="size-10 text-red-500" />
            </div>
          )}
        </div>

        <h1 className={`text-2xl font-bold mb-4 ${success ? "text-green-500" : "text-red-500"}`}>
          {success ? "پرداخت موفقیت‌آمیز بود" : "پرداخت ناموفق"}
        </h1>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          {message}
        </p>

        {success && refId && (
          <div className="bg-secondary/30 border border-border rounded-xl p-4 mb-8 flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">شماره پیگیری تراکنش (کد رهگیری):</span>
            <span className="text-lg font-mono font-bold text-foreground tracking-wider">{refId}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {success ? (
            <Link 
              href="/profile/orders" 
              className="w-full bg-gold hover:bg-yellow-500 text-[#0a0f1c] font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="size-5" />
              مشاهده وضعیت سفارش
            </Link>
          ) : (
            <Link 
              href="/cart" 
              className="w-full bg-gold hover:bg-yellow-500 text-[#0a0f1c] font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              بازگشت به سبد خرید
            </Link>
          )}
          
          <Link 
            href="/" 
            className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            بازگشت به صفحه اصلی
            <ArrowRight className="size-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}