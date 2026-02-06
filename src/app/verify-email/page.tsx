'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Leaf, Flower2 } from 'lucide-react';

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email…');
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus('success');
          setMessage(data?.message || 'Email verified! Redirecting…');
          setTimeout(() => router.push('/signin?verified=true'), 1500);
        } else {
            setStatus('error');
            setMessage(data?.error || 'Verification failed.');
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    })();
  }, [router, token]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#FAFFF5' }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl animate-pulse animate-delay-2" />
        
        <div className="absolute top-32 right-20 animate-float">
          <Leaf size={20} className="text-green-300/20" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float animate-delay-3">
          <Flower2 size={18} className="text-orange-300/20" />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card rounded-2xl p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5">
            <Flower2 size={150} />
          </div>

          <div className="mb-4 flex items-center justify-center relative z-10">
            {status === 'loading' && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            )}
            {status === 'success' && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>

          <h1 className="mb-2 text-center text-xl font-semibold text-gray-800 relative z-10">
            {status === 'loading' && 'Verifying Email'}
            {status === 'success' && 'Email Verified'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          <p className="mb-6 text-center text-sm text-gray-600 relative z-10">
            {message}
          </p>

          {status === 'error' && (
            <div className="space-y-3 relative z-10">
              <Link
                href="/signin"
                className="block w-full rounded-full bg-gradient-to-r from-green-500 to-orange-500 px-4 py-2 text-center text-sm font-medium text-white transition-shadow hover:shadow-md"
              >
                Try Signing In
              </Link>
              <Link
                href="/signup"
                className="block w-full rounded-full border border-green-200 bg-white/80 px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-green-50"
              >
                Register Again
              </Link>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-2 text-center text-xs text-gray-600 relative z-10">
              <p>You will be redirected shortly.</p>
              <Link
                href="/signin?verified=true"
                className="inline-block rounded-full bg-gradient-to-r from-green-500 to-orange-500 px-4 py-2 text-xs font-medium text-white transition-shadow hover:shadow-sm"
              >
                Go Now
              </Link>
            </div>
          )}

          {status === 'loading' && (
            <div className="mt-2 text-center text-xs text-gray-500 relative z-10">
              Please wait…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAFFF5' }}>
          <div className="glass-card rounded-2xl p-8 max-w-md w-full">
            <div className="mb-4 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
            <p className="text-center text-sm text-gray-600">Loading…</p>
          </div>
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}