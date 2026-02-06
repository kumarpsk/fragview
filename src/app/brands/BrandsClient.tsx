"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Droplets,
  Grid,
  List,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { scrollTabsBy, scrollToTabIndex } from "@/utils/colors";

type BrandItem = {
  _id: string;
  name: string;
  slug?: string;
  country?: string;
  description?: string;
  perfumes?: { name: string }[];
  perfumes_count?: number;
};

interface Props {
  initialItems: BrandItem[];
  total: number;
  meta: { page: number; totalPages: number; total: number };
  query: { q: string; sort: string; letter: string };
  pageSize: number;
  letterTotals?: Record<string, number>;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LETTER_RANGES = [
  "A-C",
  "D-F",
  "G-I",
  "J-L",
  "M-O",
  "P-R",
  "S-U",
  "V-X",
  "Y-Z",
] as const;

function normalizeLetterRange(letter: string | undefined): string {
  const trimmed = (letter || "").trim().toUpperCase();
  if (!trimmed) return "A-C";
  const match = (LETTER_RANGES as readonly string[]).includes(trimmed);
  return match ? trimmed : "A-C";
}

function lettersFromRange(range: string): string[] {
  const trimmed = (range || "").trim().toUpperCase();
  if (!trimmed || trimmed === "ALL") return [];
  if (/^[A-Z]$/.test(trimmed)) return [trimmed];
  const m = trimmed.match(/^([A-Z])\s*-\s*([A-Z])$/);
  if (!m) return [];
  const start = m[1].charCodeAt(0);
  const end = m[2].charCodeAt(0);
  if (start > end) return [];
  const letters: string[] = [];
  for (let c = start; c <= end; c += 1) letters.push(String.fromCharCode(c));
  return letters;
}

const ITEMS_PER_PAGE = 6;

const SORT_OPTIONS = [
   { value: "az", label: "Name (A-Z)" },
    { value: "za", label: "Name (Z-A)" },
  { label: "Most Fragrances", value: "fragrances" },
  { label: "Country", value: "country" },
];

export default function BrandsClient({
  initialItems,
  total,
  meta,
  query,
  pageSize,
  letterTotals = {},
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(query.q);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState(query.sort || "az");
  const [selectedLetter, setSelectedLetter] = useState(
    normalizeLetterRange(query.letter),
  );
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => scrollTabsBy(tabsRef, 160);
  const scrollToTab = (index: number) => scrollToTabIndex(tabsRef, index);
  const active = SORT_OPTIONS.find((o) => o.value === sortBy) || SORT_OPTIONS[0];
  // Track items per letter (can be appended via Load More)
  const [itemsPerLetter, setItemsPerLetter] = useState<
    Record<string, BrandItem[]>
  >({});
  // Track current page per letter for backend pagination
  const [pagePerLetter, setPagePerLetter] = useState<Record<string, number>>(
    {},
  );
  // Track loading state per letter
  const [loadingLetter, setLoadingLetter] = useState<string | null>(null);

  // Initialize items per letter from initialItems
  useEffect(() => {
    const groups: Record<string, BrandItem[]> = {};
    for (const b of initialItems) {
      const first = (b.name?.trim()?.[0] || "").toUpperCase();
      if (!first) continue;
      if (!groups[first]) groups[first] = [];
      groups[first].push(b);
    }
    setItemsPerLetter(groups);
    setPagePerLetter({});
  }, [initialItems]);

  const visibleLetters = useMemo(() => {
    const allowed = new Set(lettersFromRange(selectedLetter));
    if (allowed.size === 0) return new Set(ALPHABET);
    return allowed;
  }, [selectedLetter]);

  const groupedBrands = useMemo(() => {
    return ALPHABET.filter(
      (l) => visibleLetters.has(l) && (itemsPerLetter[l]?.length || 0) > 0,
    ).map((l) => {
      const items = itemsPerLetter[l] || [];
      const fragrancesTotal = items.reduce(
        (acc, it) => acc + (it.perfumes_count ?? it.perfumes?.length ?? 0),
        0,
      );
      const totalForLetter = letterTotals[l] || items.length;
      return { letter: l, items, fragrancesTotal, totalForLetter };
    });
  }, [itemsPerLetter, visibleLetters, letterTotals]);

  // 🔧 Debounced search with loading state
  useEffect(() => {
    setIsSearching(true);
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      else params.delete("q");
      params.set("sort", sortBy);
      params.set("letter", normalizeLetterRange(selectedLetter));
      params.set("page", "1");
      router.replace(`/brands?${params.toString()}`);
      setIsSearching(false);
    }, 300);
    return () => {
      clearTimeout(t);
      setIsSearching(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortBy, selectedLetter]);

  // Function to load more items for a specific letter from backend
  const loadMoreForLetter = async (letter: string) => {
    if (loadingLetter) return; // Prevent multiple simultaneous requests

    setLoadingLetter(letter);
    const currentPage = pagePerLetter[letter] || 1;
    const nextPage = currentPage + 1;

    try {
      const params = new URLSearchParams();
      params.set("letter", letter);
      params.set("page", String(nextPage));
      params.set("sort", sortBy);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const url = `/api/brands/by-letter?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();
        console.error("API error:", res.status, text);
        throw new Error(`Failed to fetch: ${res.status}`);
      }

      const data = await res.json();

      if (!data.items || !Array.isArray(data.items)) {
        console.error("Invalid API response:", data);
        throw new Error("Invalid response format");
      }

      // Append new items to existing ones
      setItemsPerLetter((prev) => ({
        ...prev,
        [letter]: [...(prev[letter] || []), ...data.items],
      }));

      // Update page for this letter
      setPagePerLetter((prev) => ({
        ...prev,
        [letter]: nextPage,
      }));
    } catch (error) {
      console.error("Error loading more brands:", error);
    } finally {
      setLoadingLetter(null);
    }
  };
  return (
    <div className="flex flex-col gap-12">
      {/* Header + Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-10">
          <div className="flex flex-col gap-1 flex-1">
            <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-fv-olive">
              Discover the makers
            </span>
            <h1 className="font-hedvig font-normal text-[28px] leading-[36px] lg:text-[40px] lg:leading-[56px] text-fv-ink">
              Fragrance brands
            </h1>
          </div>
          <div className="flex items-center justify-end">
            <div className="relative w-[220px]">
              {/* Button */}
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full h-[50px] px-4 rounded-xl border border-fv-border-strong bg-white font-inter font-medium text-[16px] lg:text-[18px] text-fv-ink"
              >
                <span className="font-inter font-medium text-lg text-[#211F1C] max-sm:text-md">
                  {active?.label}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-[#211F1C] transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-[#E2E1E1] rounded-xl shadow-lg overflow-hidden">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 font-inter text-base transition-colors ${
                        sortBy === option.value
                          ? "bg-[#FFF4E3] text-[#211F1C]"
                          : "text-[#211F1C] hover:bg-[#FFF9EF]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-12">
          <div className="relative flex-1">
            <div className="flex items-center gap-2 h-[50px] rounded-xl border border-fv-sand-border bg-white px-3">
              <Search
                className="h-6 w-6 text-fv-gold-dark"
                aria-hidden="true"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent outline-none font-averia font-light text-[18px] leading-[26px] text-fv-ink placeholder:text-fv-sand-border"
              />
              {isSearching && (
                <Loader2
                  className="h-5 w-5 animate-spin text-fv-gold-dark"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <div className="flex h-[50px] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`h-[50px] w-[62px] flex items-center justify-center border border-fv-border-strong border-r-0 rounded-l-lg ${
                  viewMode === "grid" ? "bg-fv-parchment-border" : "bg-white"
                }`}
                aria-label="Grid view"
              >
                <Grid
                  className={`h-[28px] w-[28px] ${viewMode === "grid" ? "text-fv-ink" : "text-fv-border-strong"}`}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`h-[50px] w-[62px] flex items-center justify-center border border-fv-border-strong rounded-r-lg ${
                  viewMode === "list" ? "bg-fv-parchment-border" : "bg-white"
                }`}
                aria-label="List view"
              >
                <List
                  className={`h-[28px] w-[28px] ${viewMode === "list" ? "text-fv-ink" : "text-fv-border-strong"}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="font-inter font-normal text-[16px] lg:text-[20px] leading-[28px] text-fv-text-muted">
            Browse by letter
          </div>

             <div className="w-full relative">

                 <div
        ref={tabsRef}
        className="flex items-center border border-[#E2E1E1] rounded-full overflow-x-auto scrollbar-hide md:overflow-visible"
      >
            {LETTER_RANGES.map((range,index) => {
              const active = normalizeLetterRange(selectedLetter) === range;
              return (
                <button
                  key={range}
                  type="button"
                  onClick=
                  {() => {
                    setSelectedLetter(range);
                    scrollToTab(index);
                  }}
                   className={`flex-1 h-9 lg:h-12 flex items-center justify-center px-6 lg:px-8 font-inter font-medium text-sm lg:text-xl leading-5 lg:leading-7 rounded-full whitespace-nowrap transition-colors ${
                  active
                  ? "bg-[#211F1C] text-white"
                  : "bg-transparent text-[#211F1C] hover:bg-[#E2E1E1]/50"
              }`}
            >
                  {range}
                </button>
              );
            })}
            <div className="md:hidden flex-shrink-0 w-12" />
          </div>
            {/* Scroll indicator arrow - mobile only */}
      <div className="md:hidden absolute right-0 top-1/2 -translate-y-1/2  h-9 flex items-center bg-gradient-to-l from-[#FFF9EF] via-[#FFF9EF] to-transparent pl-6 pr-1">
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
         </div>
      </div>

      {/* Grouped Results */}
      <div className="flex flex-col gap-5">
        {groupedBrands.length === 0 && !isSearching ? (
          <div className="text-center py-12">
            <p className="font-inter text-[18px] leading-[26px] text-fv-text-muted">
              No brands found.
            </p>
          </div>
        ) : (
          groupedBrands.map((group) => {
            const hasMore = group.items.length < group.totalForLetter;
            const isLoadingThis = loadingLetter === group.letter;

            return (
              <div key={group.letter} className="flex flex-col gap-8">
                <div className="flex items-center justify-between gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-fv-parchment-border">
                    <span className="font-hedvig font-normal text-[40px] leading-[48px] text-fv-ink">
                      {group.letter}
                    </span>
                  </div>
                  <div className="font-inter font-normal text-[16px] lg:text-[20px] leading-[28px] text-fv-text-muted">
                    {group.fragrancesTotal} Fragrances ({group.items.length} of{" "}
                    {group.totalForLetter} brands)
                  </div>
                </div>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.items.map((brand) => {
                      const count =
                        brand.perfumes_count ?? brand.perfumes?.length ?? 0;
                      const first = (
                        brand.name?.trim()?.[0] || "B"
                      ).toUpperCase();
                      return (
                        <Link
                          key={brand._id}
                          href={`/brands/${brand.slug || brand._id}`}
                          className="flex flex-col justify-between bg-fv-parchment border border-fv-border rounded-2xl p-4 gap-5 min-h-[240px]"
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fv-parchment-border">
                              <span className="font-hedvig text-[24px] leading-[32px] text-fv-ink">
                                {first}
                              </span>
                            </div>

                            <div className="flex flex-col gap-3">
                              <h3 className="font-averia font-normal text-[24px] leading-[32px] text-fv-ink">
                                {brand.name}
                              </h3>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1 min-w-0">
                                  <MapPin
                                    className="h-5 w-5 text-fv-text-muted"
                                    aria-hidden="true"
                                  />
                                  <span className="font-inter text-[14px] leading-[20px] text-fv-text-muted truncate">
                                    {brand.country || "Unknown"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Droplets
                                    className="h-5 w-5 text-fv-text-muted"
                                    aria-hidden="true"
                                  />
                                  <span className="font-inter text-[14px] leading-[20px] text-fv-text-muted text-right">
                                    {count}{" "}
                                    {count === 1 ? "Fragrance" : "Fragrances"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <span className="flex items-center justify-center gap-2 w-full h-10 border border-fv-border-strong rounded-lg font-inter font-medium text-[14px] leading-[22px] text-fv-ink hover:bg-fv-ink hover:text-white transition-colors">
                            View Details
                            <ArrowRight
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {group.items.map((brand) => {
                      const count =
                        brand.perfumes_count ?? brand.perfumes?.length ?? 0;
                      const first = (
                        brand.name?.trim()?.[0] || "B"
                      ).toUpperCase();
                      return (
                        <Link
                          key={brand._id}
                          href={`/brands/${brand.slug || brand._id}`}
                          className="flex flex-col justify-between bg-fv-parchment border border-fv-border rounded-2xl p-4 gap-5"
                        >
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex items-start gap-4 min-w-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fv-parchment-border flex-shrink-0">
                                <span className="font-hedvig text-[24px] leading-[32px] text-fv-ink">
                                  {first}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-averia font-normal text-[24px] leading-[32px] text-fv-ink truncate">
                                  {brand.name}
                                </h3>
                                <div className="mt-1 flex items-center gap-4 flex-wrap">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <MapPin
                                      className="h-5 w-5 text-fv-text-muted"
                                      aria-hidden="true"
                                    />
                                    <span className="font-inter text-[14px] leading-[20px] text-fv-text-muted truncate">
                                      {brand.country || "Unknown"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Droplets
                                      className="h-5 w-5 text-fv-text-muted"
                                      aria-hidden="true"
                                    />
                                    <span className="font-inter text-[14px] leading-[20px] text-fv-text-muted">
                                      {count}{" "}
                                      {count === 1 ? "Fragrance" : "Fragrances"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <span className="flex items-center justify-center gap-2 w-full h-10 border border-fv-border-strong rounded-lg font-inter font-medium text-[14px] leading-[22px] text-fv-ink hover:bg-fv-ink hover:text-white transition-colors">
                            View Details
                            <ArrowRight
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {hasMore && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => loadMoreForLetter(group.letter)}
                      disabled={isLoadingThis}
                      className="h-[50px] px-4 rounded-xl bg-fv-ink text-white font-inter font-medium text-[16px] leading-[26px] flex items-center gap-3 disabled:opacity-50"
                    >
                      {isLoadingThis ? (
                        <>
                          <Loader2
                            className="h-5 w-5 animate-spin"
                            aria-hidden="true"
                          />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More
                          <span className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
                            <ArrowRight
                              className="h-5 w-5 text-fv-ink"
                              aria-hidden="true"
                            />
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
