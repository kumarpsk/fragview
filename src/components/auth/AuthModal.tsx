'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { signIn } from 'next-auth/react';
import { X, Eye, EyeOff } from 'lucide-react';
import { registerSchema, loginSchema } from '@/lib/validations';
import Link from 'next/link';

type OpenArgs = { mode?: 'signin' | 'signup'; reason?: string; onSuccess?: () => void; callbackUrl?: string };
type ModalCtx = { open: (args?: OpenArgs) => void; close: () => void };

const Ctx = createContext<ModalCtx | undefined>(undefined);

export function useAuthModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuthModal must be used within <AuthModalProvider>');
  return ctx;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [reason, setReason] = useState<string | undefined>();
  const [onSuccess, setOnSuccess] = useState<(() => void) | undefined>();
  const [callbackUrl, setCallbackUrl] = useState<string | undefined>();

  const open = useCallback((args?: OpenArgs) => {
    setMode(args?.mode ?? 'signin');
    setReason(args?.reason);
    setOnSuccess(() => args?.onSuccess);
    setCallbackUrl(args?.callbackUrl || window.location.href);
    setVisible(true);
  }, []);
  const close = useCallback(() => setVisible(false), []);

  return (
    <Ctx.Provider value={{ open, close }}>
      {children}
      {visible && <AuthModalUI mode={mode} reason={reason} callbackUrl={callbackUrl} onClose={close} onSuccess={onSuccess} />}
    </Ctx.Provider>
  );
}

