'use client';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useAuthModal } from '@/components/auth/AuthModal';
import type { BrandDoc, PerfumeDoc } from './loaders';

interface Props {
  brand: BrandDoc;
  perfumes: PerfumeDoc[];
  meta: { page: number; totalPages: number; total: number };
  filters: { gender: string; collection: string; sort: string };
  pageSize: number;
}

export default function BrandDetailClient({ brand, perfumes: initialPerfumes, meta, filters: initialFilters, pageSize }: Props) {
  const { data: session } = useSession();
  const { open } = useAuthModal();
  const [selectedGender, setSelectedGender] = useState(initialFilters.gender);
  const [selectedCollection, setSelectedCollection] = useState(initialFilters.collection);
  const [selectedSort, setSelectedSort] = useState(initialFilters.sort);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Dropdown visibility states
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Refs for click outside handling
  const genderRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Brand Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(true);

  const collections = useMemo(() => {
    if (brand.collections_info && Array.isArray(brand.collections_info)) {
      return brand.collections_info;
    }
    return [];
  }, [brand.collections_info]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genderRef.current && !genderRef.current.contains(event.target as Node)) {
        setShowGenderDropdown(false);
      }
      if (collectionRef.current && !collectionRef.current.contains(event.target as Node)) {
        setShowCollectionDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dropdown option configs
  const genderOptions = [
    { value: '', label: 'All Genders' },
    { value: 'male', label: 'Men' },
    { value: 'female', label: 'Female' },
    { value: 'unisex', label: 'Unisex' },
  ];

  const sortOptions = [
    { value: '', label: 'Relevance' },
    { value: 'az', label: 'Name (A-Z)' },
    { value: 'za', label: 'Name (Z-A)' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  // Check if user is following this brand
  useEffect(() => {
    if (session?.user) {
      checkFollowStatus();
    } else {
      setCheckingFollow(false);
    }
  }, [session, brand._id]);

  const checkFollowStatus = async () => {
    try {
      const res = await fetch(`/api/brands/follow/check?brandId=${brand._id}`);
      const data = await res.json();
      setIsFollowing(data.isFollowing || false);
      setFollowerCount(data.followerCount || 0);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setCheckingFollow(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!session?.user) {
      open({ mode: 'signin', reason: `Sign in to follow ${brand.name}` });
      return;
    }

    setLoadingFollow(true);
    try {
      const res = await fetch('/api/brands/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: brand._id.toString(),
          brandName: brand.name
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsFollowing(data.isFollowing);
        setFollowerCount(prev => data.isFollowing ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error toggling brand follow:', error);
    } finally {
      setLoadingFollow(false);
    }
  };

  // CLIENT-SIDE FILTERING & SORTING
  const filteredAndSortedPerfumes = useMemo(() => {
    let result = [...initialPerfumes];

    // Filter by gender
    if (selectedGender) {
      result = result.filter(p => p.gender?.toLowerCase() === selectedGender.toLowerCase());
    }

    // Filter by collection
    if (selectedCollection) {
      result = result.filter(p => {
        if (!p.collection) return false;
        return p.collection.toLowerCase().includes(selectedCollection.toLowerCase());
      });
    }

    // Sort
    switch (selectedSort) {
      case 'az':
        result.sort((a, b) => (a.variant_name || '').localeCompare(b.variant_name || ''));
        break;
      case 'za':
        result.sort((a, b) => (b.variant_name || '').localeCompare(a.variant_name || ''));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'new':
        result.sort((a, b) => (b.release_year || 0) - (a.release_year || 0));
        break;
      case 'old':
        result.sort((a, b) => (a.release_year || 0) - (b.release_year || 0));
        break;
    }

    return result;
  }, [initialPerfumes, selectedGender, selectedCollection, selectedSort]);

  const shortDescription = brand.description?.slice(0, 400) + '...' || '';
  const shouldShowViewMore = (brand.description?.length || 0) > 400;

  return (
    <div>
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-[72px] py-8 lg:py-14" style={{ backgroundColor: '#FFF9EF' }}>
        <div className="flex flex-col lg:flex-row gap-6 max-w-[1296px] mx-auto">
          {/* LEFT: Brand Info */}
          <div className="flex-1 flex flex-col justify-center gap-6 lg:gap-8">
            {/* Brand Header with Logo */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 lg:gap-4">
                {/* Brand Initial Box */}
                <div
                  className="w-12 h-12 lg:w-[88px] lg:h-[88px] flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ backgroundColor: '#FEEBCE' }}
                >
                  <span
                    className="text-[28px] leading-[32px] lg:text-[56px] lg:leading-[64px] text-center"
                    style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#211F1C' }}
                  >
                    {brand.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Brand Name & Country */}
                <div className="flex flex-col gap-1 flex-1">
                  <h1
                    className="text-[24px] leading-[32px] lg:text-[48px] lg:leading-[56px]"
                    style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#211F1C' }}
                  >
                    {brand.name}
                  </h1>
                  {brand.country && (
                    <div className="flex items-center gap-1 lg:gap-2 px-1">
                      {/* Location Icon */}
                      <svg className="w-4 h-4 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#737270" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="#737270" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span
                        className="text-[14px] leading-[20px] lg:text-[20px] lg:leading-[28px]"
                        style={{ fontFamily: "'Inter', sans-serif", color: '#737270' }}
                      >
                        {brand.country}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {brand.description && (
                <div className="relative">
                  <p
                    className="text-[14px] leading-[22px] lg:text-[22px] lg:leading-[36px]"
                    style={{ fontFamily: "'Inter', sans-serif", color: '#737270' }}
                  >
                    {showFullDescription ? brand.description : shortDescription}
                  </p>
                  {shouldShowViewMore && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="inline-flex items-center gap-1 lg:gap-2 px-1 mt-2"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#211F1C' }}
                    >
                      {showFullDescription ? 'Read Less' : 'Read More'}
                      {/* Chevron Icon */}
                      <svg className="w-4 h-4 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: showFullDescription ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        <path d="M6 9L12 15L18 9" stroke="#211F1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 lg:gap-6">
              {/* Follow Brand Button */}
              <button
                onClick={handleFollowToggle}
                disabled={loadingFollow || checkingFollow}
                className="h-[42px] lg:h-[50px] px-3 lg:px-4 flex items-center justify-end gap-2 lg:gap-3 rounded-xl transition-all"
                style={{ backgroundColor: '#211F1C' }}
              >
                <span
                  className="text-[14px] leading-[22px] lg:text-[18px] lg:leading-[26px]"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#FFFFFF' }}
                >
                  {isFollowing ? 'Following' : 'Follow Brand'}
                </span>
                {/* Bell Icon Container */}
                <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#211F1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#211F1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>

              {/* Visit Website Button */}
              {brand.official_website && (
                <a
                  href={brand.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-[42px] lg:h-[50px] px-3 lg:px-4 flex items-center gap-2 lg:gap-3 rounded-xl border transition-all hover:bg-gray-50"
                  style={{ borderColor: '#211F1C' }}
                >
                  <span
                    className="text-[14px] leading-[22px] lg:text-[18px] lg:leading-[26px]"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#211F1C' }}
                  >
                    Visit Website
                  </span>
                  {/* Arrow Icon Container */}
                  <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg" style={{ backgroundColor: '#211F1C' }}>
                    <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7 7H17V17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* RIGHT: Brand Information Card */}
          <div
            className="w-full lg:w-[415px] p-4 lg:p-6 rounded-xl flex-shrink-0 h-fit"
            style={{ border: '1px solid #E2E1E1' }}
          >
            {/* Card Title */}
            <h3
              className="text-[18px] leading-[26px] lg:text-[24px] lg:leading-[32px] mb-4 lg:mb-6"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#211F1C' }}
            >
              Brand Information
            </h3>

            {/* Stats */}
            <div className="flex flex-col gap-3 lg:gap-4">
              {/* Total Fragrances */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1 lg:gap-2">
                  <span
                    className="text-[16px] leading-[24px] lg:text-[20px] lg:leading-[28px]"
                    style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#737270' }}
                  >
                    Total Fragrances
                  </span>
                  <span
                    className="text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px]"
                    style={{ fontFamily: "'Inter', sans-serif", color: '#211F1C' }}
                  >
                    {String(meta.total).padStart(2, '0')}
                  </span>
                </div>
                <div className="w-full h-px" style={{ backgroundColor: '#E2E1E1' }} />
              </div>

              {/* Total Followers */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1 lg:gap-2">
                  <span
                    className="text-[16px] leading-[24px] lg:text-[20px] lg:leading-[28px]"
                    style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#737270' }}
                  >
                    Total Followers
                  </span>
                  <span
                    className="text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px]"
                    style={{ fontFamily: "'Inter', sans-serif", color: '#211F1C' }}
                  >
                    {followerCount}
                  </span>
                </div>
                <div className="w-full h-px" style={{ backgroundColor: '#E2E1E1' }} />
              </div>

              {/* Established */}
              {brand.established && (
                <div className="flex flex-col gap-1 lg:gap-2">
                  <span
                    className="text-[16px] leading-[24px] lg:text-[20px] lg:leading-[28px]"
                    style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#737270' }}
                  >
                    Established
                  </span>
                  <span
                    className="text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px]"
                    style={{ fontFamily: "'Inter', sans-serif", color: '#211F1C' }}
                  >
                    {brand.established}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Scents by this brand Section */}
      <section className="px-4 sm:px-6 lg:px-[72px] py-10 lg:py-16" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-[1296px] mx-auto flex flex-col gap-8 lg:gap-12">
          {/* Header Row - Title on left, Filters on right for desktop */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Title Group */}
            <div className="flex flex-col gap-1">
              <span
                className="text-[18px] leading-[26px] lg:text-[24px] lg:leading-[32px]"
                style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#8A6A35' }}
              >
                Explore their range
              </span>
              <h2
                className="text-[28px] leading-[36px] lg:text-[48px] lg:leading-[56px]"
                style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#211F1C' }}
              >
                Scents by this brand
              </h2>
            </div>

            {/* Filters Row - Stacked on mobile, horizontal on desktop */}
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-center">
              {/* Gender Filter */}
              <div className="relative" ref={genderRef}>
                <button
                  onClick={() => {
                    setShowGenderDropdown(!showGenderDropdown);
                    setShowCollectionDropdown(false);
                    setShowSortDropdown(false);
                  }}
                  className="flex items-center justify-between gap-3 px-4 h-[50px] w-full lg:w-auto lg:min-w-[160px] border border-[#C4C4C3] rounded-xl bg-white"
                >
                  <span
                    className="font-inter font-medium text-lg text-[#211F1C]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {genderOptions.find(o => o.value === selectedGender)?.label || 'All Genders'}
                  </span>
                  <ChevronDown className={`w-6 h-6 text-[#211F1C] transition-transform flex-shrink-0 ${showGenderDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showGenderDropdown && (
                  <div className="absolute top-full left-0 right-0 lg:right-auto lg:min-w-full mt-2 z-50 bg-white border border-[#E2E1E1] rounded-xl shadow-lg overflow-hidden">
                    {genderOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedGender(option.value);
                          setShowGenderDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 font-inter text-base transition-colors ${selectedGender === option.value
                          ? 'bg-[#FFF4E3] text-[#211F1C]'
                          : 'text-[#211F1C] hover:bg-[#FFF9EF]'
                          }`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Collections Filter */}
              <div className="relative" ref={collectionRef}>
                <button
                  onClick={() => {
                    setShowCollectionDropdown(!showCollectionDropdown);
                    setShowGenderDropdown(false);
                    setShowSortDropdown(false);
                  }}
                  className="flex items-center justify-between gap-3 px-4 h-[50px] w-full lg:w-auto lg:min-w-[160px] border border-[#C4C4C3] rounded-xl bg-white"
                >
                  <span
                    className="font-inter font-medium text-lg text-[#211F1C]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {selectedCollection || 'All Collection'}
                  </span>
                  <ChevronDown className={`w-6 h-6 text-[#211F1C] transition-transform flex-shrink-0 ${showCollectionDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showCollectionDropdown && (
                  <div className="absolute top-full left-0 right-0 lg:right-auto lg:min-w-full mt-2 z-50 bg-white border border-[#E2E1E1] rounded-xl shadow-lg overflow-hidden max-h-[300px] overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedCollection('');
                        setShowCollectionDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 font-inter text-base transition-colors ${selectedCollection === ''
                        ? 'bg-[#FFF4E3] text-[#211F1C]'
                        : 'text-[#211F1C] hover:bg-[#FFF9EF]'
                        }`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      All Collection
                    </button>
                    {collections.map((col: any) => (
                      <button
                        key={col.name}
                        onClick={() => {
                          setSelectedCollection(col.name);
                          setShowCollectionDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 font-inter text-base transition-colors ${selectedCollection === col.name
                          ? 'bg-[#FFF4E3] text-[#211F1C]'
                          : 'text-[#211F1C] hover:bg-[#FFF9EF]'
                          }`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Filter */}
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowGenderDropdown(false);
                    setShowCollectionDropdown(false);
                  }}
                  className="flex items-center justify-between gap-3 px-4 h-[50px] w-full lg:w-auto lg:min-w-[160px] border border-[#C4C4C3] rounded-xl bg-white"
                >
                  <span
                    className="font-inter font-medium text-lg text-[#211F1C]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {sortOptions.find(o => o.value === selectedSort)?.label || 'Name (A-Z)'}
                  </span>
                  <ChevronDown className={`w-6 h-6 text-[#211F1C] transition-transform flex-shrink-0 ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showSortDropdown && (
                  <div className="absolute top-full left-0 right-0 lg:right-auto lg:min-w-full mt-2 z-50 bg-white border border-[#E2E1E1] rounded-xl shadow-lg overflow-hidden">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedSort(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 font-inter text-base transition-colors ${selectedSort === option.value
                          ? 'bg-[#FFF4E3] text-[#211F1C]'
                          : 'text-[#211F1C] hover:bg-[#FFF9EF]'
                          }`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="flex flex-col items-center gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full">
              {filteredAndSortedPerfumes.map((p) => (
                <div
                  key={p._id}
                  className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
                  style={{ backgroundColor: '#FFF9EF' }}
                >
                  {/* Image Section */}
                  <Link href={`/perfumes/${p.slug || p._id}`} className="relative">
                    <div
                      className="aspect-[416/365] w-full overflow-hidden relative"
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderWidth: '1px 1px 0px 1px',
                        borderStyle: 'solid',
                        borderColor: '#EFEFEF',
                        borderRadius: '16px 16px 0px 0px'
                      }}
                    >
                      {p.image || p.perfume_image ? (
                        <img
                          src={p.image || p.perfume_image}
                          alt={`${p.variant_name} by ${p.brand_name}`}
                          className="h-full w-full object-contain hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Sparkles className="w-16 h-16" style={{ color: '#C4C4C3' }} />
                        </div>
                      )}
                    </div>
                    {/* Gender Badge */}
                    {p.gender && (
                      <span
                        className="absolute top-4 left-4 px-[10px] py-1 rounded-full text-[14px] leading-[20px]"
                        style={{
                          backgroundColor: '#ECE0CF',
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 500,
                          color: '#695129'
                        }}
                      >
                        {p.gender.charAt(0).toUpperCase() + p.gender.slice(1)}
                      </span>
                    )}
                  </Link>

                  {/* Content Section */}
                  <div className="flex flex-col justify-between flex-1 p-6 gap-6">
                    {/* Info Block */}
                    <div className="flex flex-col gap-3">
                      {/* Rating Row */}
                      {typeof p.rating === 'number' && p.rating > 0 && (
                        <div className="flex items-center gap-1">
                          {/* Star Icon */}
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FBC061" />
                          </svg>
                          <span
                            className="text-[18px] leading-[26px]"
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#211F1C' }}
                          >
                            {p.rating.toFixed(1)}
                          </span>
                          <span
                            className="text-[16px] leading-[24px]"
                            style={{ fontFamily: "'Inter', sans-serif", color: '#737270' }}
                          >
                            ({p.review_count || 0} reviews)
                          </span>
                        </div>
                      )}

                      {/* Title & Brand */}
                      <div className="flex flex-col gap-[6px]">
                        <Link href={`/perfumes/${p.slug || p._id}`}>
                          <h3
                            className="text-[24px] leading-[32px] hover:opacity-70 transition-opacity"
                            style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#211F1C' }}
                          >
                            {p.variant_name}
                          </h3>
                        </Link>
                        <p
                          className="text-[16px] leading-[24px]"
                          style={{ fontFamily: "'Inter', sans-serif", color: '#737270' }}
                        >
                          {p.brand_name}
                        </p>
                      </div>

                      {/* Accord Tags */}
                      {p.accords && p.accords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {p.accords.slice(0, 5).map((accord: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-[10px] py-1 rounded-full text-[14px] leading-[20px]"
                              style={{
                                backgroundColor: '#ECE0CF',
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 500,
                                color: '#695129'
                              }}
                            >
                              {typeof accord === 'string' ? accord : accord.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <Link href={`/perfumes/${p.slug || p._id}`} className="w-full">
                      <button
                        className="w-full h-[50px] flex items-center justify-center gap-2 rounded-lg transition-all hover:opacity-90"
                        style={{
                          border: '1px solid #C4C4C3',
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 500,
                          fontSize: '18px',
                          lineHeight: '26px',
                          color: '#211F1C'
                        }}
                      >
                        View Details
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19" stroke="#211F1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 5L19 12L12 19" stroke="#211F1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {filteredAndSortedPerfumes.length > 0 && (
              <button
                className="h-[50px] px-4 flex items-center justify-end gap-3 rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: '#211F1C' }}
              >
                <span
                  className="text-[18px] leading-[26px]"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#FFFFFF' }}
                >
                  Load More
                </span>
                <div className="w-10 h-10 flex items-center justify-center rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="#211F1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 5L19 12L12 19" stroke="#211F1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            )}
          </div>

          {/* No Results */}
          {filteredAndSortedPerfumes.length === 0 && (
            <div className="py-12 text-center">
              <div className="rounded-xl p-8 inline-block" style={{ border: '1px solid #E2E1E1' }}>
                <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: '#C4C4C3' }} />
                <p
                  className="text-[18px] leading-[26px] mb-2"
                  style={{ fontFamily: "'Inter', sans-serif", color: '#4A4946' }}
                >
                  No perfumes match current filters.
                </p>
                <p
                  className="text-[14px] leading-[20px] mb-4"
                  style={{ fontFamily: "'Inter', sans-serif", color: '#737270' }}
                >
                  This brand has {initialPerfumes.length} perfumes total.
                </p>
                <button
                  onClick={() => {
                    setSelectedGender('');
                    setSelectedCollection('');
                    setSelectedSort('az');
                  }}
                  className="h-[50px] px-6 flex items-center justify-center gap-3 rounded-xl transition-all hover:opacity-90 mx-auto"
                  style={{
                    backgroundColor: '#211F1C',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: '18px',
                    color: '#FFFFFF'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Your voice matters here - CTA Section */}
      <section className="relative overflow-hidden isolate" style={{ backgroundColor: '#FFF9EF' }}>
        {/* Decorative background pattern */}
        <div className="absolute -left-[338px] -top-[398px] w-[567px] h-[651px] pointer-events-none -z-10" aria-hidden="true" style={{ transform: 'rotate(-42.21deg)' }}>
          <div className="absolute w-[200px] h-[330px] border border-[#ECE0CF] rounded-full" style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '2%', top: '-1%' }} />
          <div className="absolute w-[230px] h-[270px] border border-[#ECE0CF] rounded-full" style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '7%', top: '-31%' }} />
          <div className="absolute w-[200px] h-[270px] border border-[#ECE0CF] rounded-full" style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '-10%', top: '8%' }} />
          <div className="absolute w-[220px] h-[280px] border border-[#ECE0CF] rounded-full" style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '-14%', top: '-47%' }} />
          <div className="absolute w-[190px] h-[210px] border border-[#ECE0CF] rounded-full" style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '2%', top: '-51%' }} />
          <div className="absolute w-[210px] h-[220px] border border-[#ECE0CF] rounded-full" style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '-18%', top: '-8%' }} />
          <div className="absolute w-[160px] h-[200px] border border-[#ECE0CF] rounded-full" style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '-1%', top: '-27%' }} />
          <div className="absolute w-[170px] h-[180px] border border-[#ECE0CF] rounded-full" style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '-7%', top: '-15%' }} />
          <div className="absolute w-[140px] h-[160px] border border-[#ECE0CF] rounded-full" style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '3%', top: '-1%' }} />
          <div className="absolute w-[120px] h-[130px] border border-[#ECE0CF] rounded-full" style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '7%', top: '-5%' }} />
        </div>
        <img
          src="/Logo_vector.webp"
          alt=""
          aria-hidden="true"
          className="absolute"
        />

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-10 lg:py-16 relative">
          <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-6">
            {/* Left Content */}
            <div className="flex flex-col gap-8 w-full lg:w-auto lg:flex-1 lg:max-w-[745px]">
              {/* Header Text */}
              <div className="flex flex-col gap-6">
                {/* Pre-title + Title + Description */}
                <div className="flex flex-col gap-1">
                  <span
                    className="text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px]"
                    style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#8A6A35' }}
                  >
                    Your voice matters here
                  </span>
                  <div className="flex flex-col gap-4">
                    <h2
                      className="text-[32px] leading-[40px] lg:text-[48px] lg:leading-[56px]"
                      style={{ fontFamily: "'Hedvig Letters Serif', serif", color: '#211F1C' }}
                    >
                      Suggest a missing perfume or claim a brand
                    </h2>
                    <p
                      className="text-[18px] leading-[26px] lg:text-[24px] lg:leading-[32px]"
                      style={{ fontFamily: "'Inter', sans-serif", color: '#4A4946' }}
                    >
                      Found a missing perfume or own a brand? Submit suggestions or claim your profile for verification.
                    </p>
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Community Suggestion */}
                  <div className="flex flex-col gap-1 py-2 px-4 rounded-2xl flex-1 max-w-[354px]" style={{ backgroundColor: '#FFF4E3' }}>
                    <div className="flex items-center gap-3">
                      {/* Users Icon */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: '#FDE2B6' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#695129" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#695129" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#695129" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#695129" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span
                        className="text-[18px] lg:text-[20px] leading-[26px] lg:leading-[28px]"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#211F1C' }}
                      >
                        Community Suggestion
                      </span>
                    </div>
                    <p
                      className="text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px]"
                      style={{ fontFamily: "'Inter', sans-serif", color: '#4A4946' }}
                    >
                      Did you find a missing perfume or brand? Let us know! You&apos;ll earn +5 XP if your suggestion is approved.
                    </p>
                  </div>

                  {/* Brand Owner */}
                  <div className="flex flex-col gap-1 py-2 px-4 rounded-2xl flex-1 max-w-[354px]" style={{ backgroundColor: '#FFF4E3' }}>
                    <div className="flex items-center gap-3">
                      {/* User Icon */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: '#FDE2B6' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#695129" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#695129" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span
                        className="text-[18px] lg:text-[20px] leading-[26px] lg:leading-[28px]"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#211F1C' }}
                      >
                        Brand Owner
                      </span>
                    </div>
                    <p
                      className="text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px]"
                      style={{ fontFamily: "'Inter', sans-serif", color: '#4A4946' }}
                    >
                      Are you the owner or representative of a fragrance brand? Claim your profile and get the &quot;Verified Brand&quot; badge.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <Link
                  href="/submit"
                  className="inline-flex items-center justify-between w-full lg:w-auto min-h-[50px] pl-4 pr-1 gap-3 rounded-xl transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#211F1C' }}
                >
                  <span
                    className="text-[18px] leading-[26px]"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#FFFFFF' }}
                  >
                    Suggest a missing item
                  </span>
                  <span className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#211F1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/submit?type=brand-claim"
                  className="inline-flex items-center justify-between w-full lg:w-auto min-h-[50px] pl-4 pr-1 gap-3 border rounded-xl transition-colors hover:bg-[#211F1C] group"
                  style={{ borderColor: '#211F1C' }}
                >
                  <span
                    className="text-[18px] leading-[26px] group-hover:text-white"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#211F1C' }}
                  >
                    Apply for brand account
                  </span>
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 group-hover:bg-white" style={{ backgroundColor: '#211F1C' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="group-hover:hidden">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="hidden group-hover:block">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#211F1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="w-full lg:w-[527px] h-[300px] sm:h-[400px] lg:h-[466px] rounded-xl overflow-hidden flex-shrink-0">
              <img
                src="/join-team-brand.webp"
                alt="Suggest a perfume or claim a brand"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}