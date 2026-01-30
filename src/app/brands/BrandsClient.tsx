'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Droplets, Grid, List, Loader2, MapPin, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

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

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const LETTER_RANGES = ['A-C', 'D-F', 'G-I', 'J-L', 'M-O', 'P-R', 'S-U', 'V-X', 'Y-Z'] as const;

function normalizeLetterRange(letter: string | undefined): string {
  const trimmed = (letter || '').trim().toUpperCase();
  if (!trimmed) return 'A-C';
  const match = (LETTER_RANGES as readonly string[]).includes(trimmed);
  return match ? trimmed : 'A-C';
}

function lettersFromRange(range: string): string[] {
  const trimmed = (range || '').trim().toUpperCase();
  if (!trimmed || trimmed === 'ALL') return [];
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

export default function BrandsClient({ initialItems, total, meta, query, pageSize, letterTotals = {} }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(query.q);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState(query.sort || 'name');
  const [selectedLetter, setSelectedLetter] = useState(normalizeLetterRange(query.letter));
  const [isSearching, setIsSearching] = useState(false);
  
  // Track items per letter (can be appended via Load More)
  const [itemsPerLetter, setItemsPerLetter] = useState<Record<string, BrandItem[]>>({});
  // Track current page per letter for backend pagination
  const [pagePerLetter, setPagePerLetter] = useState<Record<string, number>>({});
  // Track loading state per letter
  const [loadingLetter, setLoadingLetter] = useState<string | null>(null);

  // Initialize items per letter from initialItems
  useEffect(() => {
    const groups: Record<string, BrandItem[]> = {};
    for (const b of initialItems) {
      const first = (b.name?.trim()?.[0] || '').toUpperCase();
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
    return ALPHABET.filter((l) => visibleLetters.has(l) && (itemsPerLetter[l]?.length || 0) > 0).map((l) => {
      const items = itemsPerLetter[l] || [];
      const fragrancesTotal = items.reduce(
        (acc, it) => acc + (it.perfumes_count ?? it.perfumes?.length ?? 0),
        0
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
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      else params.delete('q');
      params.set('sort', sortBy);
      params.set('letter', normalizeLetterRange(selectedLetter));
      params.set('page', '1');
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
      params.set('letter', letter);
      params.set('page', String(nextPage));
      params.set('sort', sortBy);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const url = `/api/brands/by-letter?${params.toString()}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        const text = await res.text();
        console.error('API error:', res.status, text);
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data.items || !Array.isArray(data.items)) {
        console.error('Invalid API response:', data);
        throw new Error('Invalid response format');
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
      console.error('Error loading more brands:', error);
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
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none h-[50px] pl-4 pr-10 rounded-xl border border-fv-border-strong bg-white font-inter font-medium text-[16px] lg:text-[18px] leading-[26px] text-fv-ink focus:outline-none"
                aria-label="Sort by"
              >
                <option value="name">Name (A-Z)</option>
                <option value="fragrances">Most Fragrances</option>
                <option value="country">Country</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-fv-ink"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-12">
          <div className="relative flex-1">
            <div className="flex items-center gap-2 h-[50px] rounded-xl border border-fv-sand-border bg-white px-3">
              <Search className="h-6 w-6 text-fv-gold-dark" aria-hidden="true" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent outline-none font-averia font-light text-[18px] leading-[26px] text-fv-ink placeholder:text-fv-sand-border"
              />
              {isSearching && <Loader2 className="h-5 w-5 animate-spin text-fv-gold-dark" aria-hidden="true" />}
            </div>
          </div>

          <div className="flex justify-end">
            <div className="flex h-[50px] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`h-[50px] w-[62px] flex items-center justify-center border border-fv-border-strong border-r-0 rounded-l-lg ${
                  viewMode === 'grid' ? 'bg-fv-parchment-border' : 'bg-white'
                }`}
                aria-label="Grid view"
              >
                <Grid
                  className={`h-[28px] w-[28px] ${viewMode === 'grid' ? 'text-fv-ink' : 'text-fv-border-strong'}`}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`h-[50px] w-[62px] flex items-center justify-center border border-fv-border-strong rounded-r-lg ${
                  viewMode === 'list' ? 'bg-fv-parchment-border' : 'bg-white'
                }`}
                aria-label="List view"
              >
                <List
                  className={`h-[28px] w-[28px] ${viewMode === 'list' ? 'text-fv-ink' : 'text-fv-border-strong'}`}
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
          <div className="border border-fv-border rounded-full h-12 px-1 flex items-center overflow-x-auto">
            {LETTER_RANGES.map((range) => {
              const active = normalizeLetterRange(selectedLetter) === range;
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedLetter(range)}
                  className={`flex-shrink-0 h-10 px-6 lg:px-12 rounded-full font-inter font-medium text-[16px] lg:text-[20px] leading-[28px] transition-colors ${
                    active ? 'bg-fv-ink text-white' : 'bg-transparent text-fv-ink hover:bg-black/5'
                  }`}
                >
                  {range}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grouped Results */}
      <div className="flex flex-col gap-5">
        {groupedBrands.length === 0 && !isSearching ? (
          <div className="text-center py-12">
            <p className="font-inter text-[18px] leading-[26px] text-fv-text-muted">No brands found.</p>
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
                    {group.fragrancesTotal} Fragrances ({group.items.length} of {group.totalForLetter} brands)
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.items.map((brand) => {
                      const count = brand.perfumes_count ?? brand.perfumes?.length ?? 0;
                      const first = (brand.name?.trim()?.[0] || 'B').toUpperCase();
                      return (
                        <Link
                          key={brand._id}
                          href={`/brands/${brand.slug || brand._id}`}
                          className="flex flex-col justify-between bg-fv-parchment border border-fv-border rounded-2xl p-4 gap-5 min-h-[240px]"
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fv-parchment-border">
                              <span className="font-hedvig text-[24px] leading-[32px] text-fv-ink">{first}</span>
                            </div>

                            <div className="flex flex-col gap-3">
                              <h3 className="font-averia font-normal text-[24px] leading-[32px] text-fv-ink">
                                {brand.name}
                              </h3>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1 min-w-0">
                                  <MapPin className="h-5 w-5 text-fv-text-muted" aria-hidden="true" />
                                  <span className="font-inter text-[14px] leading-[20px] text-fv-text-muted truncate">
                                    {brand.country || 'Unknown'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Droplets className="h-5 w-5 text-fv-text-muted" aria-hidden="true" />
                                  <span className="font-inter text-[14px] leading-[20px] text-fv-text-muted text-right">
                                    {count} {count === 1 ? 'Fragrance' : 'Fragrances'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <span className="flex items-center justify-center gap-2 w-full h-10 border border-fv-border-strong rounded-lg font-inter font-medium text-[14px] leading-[22px] text-fv-ink hover:bg-fv-ink hover:text-white transition-colors">
                            View Details
                            <ArrowRight className="h-5 w-5" aria-hidden="true" />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {group.items.map((brand) => {
                      const count = brand.perfumes_count ?? brand.perfumes?.length ?? 0;
                      const first = (brand.name?.trim()?.[0] || 'B').toUpperCase();
                      return (
                        <Link
                          key={brand._id}
                          href={`/brands/${brand.slug || brand._id}`}
                          className="flex flex-col justify-between bg-fv-parchment border border-fv-border rounded-2xl p-4 gap-5"
                        >
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex items-start gap-4 min-w-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fv-parchment-border flex-shrink-0">
                                <span className="font-hedvig text-[24px] leading-[32px] text-fv-ink">{first}</span>
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-averia font-normal text-[24px] leading-[32px] text-fv-ink truncate">
                                  {brand.name}
                                </h3>
                                <div className="mt-1 flex items-center gap-4 flex-wrap">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <MapPin className="h-5 w-5 text-fv-text-muted" aria-hidden="true" />
                                    <span className="font-inter text-[14px] leading-[20px] text-fv-text-muted truncate">
                                      {brand.country || 'Unknown'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Droplets className="h-5 w-5 text-fv-text-muted" aria-hidden="true" />
                                    <span className="font-inter text-[14px] leading-[20px] text-fv-text-muted">
                                      {count} {count === 1 ? 'Fragrance' : 'Fragrances'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <span className="flex items-center justify-center gap-2 w-full h-10 border border-fv-border-strong rounded-lg font-inter font-medium text-[14px] leading-[22px] text-fv-ink hover:bg-fv-ink hover:text-white transition-colors">
                            View Details
                            <ArrowRight className="h-5 w-5" aria-hidden="true" />
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
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More 
                          <span className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
                            <ArrowRight className="h-5 w-5 text-fv-ink" aria-hidden="true" />
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