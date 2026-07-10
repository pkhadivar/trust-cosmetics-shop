export const calculateDiscount = (price: number, discountedPrice: number | null | undefined): number => {
    // اگر تخفیفی وجود نداشت یا قیمت اصلی صفر بود، تخفیف صفر است
    if (!discountedPrice || price <= 0 || discountedPrice >= price) {
      return 0;
    }
    
    const diff = price - discountedPrice;
    const percent = (diff / price) * 100;
    
    return Math.round(percent);
  };