"use client";

import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import {
  clearCart,
  removeFromCart,
  selectCartItems,
  selectCartTotal,
  updateQuantity,
} from "@/store/cartSlice";
import type { RootState } from "@/store/store";

function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

export default function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => selectCartItems(state));
  const total = useSelector((state: RootState) => selectCartTotal(state));

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />
      <main className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="text-center">
          <span className="text-sm font-medium text-gold">سبد خرید</span>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">تسویه حساب</h1>
          <div className="mx-auto mt-4 h-px w-24 gold-divider" aria-hidden />
        </div>

        {items.length === 0 ? (
          <div className="mt-14 rounded-3xl border border-border bg-card px-6 py-16 text-center">
            <p className="text-muted-foreground">
              سبد خرید شما خالی است.
            </p>
            <Link
              href="/#products"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-gold px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-soft"
            >
              بازگشت به فروشگاه
            </Link>
          </div>
        ) : (
          <div className="mt-14 space-y-8">
            <ul className="space-y-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center"
                >
                  <div className="relative mx-auto size-28 shrink-0 overflow-hidden rounded-2xl bg-secondary/40 sm:mx-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-3"
                    />
                  </div>

                  <div className="min-w-0 flex-1 text-center sm:text-start">
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.subtitle}
                    </p>
                    <p className="mt-2 text-sm font-bold text-gold">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-3 sm:items-end">
                    <div className="inline-flex items-center rounded-xl border border-border bg-secondary/60">
                      <button
                        type="button"
                        className="flex size-9 items-center justify-center rounded-s-xl transition-colors hover:bg-gold hover:text-primary-foreground"
                        aria-label="کاهش تعداد"
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId: product.id,
                              quantity: quantity - 1,
                            }),
                          )
                        }
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="min-w-10 text-center text-sm font-medium">
                        {quantity.toLocaleString("fa-IR")}
                      </span>
                      <button
                        type="button"
                        className="flex size-9 items-center justify-center rounded-e-xl transition-colors hover:bg-gold hover:text-primary-foreground"
                        aria-label="افزایش تعداد"
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
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
                      onClick={() => dispatch(removeFromCart(product.id))}
                    >
                      <Trash2 className="size-3.5" />
                      حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-3xl border border-gold/30 bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">جمع کل</span>
                <span className="text-2xl font-bold text-gold">
                  {formatPrice(total)}
                </span>
              </div>
              <Button
                className="mt-5 h-12 w-full bg-gold text-sm font-semibold text-primary-foreground hover:bg-gold-soft"
                onClick={() => dispatch(clearCart())}
              >
                پرداخت (نمایشی)
              </Button>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
