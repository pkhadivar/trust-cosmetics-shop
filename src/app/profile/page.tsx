import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ProfileTabs } from "@/components/profile-tabs";
// 🌟 اضافه شدن ایمپورت پریزما
import { prisma } from "@/lib/prisma"; 

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  // 🌟 استخراج اطلاعات زنده و به‌روز کاربر از دیتابیس
  const freshUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      phone: true, 
      role: true,
    }
  });

  // اگر کاربر در دیتابیس پیدا نشد (مثلا پاک شده بود)
  if (!freshUser) {
    redirect("/");
  }

  // آماده‌سازی دیتای کاربر با اطلاعات تازه (Fresh) برای پاس دادن به کامپوننت کلاینت
  const user = {
    id: freshUser.id,
    name: freshUser.name || "کاربر عزیز",
    // چون در تنظیمات قبلی، موبایل را به جای ایمیل پاس داده بودیم، اینجا هم شماره را در پراپ ایمیل می‌گذاریم
    email: freshUser.phone || "بدون شماره", 
    role: freshUser.role || "USER",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <main className="flex-1 w-full mx-auto px-5 py-12">
        <ProfileTabs user={user} />
      </main>

    </div>
  );
}