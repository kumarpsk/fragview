'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Droplets } from 'lucide-react';

type PopularPerfume = {
  _id: string;
  name: string;
  brand: string;
  slug: string;
  image?: string | null;
  rating: number;
  reviewCount?: number;
  gender?: string | null;
  accords: { name: string }[];
};

type TabKey = 'All' | 'Unisex' | 'Male' | 'Female';

function normalizeGender(value?: string | null): TabKey | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v === 'unisex') return 'Unisex';
  if (v === 'male' || v === 'men' || v.includes('for men') || v.includes('masc')) return 'Male';
  if (v === 'female' || v === 'women' || v.includes('for women') || v.includes('fem')) return 'Female';
  return null;
}

export default function PopularPicksSection({ perfumes }: { perfumes: PopularPerfume[] }) {
  const [tab, setTab] = useState<TabKey>('All');

  const filtered = useMemo(() => {
    if (tab === 'All') return perfumes;
    const list = perfumes.filter((p) => normalizeGender(p.gender) === tab);
    return list.length > 0 ? list : [];
  }, [perfumes, tab]);

  const visible = filtered.slice(0, 6);

  return (
    <section className="bg-[#FFFCF7]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-5">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-10">
          <div className="flex flex-col gap-1">
            {/* Pre-title */}
            <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
              Popular picks
            </span>
            {/* Title */}
            <h2 className="font-hedvig font-normal text-[28px] leading-[36px] lg:text-[40px] lg:leading-[56px] text-[#211F1C]">
              Perfumes with the highest ratings
            </h2>
          </div>

          {/* View All Perfumes link */}
          <Link
            href="/perfumes"
            className="hidden lg:inline-flex items-center gap-2 px-1 py-0 font-inter font-medium text-[20px] leading-[28px] text-[#211F1C] underline hover:text-[#8A6A35] transition-colors"
          >
            View All Perfumes
            <ArrowRight className="h-6 w-6" aria-hidden="true" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-8 lg:mt-12 w-[76%] mx-auto  max-xl:w-[90%]  max-lg:w-full">
          <div className="flex flex-row justify-between items-center p-0 border border-[#E2E1E1] rounded-[32px] h-12 overflow-hidden">
            {(['All', 'Unisex', 'Male', 'Female'] as const).map((key) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`flex-1 flex items-center justify-center h-12 px-4 lg:px-[72px] font-inter font-medium text-[14px] lg:text-[20px] leading-[28px] transition-colors ${
                    active
                      ? 'bg-[#211F1C] text-white rounded-[32px]'
                      : 'bg-transparent text-[#211F1C] hover:bg-[#211F1C]/5'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-16 gap-5">
          {visible.length > 0 ? (
            visible.map((perfume, i) => (
              <Link  href={`/perfumes/${perfume.slug}`}
                key={perfume._id}
                className="flex flex-col bg-[#FFF4E3] rounded-[16px] overflow-hidden isolate group shadow-md hover:shadow-lg"
              >
                {/* Image Area */}
                <div className="relative h-[280px]  bg-white border-t border-l border-r border-[#EFEFEF] rounded-t-[16px] group-hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden">
                  {perfume.image ? (
                    <Image
                      src={perfume.image}
                      alt={perfume.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-4"
                      priority={i < 3}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Droplets className="h-12 w-12 text-[#8A6A35]" aria-hidden="true" />
                    </div>
                  )}
                  {/* Gender Badge */}
                  {perfume.gender && (
                    <span className="absolute top-4 left-4 flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-[14px] leading-[20px] text-[#695129] z-10">
                      {perfume.gender}
                    </span>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex flex-col justify-between flex-1 p-6 gap-6">
                  <div className="flex flex-col gap-3">
                    {/* Rating Row */}
                    <div className="flex items-center gap-[3px]">
                      <Star className="h-6 w-6 text-[#FBC061] fill-[#FBC061]" aria-hidden="true" />
                      <span className="font-inter font-medium text-[18px] leading-[26px] text-[#211F1C]">
                        {perfume.rating.toFixed(1)}
                      </span>
                      <span className="font-inter font-normal text-[16px] leading-[24px] text-[#4A4946]">
                        ({perfume.reviewCount ?? 0} reviews)
                      </span>
                    </div>

                    {/* Title & Brand */}
                    <div className="flex flex-col gap-[6px]">
                      <h3 className="font-averia font-normal text-[24px] leading-[32px] text-[#211F1C] line-clamp-2">
                        {perfume.name}
                      </h3>
                      <p className="font-inter font-normal text-[16px] leading-[24px] text-[#737270]">
                        {perfume.brand}
                      </p>
                    </div>

                    {/* Accord Tags */}
                    {perfume.accords?.length > 0 && (
                      <div className="flex flex-row flex-wrap items-center gap-2">
                        {perfume.accords.slice(0, 3).map((accord) => (
                          <span
                            key={accord.name}
                            className="flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-[14px] leading-[20px] text-[#695129]"
                          >
                            {accord.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* View Details Button */}
                  <div
                  
                    className="flex items-center justify-center gap-2 w-full h-[40px] border border-[#C4C4C3] rounded-lg font-inter font-medium text-[16px] leading-[26px] text-[#211F1C] hover:bg-[#211F1C] hover:text-white transition-colors"
                  >
                    View Details
                    <ArrowRight className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            // <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-[#737270] py-8 font-inter">
            //   No perfumes available.
            // </div>
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-16 text-center font-inter">
  <div className="w-16 h-16 mb-4 rounded-full bg-[#F5F3EF] flex items-center justify-center">
    <svg
      className="w-8 h-8 text-[#8A6A35]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2"
      />
    </svg>
  </div>

  <h3 className="text-[18px] font-semibold text-[#211F1C] mb-2">
    No perfumes found
  </h3>

  <p className="text-[15px] text-[#737270] max-w-lg">
    We couldn’t find any perfumes matching your selection. Try adjusting your
    filters or search again.
  </p>
</div>

          )}
        </div>

        {/* View More Button */}
             {visible.length > 0 && (

          
        <div className="mt-8 flex justify-center">
          <Link
            href="/perfumes"
            className="inline-flex items-center justify-between py-2 px-4 gap-4 bg-[#211F1C] rounded-[12px] font-inter font-medium text-[16px] leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors"
          >
            View More
            <span className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#211F1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </Link>
        </div>   )}
      </div>
    </section>
  );
}
