'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, Loader2, X } from 'lucide-react';

interface AutocompleteProps {
  placeholder?: string;
  onSelect?: (item: any) => void;
  className?: string;
}

export default function SearchAutocomplete({
  placeholder = 'Search',
  onSelect,
  className = '',
}: AutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'brands' | 'perfumes'>('brands');
  const [results, setResults] = useState<{ brands: any[]; perfumes: any[] }>({
    brands: [],
    perfumes: [],
  });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🚀 OPTIMIZED: Debounced search with abort controller
  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (query.trim().length < 2) {
      setResults({ brands: [], perfumes: [] });
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // 🚀 INCREASED DEBOUNCE: 500ms instead of 300ms (less API calls)
    const timer = setTimeout(async () => {
      // Create new abort controller for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(
          `/api/search/autocomplete?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        
        if (!res.ok) throw new Error('Search failed');
        
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
        }
      } finally {
        setLoading(false);
      }
    }, 500); // 🚀 Increased from 300ms to 500ms

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  const handleSelect = useCallback((item: any, type: 'brand' | 'perfume') => {
    if (onSelect) {
      onSelect({ ...item, type });
    }
    setQuery('');
    setIsOpen(false);
  }, [onSelect]);

  const hasResults = results.brands.length > 0 || results.perfumes.length > 0;

  const clearSearch = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  // Determine border color based on state
  const borderColor = isFocused || query.length > 0 ? 'border-[#B28845]' : 'border-fv-sand-border';

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Search Container - matches Figma: padding 8px 12px, gap 8px, h-42px, border-radius 12px */}
      <div className={`flex h-[42px] items-center rounded-xl border ${borderColor} bg-transparent py-2 px-3 gap-2 transition-colors`}>
        {/* Search Icon - 24x24, color #9E7127 */}
        <Search className="h-6 w-6 shrink-0 text-fv-gold-dark" strokeWidth={2} />
        
        {/* Input - Averia Serif Libre, 300 weight, 18px, line-height 26px */}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (query.length >= 2 && hasResults) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          className="h-[26px] flex-1 bg-transparent text-fv-ink placeholder:text-fv-sand-border font-[var(--font-averia)] text-[18px] leading-[26px] font-light focus:outline-none"
        />
        
        {/* Loading Spinner */}
        {loading && (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-fv-olive" />
        )}
        
        {/* Clear Button - 20x20, color #737270, only visible when there's text */}
        {query.length > 0 && !loading && (
          <button
            type="button"
            onClick={clearSearch}
            className="h-5 w-5 shrink-0 flex items-center justify-center text-[#737270] hover:text-fv-ink transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown - Figma style */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-3 w-full min-w-[320px] lg:w-[530px] flex flex-col gap-5 p-4 bg-[#FFF9EF] border border-[#C4C4C3] rounded-2xl shadow-lg">
          {/* Tabs */}
          <div className="flex items-center w-full h-9 border border-[#E2E1E1] rounded-full overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveTab('brands')}
              className={`flex-1 h-full flex items-center justify-center font-inter font-medium text-sm leading-5 rounded-full transition-colors ${
                activeTab === 'brands'
                  ? 'bg-[#211F1C] text-white'
                  : 'bg-transparent text-[#211F1C] hover:bg-[#E2E1E1]/50'
              }`}
            >
              Brands ({results.brands.length.toString().padStart(2, '0')})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('perfumes')}
              className={`flex-1 h-full flex items-center justify-center font-inter font-medium text-sm leading-5 rounded-full transition-colors ${
                activeTab === 'perfumes'
                  ? 'bg-[#211F1C] text-white'
                  : 'bg-transparent text-[#211F1C] hover:bg-[#E2E1E1]/50'
              }`}
            >
              Perfumes ({results.perfumes.length.toString().padStart(2, '0')})
            </button>
          </div>

          {/* Results List */}
          {hasResults ? (
            <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto search-results-scroll pr-1">
              {activeTab === 'brands' && results.brands.length > 0 && (
                results.brands.map((brand) => (
                  <Link
                    key={brand._id}
                    href={`/brands/${brand.slug || brand._id}`}
                    onClick={() => handleSelect(brand, 'brand')}
                    className="flex items-center justify-between gap-2 group"
                  >
                    <span className="font-averia font-light text-xl leading-7 text-[#211F1C] truncate group-hover:text-[#8A6A35] transition-colors">
                      {brand.name}
                    </span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden="true">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#8A6A35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                ))
              )}
              {activeTab === 'perfumes' && results.perfumes.length > 0 && (
                results.perfumes.map((perfume) => (
                  <Link
                    key={perfume._id}
                    href={`/perfumes/${perfume.slug || perfume._id}`}
                    onClick={() => handleSelect(perfume, 'perfume')}
                    className="flex items-center justify-between gap-2 group"
                  >
                    <span className="font-averia font-light text-xl leading-7 text-[#211F1C] truncate group-hover:text-[#8A6A35] transition-colors">
                      {perfume.variant_name}
                    </span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden="true">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#8A6A35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                ))
              )}
              {/* Empty tab state */}
              {activeTab === 'brands' && results.brands.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#E2E1E1]">
                    <Search className="w-6 h-6 text-[#737270]" />
                  </div>
                  <div className="text-center">
                    <p className="font-inter font-medium text-base text-[#211F1C]">No Matches This Time</p>
                    <p className="font-inter font-normal text-sm text-[#737270]">Maybe tweak the spelling or try something else</p>
                  </div>
                </div>
              )}
              {activeTab === 'perfumes' && results.perfumes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#E2E1E1]">
                    <Search className="w-6 h-6 text-[#737270]" />
                  </div>
                  <div className="text-center">
                    <p className="font-inter font-medium text-base text-[#211F1C]">No Matches This Time</p>
                    <p className="font-inter font-normal text-sm text-[#737270]">Maybe tweak the spelling or try something else</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* No Results at all */
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#E2E1E1]">
                <Search className="w-6 h-6 text-[#737270]" />
              </div>
              <div className="text-center">
                <p className="font-inter font-medium text-base text-[#211F1C]">No Matches This Time</p>
                <p className="font-inter font-normal text-sm text-[#737270]">Maybe tweak the spelling or try something else</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .search-results-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .search-results-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .search-results-scroll::-webkit-scrollbar-thumb {
          background: #E2E1E1;
          border-radius: 32px;
        }
        .search-results-scroll::-webkit-scrollbar-thumb:hover {
          background: #C4C4C3;
        }
      `}</style>
    </div>
  );
}