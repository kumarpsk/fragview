'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft, Loader2, Eye, EyeOff, Leaf, Flower2 } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push('/signin?reset=success');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12 bg-[#FFF9EF]">
      {/* Animated Background Elements - ADDED */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gray-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl animate-pulse animate-delay-2" />
        
        <div className="absolute top-32 right-20 animate-float">
          <Leaf size={20} className="text-gray-300/20" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float animate-delay-3">
          <Flower2 size={18} className="text-orange-300/20" />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>

        {/* Card - BOTANICAL THEME */}
        <div className="glass-card rounded-2xl shadow-lg p-8 border border-gray-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5">
            <Flower2 size={150} />
          </div>
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-black bg-clip-text text-transparent mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600">
              Enter the code from your email and your new password
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reset Code
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors text-center font-mono text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-200 bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 relative z-10">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-700 font-medium">
                  ✓ Password reset successfully!
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  You can now sign in with your new password
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Redirecting to sign in...
              </p>
            </div>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Didn&apos;t receive a code?{' '}
          <Link
            href="/forgot-password"
            className="text-gray-600 hover:text-gray-700 hover:underline font-medium transition-colors"
          >
            Resend
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFFF5' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}