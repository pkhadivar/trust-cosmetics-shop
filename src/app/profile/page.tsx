import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ProfileTabs } from "@/components/profile-tabs";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  // آماده‌سازی دیتای کاربر برای پاس دادن به کامپوننت کلایت
  const user = {
    id: session.user.id,
    name: session.user.name || "کاربر عزیز",
    email: session.user.email || "بدون شماره",
    role: (session.user as any).role || "USER",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <main className="flex-1 w-full mx-auto px-5 py-12">
        <ProfileTabs user={user} />
      </main>

    </div>
  );
}