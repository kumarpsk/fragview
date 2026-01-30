import React from 'react';
import Link from 'next/link';
import { Users, Building2, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Submit Content | Fragview',
  description: 'Suggest missing fragrances or claim your brand.',
};

export default function SubmitHubPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold font-[var(--font-hedvig)] text-[#211F1C] mb-6">
          Contribute to FragView
        </h1>
        <p className="text-lg font-[var(--font-inter)] text-[#4A4946] mb-16 max-w-2xl mx-auto">
          Help us build the world&apos;s most comprehensive fragrance database. Whether you&apos;re an enthusiast or a brand owner, your contribution matters.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Community Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E2E1E1] hover:shadow-md transition-shadow text-left flex flex-col">
            <div className="w-14 h-14 bg-[#F9F7F5] border border-[#E2E1E1] rounded-2xl flex items-center justify-center text-[#211F1C] mb-6">
              <Users size={28} />
            </div>
            <h2 className="text-2xl font-bold font-[var(--font-hedvig)] text-[#211F1C] mb-3">
              Community Suggestion
            </h2>
            <p className="font-[var(--font-inter)] text-[#4A4946] mb-8 flex-1">
              Did you find a missing perfume or brand? Let us know! You&apos;ll earn <span className="font-bold text-amber-800">+5 XP</span> if your suggestion is approved.
            </p>
            <Link
              href="/submit/community"
              className="inline-flex items-center justify-center w-full py-3.5 bg-[#211F1C] text-white font-[var(--font-inter)] font-semibold rounded-xl hover:bg-[#211F1C]/90 transition-colors"
            >
              Suggest Missing Item <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>

          {/* Brand Owner Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E2E1E1] hover:shadow-md transition-shadow text-left flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#211F1C] text-white text-[10px] font-[var(--font-inter)] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Official
            </div>
            <div className="w-14 h-14 bg-[#F9F7F5] border border-[#E2E1E1] rounded-2xl flex items-center justify-center text-[#211F1C] mb-6">
              <Building2 size={28} />
            </div>
            <h2 className="text-2xl font-bold font-[var(--font-hedvig)] text-[#211F1C] mb-3">
              Brand Owner
            </h2>
            <p className="font-[var(--font-inter)] text-[#4A4946] mb-8 flex-1">
              Are you the owner or representative of a fragrance brand? Claim your profile, manage your catalog, and get the &quot;Verified Brand&quot; badge.
            </p>
            <Link
              href="/submit/brand"
              className="inline-flex items-center justify-center w-full py-3.5 bg-white border border-[#E2E1E1] text-[#211F1C] font-[var(--font-inter)] font-semibold rounded-xl hover:bg-[#F9F7F5] transition-colors"
            >
              Apply for Brand Account <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}