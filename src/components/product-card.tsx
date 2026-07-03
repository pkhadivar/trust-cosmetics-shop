"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import type { Product } from "@/lib/products";
import { addToCart } from "@/store/cartSlice";

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useDispatch();

  function handleAddToCart() {
    dispatch(addToCart({ product, quantity: 1 }));
  }
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:border-gold/50 hover:shadow-[0_0_50px_-15px_rgba(212,175,55,0.45)]">
      {product.tag && (
        <span className="absolute end-4 top-4 z-10 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary-foreground">
          {product.tag}
        </span>
      )}

      <div className="relative aspect-square overflow-hidden bg-secondary/40">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold">{product.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {product.subtitle}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5">
            <span className="text-sm font-bold text-gold">{product.price}</span>
            <span className="ms-1 text-xs text-gold/80">تومان</span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-gold hover:text-primary-foreground"
            aria-label={`افزودن ${product.name} به سبد خرید`}
          >
            <Plus className="size-4" />
            افزودن به سبد خرید
          </button>
        </div>
      </div>
    </div>
  );
}
