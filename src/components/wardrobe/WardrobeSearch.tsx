"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, Sparkles, PlusCircle } from "lucide-react";

interface WardrobeSearchProps {
  onSelect: (item: {
    id: string;
    name: string;
    brand: string;
    image?: string;
  }) => void;
  autoFocus?: boolean; // New prop to control auto-focus
}

export default function WardrobeSearch({
  onSelect,
  autoFocus,
}: WardrobeSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      setIsOpen(true);
    }
  }, [autoFocus]);
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        // We still use your main search API
        const res = await fetch(
          `/api/search/autocomplete?q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        // FILTER: We only care about 'perfumes', ignore brands
        setResults(data.perfumes || []);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelection = (item: any) => {
    // Normalize the data structure to pass back
    onSelect({
      id: item._id || item.objectID,
      name: item.variant_name,
      brand: item.brand_name,
      image: item.image,
    });
    setQuery(""); // Clear search
    setIsOpen(false); // Close dropdown
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for a perfume..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="w-full rounded-xl border border-gray-200 bg-white px-10 py-3 text-sm text-gray-900 shadow-sm transition-all focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-600" />
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
          {results.length > 0 ? (
            <div>
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Fragrances Found
              </div>
              {results.map((perfume) => (
                <button
                  key={perfume._id}
                  onClick={() => handleSelection(perfume)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {perfume.image ? (
                      <img
                        src={perfume.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Sparkles className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {perfume.variant_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {perfume.brand_name}{" "}
                      {perfume.gender ? `• ${perfume.gender}` : ""}
                    </div>
                  </div>
                  <PlusCircle className="w-4 h-4 text-gray-600 ml-auto opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="p-4 text-center text-sm text-gray-500">
                No perfumes found.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
