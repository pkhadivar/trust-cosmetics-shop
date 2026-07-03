'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

  const Onboarding: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // پاک کردن ارورهای قبلی
    
    try {
      // ارسال درخواست POST به API پروفایل که ساختیم
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'خطایی در ثبت اطلاعات رخ داد. لطفاً دوباره تلاش کنید.');
      }

      // اگر موفقیت‌آمیز بود، کاربر را به داشبورد می‌فرستیم
      router.push('/dashboard');
      
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-xl border border-border"
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">تکمیل ثبت‌نام</h2>
          <p className="text-sm text-muted-foreground">لطفاً نام و نام‌خانوادگی خود را وارد کنید</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center bg-red-50/10 p-2 rounded">{error}</p>}

        <div className="relative">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="نام و نام‌خانوادگی"
            className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || fullName.trim() === ''}
          className="w-full p-6 text-lg bg-gold text-primary-foreground hover:bg-gold-soft rounded-xl transition-all"
        >
          {loading ? 'در حال ذخیره‌سازی...' : 'تکمیل ثبت‌نام'}
        </Button>
      </form>
    </div>
  );
};

export default Onboarding;