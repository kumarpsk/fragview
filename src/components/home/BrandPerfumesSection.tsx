"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft, Star, Droplets } from "lucide-react";
import { scrollTabsBy, scrollToTabIndex } from "@/utils/colors";

type Brand = {
  _id: string;
  name: string;
  slug: string;
  perfumesCount: number;
};

type Perfume = {
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

type Props = {
  brands: Brand[];
  brandPerfumesMap: Record<string, Perfume[]>;
};

export default function BrandPerfumesSection({
  brands,
  brandPerfumesMap,
}: Props) {
  const [selectedBrandIndex, setSelectedBrandIndex] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 3;
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [selectedBrandIndex]);

  const scrollRight = () => scrollTabsBy(tabsRef, 160);

  const scrollToTab = (index: number) => scrollToTabIndex(tabsRef, index);

  // Get first 4 brands for tabs
  const visibleBrands = brands.slice(0, 4);
  const selectedBrand = visibleBrands[selectedBrandIndex];

  // Get top 9 perfumes for selected brand (sorted by rating from backend)
  const filteredPerfumes = useMemo(() => {
    if (!selectedBrand) return [];
    const brandKey = selectedBrand.name.toLowerCase();
    return brandPerfumesMap[brandKey] || [];
  }, [brandPerfumesMap, selectedBrand]);

  if (brands.length === 0) {
    return null;
  }

  const visiblePerfumes = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return filteredPerfumes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPerfumes, page]);

  const totalPages = Math.ceil(filteredPerfumes.length / ITEMS_PER_PAGE);

  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage((p) => p + 1);
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage((p) => p - 1);
    }
  };

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-5">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-10">
          <div className="flex flex-col gap-1">
            {/* Pre-title */}
            <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
              Perfumes by brand
            </span>
            {/* Title */}
            <h2 className="font-hedvig font-normal text-[28px] leading-[36px] lg:text-[40px] lg:leading-[56px] text-[#211F1C]">
              Discover what each brand creates
            </h2>
          </div>

          {/* View All Brands link */}
          <Link
            href="/brands"
            className="hidden lg:inline-flex items-center gap-2 px-1 py-0 font-inter font-medium text-[20px] leading-[28px] text-[#211F1C] underline hover:text-[#8A6A35] transition-colors"
          >
            View All Brands
            <ArrowRight className="h-6 w-6" aria-hidden="true" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-8 lg:mt-12  w-[76%] max-xl:w-[90%] mx-auto max-lg:w-full relative">
          <div
            ref={tabsRef}
            className="
          flex items-center lg:gap-0
          border border-[#EFEFEF] rounded-[32px]
              h-9 lg:h-12
          overflow-x-auto lg:overflow-hidden
         scrollbar-hide  scroll-smooth
        "
          >
            {visibleBrands.map((brand, index) => {
              const active = selectedBrandIndex === index;

              return (
                <button
                  key={brand._id}
                  type="button"
                  onClick={() => {
                    setSelectedBrandIndex(index);
                    scrollToTab(index);
                  }}
                  className={`
           flex-1
                h-9 lg:h-12
                flex items-center justify-center
                px-6 lg:px-8
                font-inter font-medium
                text-sm lg:text-xl
                rounded-full whitespace-nowrap
                transition-all duration-300
                ${
                  active
                    ? "bg-[#211F1C] text-white "
                    : "bg-transparent text-[#211F1C] hover:bg-[#E2E1E1]/50"
                }
              `}
                >
                  {brand.name}
                </button>
              );
            })}
            <div className="lg:hidden flex-shrink-0 w-12" />
          </div>

          {/* Right Scroll Button (Mobile only) */}
          <div
            className="
    lg:hidden absolute right-0 top-1/2 -translate-y-1/2
    h-8 flex items-center
    bg-gradient-to-l from-[#FFF9EF] via-[#FFF9EF] to-transparent
    pl-6 pr-1 rounded-full
  "
          >
            <button
              type="button"
              onClick={scrollRight}
              className="w-8 h-8 flex items-center justify-center
               bg-[#211F1C] rounded-full"
              aria-label="Scroll tabs"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Product Cards - Grid layout matching Popular picks */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-16 gap-5">
          {visiblePerfumes.length > 0 ? (
            visiblePerfumes.map((perfume, i) => (
              <Link
                href={`/perfumes/${perfume.slug}`}
                key={perfume._id}
                className="flex flex-col bg-[#FFF9EF] rounded-[16px] overflow-hidden isolate group shadow-md hover:shadow-lg "
              >
                {/* Image Area */}
                <div className="relative h-[280px] bg-white border-t border-l border-r border-[#EFEFEF] rounded-t-[16px]  group-hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden">
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
                      <Droplets
                        className="h-12 w-12 text-[#8A6A35]"
                        aria-hidden="true"
                      />
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
                      <Star
                        className="h-6 w-6 text-[#FBC061] fill-[#FBC061]"
                        aria-hidden="true"
                      />
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
                  <div className="flex items-center justify-center gap-2 w-full h-[40px] border border-[#C4C4C3] rounded-lg font-inter font-medium text-[16px] leading-[26px] text-[#211F1C] hover:bg-[#211F1C] hover:text-white transition-colors">
                    View Details
                    <ArrowRight className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            // <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-[#737270] py-8 font-inter">
            //   No perfumes available for this brand.
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
                We couldn’t find any perfumes matching your selection. Try
                adjusting your filters or search again.
              </p>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {visiblePerfumes.length > 0 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={page === 0}
              className={`flex items-center justify-center w-11 h-11 rounded-lg transition-colors ${
                page === 0
                  ? "bg-[#C4C4C3] cursor-not-allowed"
                  : "bg-[#211F1C] hover:bg-[#211F1C]/80"
              }`}
              aria-label="Previous"
            >
              <ArrowLeft className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={page >= totalPages - 1}
              className={`flex items-center justify-center w-11 h-11 rounded-lg transition-colors ${
                page >= totalPages - 1
                  ? "bg-[#C4C4C3] cursor-not-allowed"
                  : "bg-[#211F1C] hover:bg-[#211F1C]/80"
              }`}
              aria-label="Next"
            >
              <ArrowRight className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Mobile View All link */}
        <div className="mt-8 lg:hidden">
          <Link
            href="/brands"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#C4C4C3] bg-white px-4 py-3 font-inter font-medium text-[16px] text-[#211F1C] hover:bg-[#211F1C]/5"
          >
            View All Brands
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
