import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface OTPVerificationProps {
  phone: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({ phone, onSuccess, onBack }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Verification successful!');
      onSuccess();
    } catch (err: any) {
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });
      if (error) throw error;
      toast.success('New OTP sent!');
      setTimer(60);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-slate-500 font-medium">
          We've sent a 6-digit verification code to <br />
          <span className="text-slate-900 font-black">{phone}</span>
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-center gap-2">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\\D/g, ''))}
            className="w-full max-w-[200px] text-center bg-slate-50 border border-slate-200 rounded-2xl py-4 text-3xl font-black tracking-[0.5em] focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            placeholder="000000"
            required
            autoFocus
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Verify Code
            <ShieldCheck className="w-5 h-5" />
          </>
        )}
      </button>

      <div className="text-center space-y-4">
        <button
          type="button"
          onClick={handleResend}
          disabled={timer > 0}
          className={`text-sm font-black ${
            timer > 0 ? 'text-slate-300' : 'text-emerald-600 hover:underline'
          }`}
        >
          {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
        </button>
        <br />
        <button
          type="button"
          onClick={onBack}
          className="text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors uppercase tracking-widest"
        >
          Change Phone Number
        </button>
      </div>
    </form>
  );
};