function AuthModalUI({
  mode: initialMode,
  reason,
  callbackUrl,
  onClose,
  onSuccess,
}: {
  mode: 'signin' | 'signup';
  reason?: string;
  callbackUrl?: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  async function doRegister() {
    const v = registerSchema.safeParse({ email, username: name || email.split('@')[0], password: pw });
    if (!v.success) throw new Error(v.error.issues[0]?.message ?? 'Invalid input');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username: name || email.split('@')[0], password: pw }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Registration failed');
    return data;
  }

  async function doSignIn() {
    const v = loginSchema.safeParse({ email, password: pw });
    if (!v.success) throw new Error(v.error.issues[0]?.message ?? 'Invalid input');
    const res = await signIn('credentials', { 
      email, 
      password: pw, 
      redirect: false,
      callbackUrl: callbackUrl || '/',
    });
    if (res?.error) {
      if (res.error.toLowerCase().includes('verify')) throw new Error('Please verify your email first.');
      throw new Error('Invalid email or password.');
    }
    return res;
  }

  async function run<T>(fn: () => Promise<T>) {
    setLoading(true);
    setError(null);
    try {
      await fn();
      onClose();
      onSuccess?.();
      window.location.href = callbackUrl || '/';
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      {/* Modal Container */}
      <div 
        className="w-full max-w-[440px] rounded-2xl shadow-2xl relative overflow-hidden"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex flex-col gap-1">
              <h2 
                className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[40px]"
                style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#211F1C' }}
              >
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p 
                className="text-[14px] leading-[20px] sm:text-[16px] sm:leading-[24px]"
                style={{ fontFamily: "'Inter', sans-serif", color: '#737270' }}
              >
                {reason || (mode === 'signin' ? 'Sign in to continue' : 'Join FragView today')}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-[#EFEFEF]"
            >
              <X className="w-5 h-5" style={{ color: '#737270' }} />
            </button>
          </div>

          {/* Tabs */}
          <div 
            className="flex p-1 rounded-full mb-6"
            style={{ border: '1px solid #EFEFEF' }}
          >
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className="flex-1 h-[44px] flex items-center justify-center rounded-full transition-all"
              style={{ 
                backgroundColor: mode === 'signin' ? '#211F1C' : 'transparent',
              }}
            >
              <span 
                className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[26px]"
                style={{ 
                  fontFamily: "'Inter', sans-serif", 
                  fontWeight: 500, 
                  color: mode === 'signin' ? '#FFFFFF' : '#211F1C' 
                }}
              >
                Sign In
              </span>
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className="flex-1 h-[44px] flex items-center justify-center rounded-full transition-all"
              style={{ 
                backgroundColor: mode === 'signup' ? '#211F1C' : 'transparent',
              }}
            >
              <span 
                className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[26px]"
                style={{ 
                  fontFamily: "'Inter', sans-serif", 
                  fontWeight: 500, 
                  color: mode === 'signup' ? '#FFFFFF' : '#211F1C' 
                }}
              >
                Sign Up
              </span>
            </button>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-2">
                <label 
                  className="text-[14px] leading-[20px]"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#211F1C' }}
                >
                  Username
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your username"
                  className="w-full h-[50px] px-4 rounded-xl transition-all focus:outline-none"
                  style={{ 
                    border: '1px solid #C4C4C3',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '16px',
                    color: '#211F1C',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#211F1C'}
                  onBlur={(e) => e.target.style.borderColor = '#C4C4C3'}
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label 
                className="text-[14px] leading-[20px]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#211F1C' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-[50px] px-4 rounded-xl transition-all focus:outline-none"
                style={{ 
                  border: '1px solid #C4C4C3',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '16px',
                  color: '#211F1C',
                }}
                onFocus={(e) => e.target.style.borderColor = '#211F1C'}
                onBlur={(e) => e.target.style.borderColor = '#C4C4C3'}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label 
                className="text-[14px] leading-[20px]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#211F1C' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-[50px] px-4 pr-12 rounded-xl transition-all focus:outline-none"
                  style={{ 
                    border: '1px solid #C4C4C3',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '16px',
                    color: '#211F1C',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#211F1C'}
                  onBlur={(e) => e.target.style.borderColor = '#C4C4C3'}
                />
                <button
                  type="button"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors"
                >
                  {showPw ? (
                    <EyeOff className="w-5 h-5" style={{ color: '#737270' }} />
                  ) : (
                    <Eye className="w-5 h-5" style={{ color: '#737270' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            {mode === 'signin' && (
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  onClick={onClose}
                  className="text-[14px] leading-[20px] transition-colors hover:opacity-80"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#8A6A35' }}
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div 
                className="p-3 rounded-xl text-[14px] leading-[20px]"
                style={{ 
                  backgroundColor: '#FEF2F2', 
                  border: '1px solid #FECACA',
                  fontFamily: "'Inter', sans-serif",
                  color: '#DC2626'
                }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={loading}
              onClick={() => run(mode === 'signin' ? doSignIn : doRegister)}
              className="w-full h-[50px] flex items-center justify-center rounded-xl transition-all disabled:opacity-60 hover:opacity-90"
              style={{ backgroundColor: '#211F1C' }}
            >
              <span 
                className="text-[18px] leading-[26px]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#FFFFFF' }}
              >
                {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: '#E2E1E1' }} />
            <span 
              className="text-[14px] leading-[20px]"
              style={{ fontFamily: "'Inter', sans-serif", color: '#737270' }}
            >
              Or continue with
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#E2E1E1' }} />
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              signIn('google', { callbackUrl: callbackUrl || '/' });
            }}
            disabled={loading}
            className="w-full h-[50px] flex items-center justify-center gap-3 rounded-xl transition-all disabled:opacity-60 hover:bg-[#FAFAFA]"
            style={{ border: '1px solid #C4C4C3' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span 
              className="text-[16px] leading-[24px]"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#211F1C' }}
            >
              Continue with Google
            </span>
          </button>

          {/* Terms text */}
          <p 
            className="mt-6 text-center text-[12px] leading-[18px]"
            style={{ fontFamily: "'Inter', sans-serif", color: '#737270' }}
          >
            By continuing, you agree to FragView&apos;s{' '}
            <Link href="/terms" onClick={onClose} className="underline hover:opacity-80">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" onClick={onClose} className="underline hover:opacity-80">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}