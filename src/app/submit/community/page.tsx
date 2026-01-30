'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthModal } from '@/components/auth/AuthModal';
import { submitCommunitySuggestion } from '@/app/actions/submissions';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import DuplicateCheckAlert from '@/components/DuplicateCheckAlert';

export default function CommunitySubmitPage() {
  const { data: session, status } = useSession();
  const { open } = useAuthModal();
  
  const [type, setType] = useState<'PERFUME' | 'BRAND'>('PERFUME');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // ✅ Duplicate check state
  const [checking, setChecking] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    link: '',
    notes: '',
  });

  // ✅ Debounced duplicate check
  useEffect(() => {
    if (type === 'PERFUME' && (!formData.name || !formData.brand)) {
      setDuplicateCheck(null);
      return;
    }

    if (type === 'BRAND' && !formData.name) {
      setDuplicateCheck(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const response = await fetch('/api/check-duplicate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: type.toLowerCase(),
            name: formData.name,
            brandName: type === 'PERFUME' ? formData.brand : undefined,
          }),
        });

        const result = await response.json();
        setDuplicateCheck(result);
      } catch (error) {
        console.error('Duplicate check failed:', error);
      } finally {
        setChecking(false);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [formData.name, formData.brand, type]);

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]"><Loader2 className="animate-spin text-[#211F1C]" /></div>;

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7F4] p-4 text-center">
        <h2 className="text-2xl font-bold font-[var(--font-hedvig)] text-[#211F1C] mb-4">Please Log In</h2>
        <p className="font-[var(--font-inter)] text-[#4A4946] mb-6">You need to be a member to submit suggestions.</p>
        <button onClick={() => open({ mode: 'signin', reason: 'Sign in to submit suggestions' })} className="px-6 py-3 bg-[#211F1C] text-white rounded-xl font-[var(--font-inter)] font-semibold hover:bg-[#211F1C]/90 transition-colors">
          Sign In
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ✅ Block submission if exact duplicate exists
    if (duplicateCheck?.exists) {
      alert('❌ This ' + type.toLowerCase() + ' already exists in our database! Please check the existing entry instead of submitting a duplicate.');
      return;
    }

    setLoading(true);
    setError('');
    
    const formDataObj = new FormData(e.currentTarget);
    const data = {
      type,
      name: formDataObj.get('name') as string,
      brand: formDataObj.get('brand') as string,
      notes: formDataObj.get('notes') as string,
      link: formDataObj.get('link') as string,
    };

    const res = await submitCommunitySuggestion(data);
    setLoading(false);
    
    if (res.error === 'duplicate') {
      alert(`❌ ${res.message}`);
    } else if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7F4] p-4 text-center">
        <div className="w-16 h-16 bg-[#F9F7F5] border border-[#E2E1E1] rounded-full flex items-center justify-center text-[#211F1C] mb-6">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold font-[var(--font-hedvig)] text-[#211F1C] mb-2">Suggestion Received!</h2>
        <p className="font-[var(--font-inter)] text-[#4A4946] mb-8">Thank you for helping improve FragView. Our admins will review your submission shortly.</p>
        <Link href="/submit" className="font-[var(--font-inter)] text-amber-800 font-semibold hover:underline">Submit another</Link>
        <Link href="/" className="mt-4 font-[var(--font-inter)] text-[#4A4946] text-sm hover:text-[#211F1C]">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/submit" className="inline-flex items-center font-[var(--font-inter)] text-[#4A4946] hover:text-[#211F1C] mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E1E1] p-8">
          <h1 className="text-2xl font-bold font-[var(--font-hedvig)] text-[#211F1C] mb-6">Suggest a Missing Item</h1>

          {/* Type Toggle */}
          <div className="flex gap-2 mb-8">
            <button
              type="button"
              onClick={() => {
                setType('PERFUME');
                setFormData({ name: '', brand: '', link: '', notes: '' });
                setDuplicateCheck(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-[var(--font-inter)] font-medium transition-all ${
                type === 'PERFUME' ? 'bg-[#211F1C] text-white shadow-sm' : 'bg-[#F9F7F5] text-[#4A4946] border border-[#E2E1E1] hover:bg-[#E2E1E1]'
              }`}
            >
              Missing Perfume
            </button>
            <button
              type="button"
              onClick={() => {
                setType('BRAND');
                setFormData({ name: '', brand: '', link: '', notes: '' });
                setDuplicateCheck(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-[var(--font-inter)] font-medium transition-all ${
                type === 'BRAND' ? 'bg-[#211F1C] text-white shadow-sm' : 'bg-[#F9F7F5] text-[#4A4946] border border-[#E2E1E1] hover:bg-[#E2E1E1]'
              }`}
            >
              Missing Brand
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-[var(--font-inter)] font-semibold text-[#211F1C] mb-2">
                {type === 'PERFUME' ? 'Perfume Name' : 'Brand Name'} <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 rounded-xl border border-[#E2E1E1] font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            {type === 'PERFUME' && (
              <div>
                <label className="block text-sm font-[var(--font-inter)] font-semibold text-[#211F1C] mb-2">Brand Name <span className="text-red-500">*</span></label>
                <input
                  required
                  name="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#E2E1E1] font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
            )}

            <DuplicateCheckAlert
              type={type.toLowerCase() as 'perfume' | 'brand'}
              duplicateCheck={duplicateCheck}
              checking={checking}
            />

            <div>
              <label className="block text-sm font-[var(--font-inter)] font-semibold text-[#211F1C] mb-2">Reference Link <span className="text-red-500">*</span></label>
              <input
                required
                type="url"
                name="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="Official website, press release..."
                className="w-full p-3 rounded-xl border border-[#E2E1E1] font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
              <p className="text-xs font-[var(--font-inter)] text-[#4A4946] mt-1">Helping us verify the information faster.</p>
            </div>

            <div>
              <label className="block text-sm font-[var(--font-inter)] font-semibold text-[#211F1C] mb-2">Additional Notes</label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any details about notes, year, or perfumer..."
                className="w-full p-3 rounded-xl border border-[#E2E1E1] font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-[var(--font-inter)] border border-red-200">{error}</div>}

            <button
              type="submit"
              disabled={loading || duplicateCheck?.exists || checking}
              className="w-full py-4 bg-[#211F1C] text-white font-[var(--font-inter)] font-semibold rounded-xl hover:bg-[#211F1C]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Submit Suggestion'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}