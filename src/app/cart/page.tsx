"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Minus,
  Plus,
  Trash2,
  Loader2,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  removeFromCart,
  selectCartItems,
  selectCartTotal,
  updateQuantity,
} from "@/store/cartSlice";
import type { RootState } from "@/store/store";
import { createOrderAndPay } from "@/actions/payment";
import { getStoreSettings } from "@/actions/settings";

function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

export default function CartPage() {
  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "";
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session, status } = useSession();

  const items = useSelector((state: RootState) => selectCartItems(state));
  const total = useSelector((state: RootState) => selectCartTotal(state));

  const [isPending, startTransition] = useTransition();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [shippingCost, setShippingCost] = useState<number>(50000); // مقدار پیش‌فرض مطمئن

  useEffect(() => {
    // دریافت امن هزینه پست از دیتابیس
    getStoreSettings()
      .then((settings) => {
        if (settings?.shippingCost !== undefined) {
          setShippingCost(settings.shippingCost);
        }
      })
      .catch((err) => console.error("Error fetching store settings:", err));

    // واکشی آدرس‌های کاربر در صورت لاگین بودن
    if (status === "authenticated") {
      setIsLoadingAddresses(true);
      fetch("/api/user/addresses")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAddresses(data);
            if (data.length > 0) setSelectedAddressId(data[0].id);
          }
        })
        .catch((err) => console.error("Error fetching addresses:", err))
        .finally(() => setIsLoadingAddresses(false));
    }
  }, [status]);

  const handleCheckout = () => {
    if (status === "unauthenticated") {
      toast.error("برای ثبت سفارش لطفاً ابتدا وارد حساب کاربری خود شوید.");
      router.push("/login?callbackUrl=/cart");
      return;
    }

    if (!selectedAddressId) {
      toast.error("لطفاً یک آدرس برای ارسال سفارش انتخاب کنید.");
      return;
    }

    const formattedItems = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    // دسترسی امن‌تر به آیدی یوزر
    const userId = (session?.user as any)?.id;

    if (!userId) {
      toast.error("خطا در شناسایی کاربر. لطفاً دوباره وارد شوید.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createOrderAndPay({
          userId: userId,
          addressId: selectedAddressId,
          cartItems: formattedItems,
        });

        if (result.success && result.url) {
          window.location.href = result.url;
        } else {
          toast.error(result.error || "خطایی در اتصال به درگاه رخ داد.");
        }
      } catch (error) {
        toast.error("ارتباط با سرور برقرار نشد.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="text-center">
          <span className="text-sm font-medium text-gold">سبد خرید</span>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">تسویه حساب</h1>
          <div className="mx-auto mt-4 h-px w-24 gold-divider" aria-hidden />
        </div>

        {items.length === 0 ? (
          <div className="mt-14 rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-sm">
            <p className="text-muted-foreground">سبد خرید شما خالی است.</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-gold px-6 text-sm font-semibold text-[#0a0f1c] transition-colors hover:bg-yellow-500"
            >
              بازگشت به فروشگاه
            </Link>
          </div>
        ) : (
          <div className="mt-14 space-y-8">
            <ul className="space-y-4">
              {items.map(({ product, quantity }) => {
                const productImages = product.images as string[] | undefined;
                const activePrice = product.discountedPrice ?? product.price;

                const rawImage = productImages?.[0];
                const imgSrc = rawImage
                  ? rawImage.startsWith("http")
                    ? rawImage
                    : `${baseUrl}/${rawImage}`
                  : "/placeholder.jpg";

                return (
                  <li
                    key={product.id}
                    className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center shadow-sm transition-all hover:border-gold/30"
                  >
                    <div className="relative mx-auto size-28 shrink-0 overflow-hidden rounded-2xl bg-[#050810] border border-border sm:mx-0">
                      <Image
                        src={imgSrc || "/placeholder.jpg"}
                        alt={product.title}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="min-w-0 flex-1 text-center sm:text-right">
                      <h2 className="text-lg font-bold text-foreground">
                        {product.title}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {product.subtitle}
                      </p>

                      <div className="mt-3 flex flex-col sm:items-start gap-1">
                        {product.discountedPrice && (
                          <span className="text-xs text-muted-foreground line-through decoration-red-500/50">
                            {formatPrice(product.price)}
                          </span>
                        )}
                        <span className="text-base font-black text-gold">
                          {formatPrice(activePrice)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 sm:items-end">
                      <div className="inline-flex items-center rounded-xl border border-border bg-secondary/40">
                        <button
                          type="button"
                          className="flex size-10 items-center justify-center rounded-r-xl transition-colors hover:bg-gold hover:text-[#0a0f1c]"
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: product.id,
                                quantity: quantity + 1,
                              }),
                            )
                          }
                        >
                          <Plus className="size-4" />
                        </button>
                        <span className="min-w-12 text-center text-sm font-bold text-foreground">
                          {quantity.toLocaleString("fa-IR")}
                        </span>
                        <button
                          type="button"
                          className="flex size-10 items-center justify-center rounded-l-xl transition-colors hover:bg-gold hover:text-[#0a0f1c]"
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: product.id,
                                quantity: Math.max(1, quantity - 1),
                              }),
                            )
                          }
                        >
                          <Minus className="size-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg"
                        onClick={() => dispatch(removeFromCart(product.id))}
                      >
                        <Trash2 className="size-3.5" />
                        حذف کالا
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="rounded-3xl border border-gold/30 bg-card p-6 md:p-8 shadow-xl">
              <div className="mb-8 border-b border-border/50 pb-8">
                <h3 className="mb-4 text-lg font-bold flex items-center gap-2 text-foreground">
                  <MapPin className="size-5 text-gold" />
                  انتخاب آدرس ارسال
                </h3>

                {status === "unauthenticated" ? (
                  <div className="flex items-center gap-3 bg-secondary/50 p-4 rounded-xl border border-border">
                    <AlertCircle className="size-5 text-gold shrink-0" />
                    <p className="text-sm text-foreground/80">
                      برای ثبت سفارش و انتخاب آدرس، لطفاً ابتدا وارد حساب کاربری
                      خود شوید.
                    </p>
                  </div>
                ) : isLoadingAddresses ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="size-6 animate-spin text-gold" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="bg-secondary/30 p-5 rounded-xl border border-dashed border-border text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      شما هنوز آدرسی در سیستم ثبت نکرده‌اید.
                    </p>
                    <Link
                      href="/profile"
                      className="inline-flex text-xs font-bold text-[#0a0f1c] bg-gold px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                    >
                      ثبت آدرس جدید در پروفایل
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start cursor-pointer gap-4 p-4 rounded-2xl border transition-all ${
                          selectedAddressId === addr.id
                            ? "border-gold bg-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                            : "border-border bg-secondary/20 hover:border-gold/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1.5 size-4 accent-gold shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">
                            {addr.title}
                          </span>
                          <span className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            {addr.state}، {addr.city} - {addr.fullAddress}
                          </span>
                          <span className="text-xs text-muted-foreground/70 mt-1">
                            کد پستی: <span dir="ltr">{addr.postalCode}</span>
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* محاسبه فاکتور نهایی */}
              {(() => {
                const finalShippingCost = total >= 4000000 ? 0 : shippingCost;
                const finalPayable = total + finalShippingCost;

                return (
                  <>
                    <div className="flex flex-col gap-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          مجموع کالاها ({items.length} آیتم)
                        </span>
                        <span className="font-medium text-foreground">
                          {formatPrice(total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          هزینه ارسال
                        </span>
                        <span className="font-medium text-gold">
                          {total >= 4000000
                            ? "رایگان (سفارش بالای ۴ میلیون تومان)"
                            : formatPrice(finalShippingCost)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/50 pt-5 mb-6">
                      <span className="font-bold text-foreground">
                        مبلغ قابل پرداخت
                      </span>
                      <span className="text-2xl font-black text-gold drop-shadow-md">
                        {formatPrice(finalPayable)}
                      </span>
                    </div>

                    <Button
                      disabled={
                        isPending ||
                        status === "unauthenticated" ||
                        addresses.length === 0 ||
                        !selectedAddressId
                      }
                      className="h-14 w-full bg-gold text-base font-bold text-[#0a0f1c] hover:bg-yellow-500 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      onClick={handleCheckout}
                    >
                      {isPending && <Loader2 className="size-5 animate-spin" />}
                      {isPending
                        ? "در حال اتصال به درگاه بانکی..."
                        : "پرداخت و ثبت سفارش"}
                    </Button>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
