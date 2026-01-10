import React from 'react';
import Link from 'next/link';
import { Users, Building2, ArrowRight, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Submit Content | Fragview',
  description: 'Suggest missing fragrances or claim your brand.',
};

export default function SubmitHubPage() {
  return (
    <div className="min-h-screen bg-[#FAFFF5] py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 font-serif">Contribute to FragView</h1>
        <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
          Help us build the world&apos;s most comprehensive fragrance database. Whether you&apos;re an enthusiast or a brand owner, your contribution matters.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Community Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-green-100 hover:shadow-md transition-shadow text-left flex flex-col">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
              <Users size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Community Suggestion</h2>
            <p className="text-gray-600 mb-8 flex-1">
              Did you find a missing perfume or brand? Let us know! You&apos;ll earn <span className="font-bold text-green-600">+5 XP</span> if your suggestion is approved.
            </p>
            <Link 
              href="/submit/community" 
              className="inline-flex items-center justify-center w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
            >
              Suggest Missing Item <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>

          {/* Brand Owner Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow text-left flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Official
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
              <Building2 size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Brand Owner</h2>
            <p className="text-gray-600 mb-8 flex-1">
              Are you the owner or representative of a fragrance brand? Claim your profile, manage your catalog, and get the &quot;Verified Brand&quot; badge.
            </p>
            <Link 
              href="/submit/brand" 
              className="inline-flex items-center justify-center w-full py-3 bg-white border-2 border-orange-500 text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors"
            >
              Apply for Brand Account <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}