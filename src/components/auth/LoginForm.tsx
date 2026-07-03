'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface LoginFormProps {}

const LoginForm: React.FC<LoginFormProps> = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      setStep('otp');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, code: otpCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify OTP');
      }

      const data = await response.json();
      if (data.requiresOnboarding) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
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
          
          <button 
            onClick={() => setStep('phone')} 
            className="text-sm text-muted-foreground hover:text-gold mt-4"
          >
            ویرایش شماره تماس
          </button>
        </form>
      )}
    </>
  );
};

export default LoginForm;