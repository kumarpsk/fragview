"use client";
import { scrollTabsBy, scrollToTabIndex } from "@/utils/colors";
import Link from "next/link";
import React, { useRef } from "react";
const categories = [
  "All",
  "Review",
  "Guide",
  "News",
  "Interview",
  "Deep Dive",
  "Industry",
];

export default function CatagoryTabs({
  selectedCategory,
}: {
  selectedCategory?: string;
}) {
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => scrollTabsBy(tabsRef, 160);
  const scrollToTab = (index: number) => scrollToTabIndex(tabsRef, index);

  return (
    <div className="w-full relative">
      <div
        ref={tabsRef}
        className="flex items-center border border-[#E2E1E1] rounded-full overflow-x-auto scrollbar-hide lg:overflow-visible"
      >
        {categories.map((cat, index) => {
          const params = new URLSearchParams();
          if (cat !== "All") params.set("category", cat);
          const href = params.toString()
            ? `/drydown?${params.toString()}`
            : "/drydown";
          const isActive =
            (!selectedCategory && cat === "All") || selectedCategory === cat;

          return (
            <Link
              key={cat}
              href={href}
              onClick={() => scrollToTab(index)}
              className={`flex-1 h-9 lg:h-12 flex items-center justify-center px-6 lg:px-8 font-inter font-medium text-sm lg:text-xl leading-5 lg:leading-7 rounded-full whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-[#211F1C] text-white"
                  : "bg-transparent text-[#211F1C] hover:bg-[#E2E1E1]/50"
              }`}
            >
              {cat}
            </Link>
          );
        })}
        <div className="lg:hidden flex-shrink-0 w-12" />
      </div>
      {/* Scroll indicator arrow - mobile only */}
      <div className="lg:hidden absolute right-0 top-0 h-9 flex items-center bg-gradient-to-l from-[#FFF9EF] via-[#FFF9EF] to-transparent pl-6 pr-1">
        <button
          type="button"
          onClick={scrollRight}
          className="w-8 h-8 flex items-center justify-center bg-[#211F1C] rounded-full"
          aria-label="Scroll tabs"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
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
  );
}
