'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Loader2, Leaf, Flower2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      setSuccess(true);
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12 bg-[#FFF9EF]" >
      {/* Animated Background Elements - ADDED */}
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
        {/* Back Button */}
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>

        {/* Card - BOTANICAL THEME */}
        <div className="glass-card rounded-2xl shadow-lg p-8 border border-green-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5">
            <Flower2 size={150} />
          </div>
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-black bg-clip-text text-transparent mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600">
              Enter your email and we&apos;ll send you a reset code
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
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
                    Sending...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 relative z-10">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-700 font-medium">
                  ✓ Reset code sent!
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Check your email for the 6-digit code
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Redirecting to reset page...
              </p>
            </div>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{' '}
          <Link
            href="/signin"
            className="text-gray-600 hover:text-gray-700 hover:underline font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}