"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  ArrowRight,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type PerfumeDoc = {
  _id: string;
  brand_name: string;
  variant_name: string;
  slug?: string;
  image?: string;
  gender?: string;
  rating?: number;
  reviewCount?: number;
  accords?: string[];
};

interface Props {
  initialItems: PerfumeDoc[];
  total: number;
  meta: { page: number; totalPages: number; total: number };
  query: { q: string; gender: string; brand: string; sort: string };
  pageSize: number;
}

export default function PerfumesClient({
  initialItems,
  total,
  meta,
  query,
  pageSize,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(query.q);
  const [gender, setGender] = useState(query.gender);
  const [brand, setBrand] = useState(query.brand);
  const [sort, setSort] = useState(query.sort || "az");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMobileSortDropdown, setShowMobileSortDropdown] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter states
  const [minRating, setMinRating] = useState(1);
  const [minLongevity, setMinLongevity] = useState(1);
  const [minSillage, setMinSillage] = useState(1);
  const [perfumerSearch, setPerfumerSearch] = useState("");
  const [notesSearch, setNotesSearch] = useState("");
  const [accordsSearch, setAccordsSearch] = useState("");

  // Brand filter autocomplete states
  const [brandSearch, setBrandSearch] = useState(query.brand || "");
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const brandInputRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const mobileSortRef = useRef<HTMLDivElement>(null);

  const items = initialItems;

  const sortedItems = useMemo(() => {
    const arr = [...items];
    if (sort === "rating") {
      arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sort === "az") {
      arr.sort((a, b) => a.variant_name.localeCompare(b.variant_name));
    } else if (sort === "za") {
      arr.sort((a, b) => b.variant_name.localeCompare(a.variant_name));
    }
    return arr;
  }, [items, sort]);

  // Extract unique brands from current results
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    items.forEach((item) => {
      if (item.brand_name) brands.add(item.brand_name);
    });
    return Array.from(brands).sort();
  }, [items]);

  // Filter brand suggestions based on search
  useEffect(() => {
    if (!brandSearch.trim()) {
      setBrandSuggestions(availableBrands.slice(0, 5));
      return;
    }
    const filtered = availableBrands
      .filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()))
      .slice(0, 5);
    setBrandSuggestions(filtered);
  }, [brandSearch, availableBrands]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        brandInputRef.current &&
        !brandInputRef.current.contains(event.target as Node)
      ) {
        setShowBrandDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
      if (
        mobileSortRef.current &&
        !mobileSortRef.current.contains(event.target as Node)
      ) {
        setShowMobileSortDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync local state when URL params change (e.g., browser back/forward)
  useEffect(() => {
    setQ(query.q);
    setGender(query.gender);
    setBrand(query.brand);
    setBrandSearch(query.brand || "");
    setSort(query.sort || "az");
  }, [query.q, query.gender, query.brand, query.sort]);

  // Main search/filter effect
  useEffect(() => {
    setIsSearching(true);
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q.trim()) params.set("q", q.trim());
      else params.delete("q");
      if (gender) params.set("gender", gender);
      else params.delete("gender");
      if (brand) params.set("brand", brand);
      else params.delete("brand");
      params.set("minRating", String(minRating));
      params.set("minLongevity", String(minLongevity));
      params.set("minSillage", String(minSillage));
      if (perfumerSearch.trim()) params.set("perfumer", perfumerSearch.trim());
      else params.delete("perfumer");

      if (notesSearch.trim()) params.set("notes", notesSearch.trim());
      else params.delete("notes");

      if (accordsSearch.trim()) params.set("accords", accordsSearch.trim());
      else params.delete("accords");
      params.set("sort", sort);
      params.set("page", "1");
      router.replace(`/perfumes?${params.toString()}`);
      setIsSearching(false);
    }, 300);
    return () => {
      clearTimeout(t);
      setIsSearching(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    q,
    gender,
    brand,
    sort,
    minRating,
    minLongevity,
    minSillage,
    perfumerSearch,
    notesSearch,
    accordsSearch,
  ]);

  function gotoPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.replace(`/perfumes?${params.toString()}`);
  }

  // Handle brand selection
  function selectBrand(brandName: string) {
    setBrand(brandName);
    setBrandSearch(brandName);
    setShowBrandDropdown(false);
  }

  // Clear all filters
  function clearAllFilters() {
    setQ("");
    setGender("");
    setBrand("");
    setBrandSearch("");
    setMinRating(1);
    setMinLongevity(1);
    setMinSillage(1);
    setPerfumerSearch("");
    setNotesSearch("");
    setAccordsSearch("");
  }

  const sortOptions = [
    { value: "az", label: "Name (A-Z)" },
    { value: "za", label: "Name (Z-A)" },
    { value: "rating", label: "Highest Rated" },
    { value: "new", label: "Newest First" },
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-hedvig font-normal text-xl lg:text-2xl leading-8 text-[#8A6A35]">
            Discover the range
          </span>
          <h2 className="font-hedvig font-normal text-[32px] leading-[40px] lg:text-[40px] lg:leading-[56px] text-[#211F1C]">
            The fragrance lineup
          </h2>
        </div>

        {/* Sort Dropdown - Desktop */}
        <div className="hidden lg:block relative" ref={sortRef}>
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center justify-between gap-3 px-4 py-3 min-w-[224px] border border-[#C4C4C3] rounded-xl bg-white"
          >
            <span className="font-inter font-medium text-lg text-[#211F1C]">
              Sort by{" "}
              {sortOptions.find((o) => o.value === sort)?.label || "Name (A-Z)"}
            </span>
            <ChevronDown
              className={`w-6 h-6 text-[#211F1C] transition-transform ${
                showSortDropdown ? "rotate-180" : ""
              }`}
            />
          </button>
          {showSortDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-[#E2E1E1] rounded-xl shadow-lg overflow-hidden">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSort(option.value);
                    setShowSortDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 font-inter text-base transition-colors ${
                    sort === option.value
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

      {/* Mobile Sort Dropdown */}
      <div className="lg:hidden relative" ref={mobileSortRef}>
        <button
          onClick={() => setShowMobileSortDropdown(!showMobileSortDropdown)}
          className="flex items-center justify-between gap-3 px-4 py-3 w-full border border-[#C4C4C3] rounded-xl bg-white"
        >
          <span className="font-inter font-medium text-base text-[#211F1C]">
            Sort by{" "}
            {sortOptions.find((o) => o.value === sort)?.label || "Name (A-Z)"}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-[#211F1C] transition-transform ${
              showMobileSortDropdown ? "rotate-180" : ""
            }`}
          />
        </button>
        {showMobileSortDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-[#E2E1E1] rounded-xl shadow-lg overflow-hidden">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSort(option.value);
                  setShowMobileSortDropdown(false);
                }}
                className={`w-full text-left px-4 py-3 font-inter text-base transition-colors ${
                  sort === option.value
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-[#9E7127]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by perfume name"
          className="w-full pl-14 pr-10 py-3 rounded-xl border border-[#D9CDB9] bg-white text-[#211F1C] font-averia font-light text-lg placeholder:text-[#D9CDB9] placeholder:text-left focus:outline-none focus:ring-2 focus:ring-[#8A6A35] focus:border-transparent transition-all"
        />
        {isSearching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-[#9E7127]" />
        )}
      </div>

      {/* Main Content: Filters + Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 border border-[#E2E1E1] rounded-xl bg-white"
        >
          <span className="font-averia font-normal text-xl text-[#211F1C]">
            Filters
          </span>
          <ChevronDown
            className={`w-5 h-5 text-[#211F1C] transition-transform ${
              showMobileFilters ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Filters Sidebar */}
        <aside
          className={`lg:w-[306px] flex-shrink-0 ${
            showMobileFilters ? "block" : "hidden lg:block"
          }`}
        >
          <div className="bg-white border border-[#E2E1E1] rounded-2xl p-5 flex flex-col gap-10">
            {/* Filters Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-averia font-normal text-2xl leading-8 text-[#211F1C]">
                Filters
              </h3>
              <button
                onClick={clearAllFilters}
                className="font-inter font-medium text-xl leading-7 text-[#211F1C] underline hover:text-[#8A6A35] transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Brands Filter */}
            <div className="flex flex-col gap-2">
              <label className="font-inter font-medium text-xl leading-7 text-[#211F1C]">
                Brands
              </label>
              <div className="relative" ref={brandInputRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-[#9E7127]" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => {
                    setBrandSearch(e.target.value);
                    setShowBrandDropdown(true);
                  }}
                  onFocus={() => setShowBrandDropdown(true)}
                  placeholder="Search brands"
                  className="w-full pl-11 pr-4 py-2 rounded-xl border border-[#D9CDB9] bg-white text-[#211F1C] font-averia font-light text-lg placeholder:text-[#D9CDB9] focus:outline-none focus:ring-2 focus:ring-[#8A6A35] focus:border-transparent"
                />
                {brand && (
                  <button
                    onClick={() => {
                      setBrand("");
                      setBrandSearch("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737270] hover:text-[#211F1C]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {showBrandDropdown && brandSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 max-h-60 overflow-y-auto rounded-xl border border-[#E2E1E1] bg-white shadow-lg">
                    {brandSuggestions.map((brandName) => (
                      <button
                        key={brandName}
                        onClick={() => selectBrand(brandName)}
                        className="w-full text-left px-4 py-3 hover:bg-[#FFF4E3] text-[#211F1C] font-inter border-b border-[#E2E1E1] last:border-b-0 transition-colors"
                      >
                        {brandName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Perfumers Filter */}
            <div className="flex flex-col gap-2">
              <label className="font-inter font-medium text-xl leading-7 text-[#211F1C]">
                Perfumers
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-[#9E7127]" />
                <input
                  type="text"
                  value={perfumerSearch}
                  onChange={(e) => setPerfumerSearch(e.target.value)}
                  placeholder="Search perfumers"
                  className="w-full pl-11 pr-4 py-2 rounded-xl border border-[#D9CDB9] bg-white text-[#211F1C] font-averia font-light text-lg placeholder:text-[#D9CDB9] focus:outline-none focus:ring-2 focus:ring-[#8A6A35] focus:border-transparent"
                />
              </div>
            </div>

            {/* Gender Filter */}
            <div className="flex flex-col gap-2">
              <label className="font-inter font-medium text-xl leading-7 text-[#211F1C]">
                Gender
              </label>
              <div className="flex flex-col gap-3">
                {[
                  { value: "", label: "All" },
                  { value: "men", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "unisex", label: "Unisex" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        gender === option.value
                          ? "border-[#FBC061] bg-[#FBC061]"
                          : "border-[#C4C4C3] bg-white"
                      }`}
                    >
                      {gender === option.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="font-inter font-normal text-base leading-6 text-[#211F1C]">
                      {option.label}
                    </span>
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={gender === option.value}
                      onChange={(e) => setGender(e.target.value)}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Rating Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-inter font-medium text-xl leading-7 text-[#211F1C]">
                  Minimum Rating
                </label>
                <span className="font-inter font-medium text-base leading-6 text-[#211F1C]">
                  {minRating}
                </span>
              </div>
              <div className="flex flex-col gap-3 ">
                <div className="relative h-2.5 rounded-full bg-[#FDE2B6]">
                  <div
                    className="absolute top-0 h-2.5 rounded-full bg-[#B28845]"
                    style={{ width: `${((minRating - 1) / 4) * 100}%` }}
                  />
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="range-slider absolute top-0 w-full h-2.5 bg-transparent cursor-pointer"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="font-inter font-medium text-base leading-6 text-[#211F1C]">
                    1
                  </span>
                  <span className="font-inter font-medium text-base leading-6 text-[#211F1C]">
                    5
                  </span>
                </div>
              </div>
            </div>

            {/* Minimum Longevity Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-inter font-medium text-xl leading-7 text-[#211F1C]">
                  Minimum Longevity
                </label>
                <span className="font-inter font-medium text-base leading-6 text-[#211F1C]">
                  {minLongevity}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="relative h-2.5 bg-[#FDE2B6] rounded-full">
                  <div
                    className="absolute top-0 h-2.5 bg-[#B28845] rounded-full"
                    style={{ width: `${((minLongevity - 1) / 4) * 100}%` }}
                  />
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={minLongevity}
                    onChange={(e) =>
                      setMinLongevity(parseFloat(e.target.value))
                    }
                    className="range-slider absolute top-0 w-full h-2.5  bg-transparent cursor-pointer"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="font-inter font-medium text-base leading-6 text-[#211F1C]">
                    1
                  </span>
                  <span className="font-inter font-medium text-base leading-6 text-[#211F1C]">
                    5
                  </span>
                </div>
              </div>
            </div>

            {/* Minimum Sillage Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-inter font-medium text-xl leading-7 text-[#211F1C]">
                  Minimum Sillage
                </label>
                <span className="font-inter font-medium text-base leading-6 text-[#211F1C]">
                  {minSillage}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="relative h-2.5 bg-[#FDE2B6] rounded-full">
                  <div
                    className="absolute top-0 h-2.5 bg-[#B28845] rounded-full"
                    style={{ width: `${((minSillage - 1) / 4) * 100}%` }}
                  />
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={minSillage}
                    onChange={(e) => setMinSillage(parseFloat(e.target.value))}
                    className="range-slider absolute top-0 w-full h-2.5  bg-transparent cursor-pointer"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="font-inter font-medium text-base leading-6 text-[#211F1C]">
                    1
                  </span>
                  <span className="font-inter font-medium text-base leading-6 text-[#211F1C]">
                    5
                  </span>
                </div>
              </div>
            </div>

            {/* Notes Filter */}
            <div className="flex flex-col gap-2">
              <label className="font-inter font-medium text-xl leading-7 text-[#211F1C]">
                Notes
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-[#9E7127]" />
                <input
                  type="text"
                  value={notesSearch}
                  onChange={(e) => setNotesSearch(e.target.value)}
                  placeholder="Search Notes"
                  className="w-full pl-11 pr-4 py-2 rounded-xl border border-[#D9CDB9] bg-white text-[#211F1C] font-averia font-light text-lg placeholder:text-[#D9CDB9] focus:outline-none focus:ring-2 focus:ring-[#8A6A35] focus:border-transparent"
                />
              </div>
            </div>

            {/* Accords Filter */}
            <div className="flex flex-col gap-2">
              <label className="font-inter font-medium text-xl leading-7 text-[#211F1C]">
                Accords
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-[#9E7127]" />
                <input
                  type="text"
                  value={accordsSearch}
                  onChange={(e) => setAccordsSearch(e.target.value)}
                  placeholder="Search Accords"
                  className="w-full pl-11 pr-4 py-2 rounded-xl border border-[#D9CDB9] bg-white text-[#211F1C] font-averia font-light text-lg placeholder:text-[#D9CDB9] focus:outline-none focus:ring-2 focus:ring-[#8A6A35] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid Section */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Products Grid */}
          <div className="relative">
            {/* Loading Overlay */}
            {isSearching && (
              <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-2xl">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#8A6A35]" />
                  <span className="font-inter text-sm text-[#737270]">
                    Loading...
                  </span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedItems.map((item) => {
                const imageSrc =
                  typeof item.image === "string"
                    ? item.image
                    : (
                        item.image as unknown as
                          | { src?: string; url?: string }
                          | undefined
                      )?.src ||
                      (
                        item.image as unknown as
                          | { src?: string; url?: string }
                          | undefined
                      )?.url;

                const genderLabel =
                  typeof item.gender === "string"
                    ? item.gender
                    : (item.gender as unknown as { name?: string } | undefined)
                        ?.name;

                const formattedGender = genderLabel
                  ? genderLabel.charAt(0).toUpperCase() + genderLabel.slice(1)
                  : "";

                return (
                  <Link
                    href={`/perfumes/${item.slug || item._id}`}
                    key={item._id}
                    className="flex flex-col bg-[#FFF9EF] rounded-2xl overflow-hidden group cursor-pointer hover:shadow-md"
                  >
                    {/* Image Section */}
                    <div className="relative aspect-[306/315] bg-white border border-[#EFEFEF] border-b-0 rounded-t-2xl overflow-hidden">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.variant_name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-all duration-300 ease-in-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#FFF9EF]">
                          <span className="font-hedvig text-2xl text-[#695129]">
                            Fragview
                          </span>
                        </div>
                      )}

                      {/* Gender Badge */}
                      {formattedGender && (
                        <span className="absolute top-4 left-4 px-[10px] py-1 rounded-full bg-[#ECE0CF] font-inter font-medium text-sm leading-5 text-[#695129]">
                          {formattedGender}
                        </span>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col justify-between flex-1 p-6 gap-6">
                      <div className="flex flex-col gap-3">
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <Star className="w-6 h-6 fill-[#FBC061] text-[#FBC061]" />
                          <span className="font-inter font-medium text-lg leading-[26px] text-[#211F1C]">
                            {item.rating ? item.rating.toFixed(1) : "0.0"}
                          </span>
                          <span className="font-inter font-normal text-base leading-6 text-[#4A4946]">
                            ({item.reviewCount || 0} reviews)
                          </span>
                        </div>

                        {/* Name & Brand */}
                        <div className="flex flex-col gap-1.5">
                          <h3 className="font-averia font-normal text-2xl leading-8 text-[#211F1C] line-clamp-2">
                            {item.variant_name}
                          </h3>
                          <p className="font-inter font-normal text-base leading-6 text-[#4A4946]">
                            {item.brand_name}
                          </p>
                        </div>

                        {/* Accords Tags */}
                        <div className="flex flex-wrap gap-2">
                          {(item.accords || ["Amber", "Vanilla", "Floral"])
                            .map((accord) =>
                              typeof accord === "string"
                                ? accord
                                : (
                                    accord as unknown as
                                      | { name?: string }
                                      | undefined
                                  )?.name || "",
                            )
                            .filter(Boolean)
                            .slice(0, 3)
                            .map((accordLabel, index) => (
                              <span
                                key={`${item._id}-accord-${index}`}
                                className="px-[10px] py-1 rounded-full bg-[#ECE0CF] font-inter font-medium text-sm leading-5 text-[#695129]"
                              >
                                {accordLabel}
                              </span>
                            ))}
                        </div>
                      </div>

                      {/* View Details Button */}
                      <div className="flex items-center justify-center gap-2 px-4 py-2 border border-[#C4C4C3] rounded-lg hover:bg-[#FFF4E3] transition-colors">
                        <span className="font-inter font-medium text-lg leading-[26px] text-[#211F1C]">
                          View Details
                        </span>
                        <ArrowRight className="w-6 h-6 text-[#211F1C]" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* No Results */}
          {sortedItems.length === 0 && !isSearching && (
            <div className="text-center py-16">
              <div className="inline-flex flex-col items-center gap-4">
                <div className="w-16 h-16 flex items-center justify-center">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r="14"
                      stroke="#737270"
                      strokeWidth="2"
                    />
                    <path
                      d="M30 30L42 42"
                      stroke="#737270"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="font-inter font-normal text-lg text-[#737270]">
                  No perfumes found matching your criteria.
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
              {/* Previous */}
              <button
                onClick={() => gotoPage(meta.page - 1)}
                disabled={meta.page === 1}
                className={`
        flex items-center justify-center gap-2
        px-3 sm:px-4
        h-10 sm:h-12
        border rounded-lg
        font-inter font-medium
        text-sm sm:text-base
        transition-all
        flex-shrink-0
        ${
          meta.page > 1
            ? "border-[#E2E1E1] text-[#211F1C] hover:bg-[#FFF9EF]"
            : "border-[#E2E1E1] text-[#C4C4C3] cursor-not-allowed"
        }
      `}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Pages */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* First page */}
                <button
                  onClick={() => gotoPage(1)}
                  className={`
          w-10 h-10 sm:w-12 sm:h-12
          flex items-center justify-center
          rounded-lg
          border
          font-inter font-medium
          text-sm sm:text-base
          transition-all
          flex-shrink-0
          ${
            meta.page === 1
              ? "bg-[#FBC061] border-[#FBC061] text-[#211F1C]"
              : "border-[#E2E1E1] text-[#211F1C] hover:bg-[#FFF9EF]"
          }
        `}
                >
                  1
                </button>

                {/* Left ellipsis */}
                {meta.page > 3 && (
                  <span className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#211F1C] font-inter font-medium text-sm sm:text-base">
                    ...
                  </span>
                )}

                {/* Current page and neighbors */}
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page > 1 &&
                      page < meta.totalPages &&
                      page >= meta.page - 1 &&
                      page <= meta.page + 1
                    );
                  })
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => gotoPage(page)}
                      className={`
              w-10 h-10 sm:w-12 sm:h-12
              flex items-center justify-center
              rounded-lg
              border
              font-inter font-medium
              text-sm sm:text-base
              transition-all
              flex-shrink-0
              ${
                page === meta.page
                  ? "bg-[#FBC061] border-[#FBC061] text-[#211F1C]"
                  : "border-[#E2E1E1] text-[#211F1C] hover:bg-[#FFF9EF]"
              }
            `}
                    >
                      {page}
                    </button>
                  ))}

                {/* Right ellipsis */}
                {meta.page < meta.totalPages - 2 && (
                  <span className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#211F1C] font-inter font-medium text-sm sm:text-base">
                    ...
                  </span>
                )}

                {/* Last page */}
                {meta.totalPages > 1 && (
                  <button
                    onClick={() => gotoPage(meta.totalPages)}
                    className={`
            w-10 h-10 sm:w-12 sm:h-12
            flex items-center justify-center
            rounded-lg
            border
            font-inter font-medium
            text-sm sm:text-base
            transition-all
            flex-shrink-0
            ${
              meta.page === meta.totalPages
                ? "bg-[#FBC061] border-[#FBC061] text-[#211F1C]"
                : "border-[#E2E1E1] text-[#211F1C] hover:bg-[#FFF9EF]"
            }
          `}
                  >
                    {meta.totalPages}
                  </button>
                )}
              </div>

              {/* Next */}
              <button
                onClick={() => gotoPage(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
                className={`
        flex items-center justify-center gap-2
        px-3 sm:px-4
        h-10 sm:h-12
        border rounded-lg
        font-inter font-medium
        text-sm sm:text-base
        transition-all
        flex-shrink-0
        ${
          meta.page < meta.totalPages
            ? "border-[#E2E1E1] text-[#211F1C] hover:bg-[#FFF9EF]"
            : "border-[#E2E1E1] text-[#C4C4C3] cursor-not-allowed"
        }
      `}
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
