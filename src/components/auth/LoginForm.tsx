'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; 
import { Button } from '@/components/ui/button';

export default function LoginForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 🌟 وضعیت تایمر (بر حسب ثانیه - مثلا 120 ثانیه معادل 2 دقیقه)
  const [countdown, setCountdown] = useState(120);

  const router = useRouter();

  // 🌟 هوک برای مدیریت شمارش معکوس تایمر
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // 🌟 تابع کمکی برای نمایش زمان به فرمت 00:00
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      if (!response.ok) {
        throw new Error('خطا در ارسال پیامک');
      }

      setStep('otp');
      // 🌟 ریست کردن تایمر هر بار که کد با موفقیت ارسال می‌شود
      setCountdown(120); 
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signIn('credentials', {
        phone: phoneNumber,
        code: otpCode,
        redirect: false, 
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      router.push('/profile');
      router.refresh(); 

    } catch (err) {
      setError((err as Error).message);
      setLoading(false); 
    }
  };

  return (
    <>
      {step === 'phone' && (
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-xl border border-border"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">ورود یا ثبت‌نام</h2>
            <p className="text-sm text-muted-foreground">لطفاً شماره تماس خود را وارد کنید</p>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center bg-red-50/10 p-2 rounded">{error}</p>}
          
          <div className="relative">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="09123456789"
              dir="ltr"
              maxLength={11}
              className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold text-left tracking-widest"
            />
          </div>
          
          <Button
            onClick={handleSendOTP}
            disabled={loading || phoneNumber.length !== 11}
            className="w-full p-6 text-lg bg-gold text-primary-foreground hover:bg-gold-soft rounded-xl transition-all"
          >
            {loading ? 'در حال ارسال...' : 'ارسال کد تایید'}
          </Button>
        </form>
      )}

      {step === 'otp' && (
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-xl border border-border"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">تایید شماره</h2>
            <p className="text-sm text-muted-foreground">کد پیامک شده به {phoneNumber} را وارد کنید</p>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center bg-red-50/10 p-2 rounded">{error}</p>}
          
          <div className="relative">
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="- - - - -"
              dir="ltr"
              maxLength={5}
              className="w-full p-4 text-center text-2xl tracking-[1em] border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          
          <Button
            onClick={handleVerifyOTP}
            disabled={loading || otpCode.length !== 5}
            className="w-full p-6 text-lg bg-gold text-primary-foreground hover:bg-gold-soft rounded-xl transition-all"
          >
            {loading ? 'در حال بررسی...' : 'ورود به حساب'}
          </Button>
          
          {/* 🌟 بخش پایینی: ویرایش شماره و تایمر/ارسال مجدد */}
          <div className="flex items-center justify-between mt-4">
            <button 
              type="button"
              onClick={() => setStep('phone')} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ویرایش شماره
            </button>

            {countdown > 0 ? (
              <span className="text-sm text-muted-foreground font-medium" dir="ltr">
                {formatTime(countdown)}
              </span>
            ) : (
              <button 
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="text-sm text-gold hover:text-yellow-500 transition-colors font-bold disabled:opacity-50"
              >
                ارسال مجدد کد
              </button>
            )}
          </div>
        </form>
      )}
    </>
  );
}