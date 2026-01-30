'use client';
import React, { useState, useEffect } from 'react';
import { submitBrandApplication } from '@/app/actions/submissions';
import { Loader2, CheckCircle, ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import DuplicateCheckAlert from '@/components/DuplicateCheckAlert';

export default function BrandSubmitPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // ✅ Duplicate check state
  const [checking, setChecking] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState<any>(null);
  const [brandName, setBrandName] = useState('');

  // ✅ Debounced duplicate check
  useEffect(() => {
    if (!brandName.trim()) {
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
            type: 'brand',
            name: brandName,
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
  }, [brandName]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ✅ Block submission if exact duplicate exists
    if (duplicateCheck?.exists) {
      alert('❌ This brand already exists in our database! If you are the brand owner, please contact support@fragview.com to claim it.');
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const res = await submitBrandApplication(formData);
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
        <h2 className="text-2xl font-bold font-[var(--font-hedvig)] text-[#211F1C] mb-2">Application Received!</h2>
        <p className="font-[var(--font-inter)] text-[#4A4946] mb-8 max-w-md">
          We have received your brand application. Our team will verify your details and contact you at the provided email address within 3-5 business days.
        </p>
        <Link href="/" className="font-[var(--font-inter)] text-gray-800 font-semibold hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/submit" className="inline-flex items-center font-[var(--font-inter)] text-[#4A4946] hover:text-[#211F1C] mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E1E1] p-8 lg:p-10">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#E2E1E1]">
            <div className="w-12 h-12 bg-[#F9F7F5] border border-[#E2E1E1] rounded-xl flex items-center justify-center text-[#211F1C]">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-[var(--font-hedvig)] text-[#211F1C]">Brand Owner Application</h1>
              <p className="text-sm font-[var(--font-inter)] text-[#4A4946]">Verify your brand to manage your catalog on FragView.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Brand Info */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold font-[var(--font-inter)] text-[#211F1C]">Brand Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-[var(--font-inter)] font-semibold text-[#211F1C] mb-2">Brand Name *</label>
                  <input
                    required
                    name="brandName"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E2E1E1] font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-[var(--font-inter)] font-semibold text-[#211F1C] mb-2">Parent Company (if any)</label>
                  <input name="companyName" className="w-full p-3 rounded-xl border border-[#E2E1E1] font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none" />
                </div>
              </div>

              <DuplicateCheckAlert
                type="brand"
                duplicateCheck={duplicateCheck}
                checking={checking}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-[var(--font-inter)] font-semibold text-[#211F1C] mb-2">Country of Origin</label>
                  <input required name="country" className="w-full p-3 rounded-xl border border-[#E2E1E1] font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-[var(--font-inter)] font-semibold text-[#211F1C] mb-2">Official Website</label>
                  <input required type="url" name="website" className="w-full p-3 rounded-xl border border-[#E2E1E1] font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none" />
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold font-[var(--font-inter)] text-[#211F1C]">Representative Contact</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-[var(--font-inter)] font-semibold text-[#211F1C] mb-2">Contact Name *</label>
                  <input required name="contactName" className="w-full p-3 rounded-xl border border-[#E2E1E1] font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-[var(--font-inter)] font-semibold text-[#211F1C] mb-2">Job Title / Position</label>
                  <input name="position" className="w-full p-3 rounded-xl border border-[#E2E1E1] font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-[var(--font-inter)] font-semibold text-[#211F1C] mb-2">Business Email *</label>
                  <input required type="email" name="contactEmail" placeholder="name@brand.com" className="w-full p-3 rounded-xl border border-[#E2E1E1] font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-[var(--font-inter)] font-semibold text-[#211F1C] mb-2">Phone Number</label>
                  <input type="tel" name="contactPhone" className="w-full p-3 rounded-xl border border-[#E2E1E1] font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none" />
                </div>
              </div>
            </section>

            {/* Verification */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold font-[var(--font-inter)] text-[#211F1C]">Verification</h3>
              <div>
                <label className="block text-sm font-[var(--font-inter)] font-semibold text-[#211F1C] mb-2">Proof of Ownership (Link)</label>
                <input name="verificationLink" placeholder="Link to LinkedIn profile, press kit, or business registration" className="w-full p-3 rounded-xl border border-[#E2E1E1] font-[var(--font-inter)] text-[#211F1C] bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none" />
                <p className="text-xs font-[var(--font-inter)] text-[#4A4946] mt-1">We strictly verify all brand applications. Using a company email domain helps speed up the process.</p>
              </div>
            </section>

            {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-[var(--font-inter)] border border-red-200">{error}</div>}

            <button
              type="submit"
              disabled={loading || duplicateCheck?.exists || checking}
              className="w-full py-4 bg-[#211F1C] text-white font-[var(--font-inter)] font-semibold rounded-xl hover:bg-[#211F1C]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}