// src/actions/payment.ts (یا فایلی که اکشن پرداخت در آن قرار دارد)
"use server";

import { prisma } from "@/lib/prisma";

type CheckoutData = {
  userId: string;
  addressId: string;
  cartItems: { productId: string; quantity: number }[];
};

export async function createOrderAndPay(data: CheckoutData) {
  try {
    const { userId, addressId, cartItems } = data;

    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "سبد خرید شما خالی است." };
    }

    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address) return { success: false, error: "آدرس انتخابی معتبر نیست." };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "کاربر یافت نشد." };

    // ۱. محاسبه مجموع مبلغ کالاها
    let itemsTotalAmount = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      
      // 🌟 تغییر یافته: فقط بررسی می‌کنیم که محصول وجود داشته باشد و تیک موجودی فعال باشد
      if (!product || !product.isAvailable) {
         return { success: false, error: `محصول ${product?.title || 'انتخابی'} در حال حاضر موجود نمی‌باشد.` };
      }

      const finalPrice = product.discountedPrice ?? product.price;
      itemsTotalAmount += finalPrice * item.quantity;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: finalPrice,
      });
    }

    // ۲. دریافت تنظیمات فروشگاه برای هزینه پست (اگر رکوردی نبود، می‌سازیم)
    let settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });
    if (!settings) {
      settings = await prisma.storeSettings.create({ data: { id: "global", shippingCost: 50000 } });
    }

    // ۳. اعمال قانون هزینه ارسال
    // ارسال رایگان برای خریدهای بالای 4 میلیون تومان (4,000,000)
    let finalShippingCost = settings.shippingCost;
    if (itemsTotalAmount >= 4000000) {
      finalShippingCost = 0;
    }

    const finalTotalAmount = itemsTotalAmount + finalShippingCost;

    // ۴. ایجاد سفارش با احتساب هزینه پست
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: finalTotalAmount,
        shippingCost: finalShippingCost,
        customerName: user.name || "کاربر تراست",
        customerPhone: user.phone || "",
        shippingState: address.state,
        shippingCity: address.city,
        shippingAddress: address.fullAddress,
        postalCode: address.postalCode,
        items: {
          create: orderItemsData,
        },
      },
    });

    const merchantId = process.env.ZARINPAL_MERCHANT_ID as string;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`;
    const amountInRial = finalTotalAmount * 10;

    const response = await fetch('https://sandbox.zarinpal.com/pg/v4/payment/request.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: amountInRial,
        description: `خرید از فروشگاه تراست - سفارش شماره ${order.id.slice(-6)}`,
        callback_url: callbackUrl,
        metadata: {
          mobile: user.phone || "",
          email: user.email || ""
        }
      })
    });

    const zarinpalData = await response.json();

    if (zarinpalData.data && zarinpalData.data.code === 100) {
      await prisma.order.update({
        where: { id: order.id },
        data: { authority: zarinpalData.data.authority }
      });

      const paymentUrl = `https://sandbox.zarinpal.com/pg/StartPay/${zarinpalData.data.authority}`;
      return { success: true, url: paymentUrl };
    } else {
      console.error("Zarinpal Error:", zarinpalData.errors);
      return { success: false, error: "خطا در برقراری ارتباط با درگاه بانکی." };
    }

  } catch (error) {
    console.error("Checkout Error:", error);
    return { success: false, error: "خطای سرور در ثبت سفارش." };
  }
}