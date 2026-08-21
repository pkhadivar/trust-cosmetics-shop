"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  closeCartDrawer,
  removeFromCart,
  selectCartItems,
  selectCartTotal,
  selectIsCartDrawerOpen,
  updateQuantity,
} from "@/store/cartSlice";
import type { RootState } from "@/store/store";

function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

export function CartDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) =>
    selectIsCartDrawerOpen(state),
  );
  const items = useSelector((state: RootState) => selectCartItems(state));
  const total = useSelector((state: RootState) => selectCartTotal(state));
  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "";
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
        onClick={() => dispatch(closeCartDrawer())}
      />

      <aside
        className={`fixed top-0 left-0 z-[70] flex h-full w-full max-w-md flex-col border-e border-border bg-card shadow-[0_0_80px_-20px_rgba(11,17,32,0.9)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isOpen}
        aria-label="سبد خرید"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">سبد خرید</h2>
              <p className="text-xs text-muted-foreground">
                {items.length > 0
                  ? `${items.length.toLocaleString("fa-IR")} قلم انتخاب‌شده`
                  : "سبد خرید شما خالی است"}
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-foreground/80 hover:bg-secondary hover:text-gold"
            aria-label="بستن سبد خرید"
            onClick={() => dispatch(closeCartDrawer())}
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <ShoppingBag className="size-7" />
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                هنوز محصولی به سبد خرید اضافه نکرده‌اید.
              </p>
            </div>
          ) : (
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
                    className="flex gap-4 rounded-2xl border border-border bg-background/60 p-3"
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
                      <Image
                        src={imgSrc || "/placeholder.jpg"}
                        alt={product.title}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold">
                            {product.title}
                          </h3>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {product.subtitle}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`حذف ${product.title} از سبد خرید`}
                          onClick={() => dispatch(removeFromCart(product.id))}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                        <div className="inline-flex items-center rounded-xl border border-border bg-secondary/60">
                          <button
                            type="button"
                            className="flex size-8 items-center justify-center rounded-s-xl text-foreground/80 transition-colors hover:bg-gold hover:text-primary-foreground"
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  productId: product.id,
                                  quantity: quantity - 1,
                                }),
                              )
                            }
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-medium">
                            {quantity.toLocaleString("fa-IR")}
                          </span>
                          <button
                            type="button"
                            className="flex size-8 items-center justify-center rounded-e-xl text-foreground/80 transition-colors hover:bg-gold hover:text-primary-foreground"
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  productId: product.id,
                                  quantity: quantity + 1,
                                }),
                              )
                            }
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-gold">
                          {formatPrice(activePrice * quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-5 py-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">جمع کل</span>
            <span className="text-lg font-bold text-gold">
              {formatPrice(total)}
            </span>
          </div>

          <Link
            href="/cart"
            onClick={() => dispatch(closeCartDrawer())}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-soft"
          >
            مشاهده و تسویه حساب
          </Link>
        </div>
      </aside>
    </>
  );
}
