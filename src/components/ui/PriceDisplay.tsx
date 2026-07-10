export default function PriceDisplay({ price, discountedPrice }: { price: number, discountedPrice?: number | null }) {
    const hasDiscount = discountedPrice && discountedPrice < price;
  
    return (
      <div className="flex flex-col gap-1">
        {hasDiscount && (
          <span className="text-sm text-slate-500 line-through">
            {price.toLocaleString('fa-IR')} تومان
          </span>
        )}
        <span className="text-lg font-bold text-gold">
          {(discountedPrice || price).toLocaleString('fa-IR')} تومان
        </span>
      </div>
    );
  }