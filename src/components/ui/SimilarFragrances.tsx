"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Search, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useAuthModal } from "@/components/auth/AuthModal";

interface SimilarFragrance {
  perfumeId: string;
  name: string;
  brand: string;
  image: string | null;
  slug: string;
  upvotes: number;
  downvotes: number;
  userVote: string | null;
  similarityScore: number;
}

interface SearchResult {
  _id: string;
  variant_name: string;
  brand_name: string;
  image: string;
  slug: string;
}

interface Props {
  currentPerfumeId: string;
}

export default function SimilarFragrances({ currentPerfumeId }: Props) {
  const { data: session } = useSession();
  const { open } = useAuthModal();

  const [fragrances, setFragrances] = useState<SimilarFragrance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null); // 🚀 ADD THIS
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 🚀 OPTIMIZED: Fetch similar fragrances only once
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      // Reset the ref first
      isFetchingRef.current = false;
      setLoading(true);
      // Then fetch
      fetchSimilarFragrances();
    }, 500);
    return () => clearTimeout(initialDelay);
  }, [currentPerfumeId]);

  // 🚀 OPTIMIZED: Debounced search with abort controller
  useEffect(() => {
    // Cancel previous search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    // 🚀 Increased debounce from 300ms to 400ms
    const timer = setTimeout(() => {
      searchPerfumes();
    }, 400);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10,
      );
    };

    checkScroll();
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [fragrances]);

  // 🚀 OPTIMIZED: Prevent duplicate fetches
  const fetchSimilarFragrances = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const response = await fetch(
        `/api/similar-fragrances?perfumeId=${currentPerfumeId}`,
        {
          // 🚀 ADD CACHING: Use browser cache
          cache: "force-cache",
          next: { revalidate: 300 },
        },
      );
      const data = await response.json();
      setFragrances(data.fragrances || []);
    } catch (error) {
      console.error("Error fetching similar fragrances:", error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [currentPerfumeId]);

  // 🚀 OPTIMIZED: Search with abort controller
  const searchPerfumes = useCallback(async () => {
    setSearching(true);

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(
        `/api/perfumes/search-similar?q=${encodeURIComponent(
          searchQuery,
        )}&exclude=${currentPerfumeId}`,
        { signal: controller.signal },
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error searching perfumes:", error);
      }
    } finally {
      setSearching(false);
    }
  }, [searchQuery, currentPerfumeId]);

  // 🚀 OPTIMIZED: Optimistic UI updates for voting
  const handleVote = useCallback(
    async (perfumeId: string, voteType: "UP" | "DOWN") => {
      if (!session) {
        open({
          mode: "signin",
          reason: "Sign in to vote on similar fragrances",
        });
        return;
      }

      // 🚀 OPTIMISTIC UPDATE: Update UI immediately
      setFragrances((prev) =>
        prev.map((f) => {
          if (f.perfumeId !== perfumeId) return f;

          const wasUpvote = f.userVote === "UP";
          const wasDownvote = f.userVote === "DOWN";
          const isUpvote = voteType === "UP";

          let newUpvotes = f.upvotes;
          let newDownvotes = f.downvotes;

          if (f.userVote === voteType) {
            // Remove vote
            if (isUpvote) newUpvotes--;
            else newDownvotes--;

            return {
              ...f,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              userVote: null,
            };
          } else {
            // Change or add vote
            if (wasUpvote) newUpvotes--;
            if (wasDownvote) newDownvotes--;
            if (isUpvote) newUpvotes++;
            else newDownvotes++;

            return {
              ...f,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              userVote: voteType,
            };
          }
        }),
      );

      try {
        const response = await fetch("/api/similar-fragrances/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourcePerfumeId: currentPerfumeId,
            similarPerfumeId: perfumeId,
            voteType,
          }),
        });

        if (!response.ok) {
          // 🚀 ROLLBACK: If request fails, refetch to get accurate state
          fetchSimilarFragrances();
        }
      } catch (error) {
        console.error("Error voting:", error);
        // 🚀 ROLLBACK on error
        fetchSimilarFragrances();
      }
    },
    [session, open, currentPerfumeId, fetchSimilarFragrances],
  );

  const handleAddSimilar = useCallback(
    async (perfumeId: string) => {
      if (!session) {
        open({
          mode: "signin",
          reason: "Sign in to suggest similar fragrances",
        });
        return;
      }

      try {
        const response = await fetch("/api/similar-fragrances/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourcePerfumeId: currentPerfumeId,
            targetPerfumeId: perfumeId,
          }),
        });

        if (response.ok) {
          setShowAddModal(false);
          setSearchQuery("");
          setSearchResults([]);
          fetchSimilarFragrances();
        } else {
          const data = await response.json();
          alert(data.error || "Failed to add similar fragrance");
        }
      } catch (error) {
        console.error("Error adding similar fragrance:", error);
      }
    },
    [session, open, currentPerfumeId, fetchSimilarFragrances],
  );

  const scroll = useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 250;
    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-10 lg:py-16">
        <div className="flex flex-col gap-10">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="h-8 bg-[#F5F0E8] rounded w-40 animate-pulse"></div>
              <div className="h-14 bg-[#F5F0E8] rounded w-64 animate-pulse"></div>
            </div>
          </div>
          {/* Cards Skeleton */}
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="min-w-[240px] h-[573px] bg-[#FFF9EF] rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-white ">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
                In the same family
              </span>
              <h2 className="font-hedvig font-normal text-[32px] leading-[40px] lg:text-[40px] lg:leading-[56px] text-[#211F1C]">
                Similar fragrances
              </h2>
            </div>
            <button
              onClick={() => {
                if (!session) {
                  open({
                    mode: "signin",
                    reason: "Sign in to suggest similar fragrances",
                  });
                  return;
                }
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 font-inter font-medium text-[20px] leading-[28px] text-[#211F1C] underline underline-offset-4 hover:text-[#8A6A35] transition-colors"
            >
              Add Another
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {fragrances.length === 0 ? (
            <div className="text-center py-16 bg-[#FFF9EF] rounded-2xl border border-[#E2E1E1]">
              <div className="w-16 h-16 bg-[#FEEBCE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[#8A6A35]" />
              </div>
              <p className="font-inter font-medium text-[18px] leading-[26px] text-[#211F1C] mb-2">
                No similar fragrances yet
              </p>
              <p className="font-inter font-normal text-[16px] leading-[24px] text-[#737270]">
                Be the first to suggest one!
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {/* Scrollable Cards Container */}
              <div className="relative w-full">
                {/* Cards Row */}
                <div
                  ref={scrollContainerRef}
                  className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {fragrances.map((frag) => (
                    <div
                      key={frag.perfumeId}
                      className="flex-shrink-0 w-[240px] bg-[#FFF9EF] rounded-2xl overflow-hidden "
                    >
                      <div className="flex flex-col h-full">
                        {/* Image Section */}
                        <Link
                          href={`/perfumes/${frag.slug}`}
                          className="block relative"
                        >
                          <div className="w-[240px] h-[227px] bg-white border-x border-t border-[#EFEFEF] rounded-t-2xl relative overflow-hidden">
                            {frag.image ? (
                              <Image
                                src={frag.image}
                                alt={frag.name}
                                fill
                                sizes="240px"
                                className="object-contain p-4"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-4xl text-[#8A6A35]">
                                  ✨
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Gender Badge - Placeholder, adjust based on your data */}
                          <span className="absolute top-4 left-4 inline-flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-full">
                            <span className="font-inter font-medium text-[14px] leading-[20px] text-[#695129]">
                              Unisex
                            </span>
                          </span>
                        </Link>

                        {/* Content Section */}
                        <div className="flex flex-col gap-6 p-4">
                          {/* Similarity Progress Bar */}
                          <div className="flex items-center gap-3">
                            {/* <div className="flex-1 h-[10px] bg-[#FDE2B6] rounded-xl overflow-hidden">
                              <div
                                className="h-full bg-[#B28845] rounded-xl transition-all"
                                style={{ width: `${frag.similarityScore}%` }}
                              />
                            </div> */}

                            <div className="relative flex-1 h-[10px] bg-[#FDE2B6] rounded-xl">
                              {/* Filled bar */}
                              <div
                                className="absolute left-0 top-0 h-full bg-[#B28845] rounded-xl"
                                style={{ width: `${frag.similarityScore}%` }}
                              />

                              {/* Indicator */}
                              <div
                                className="absolute top-1/2 -translate-y-1/2"
                                style={{
                                  left: `calc(${frag.similarityScore}% - 8px)`,
                                }}
                              >
                                <div className="w-4 h-4 bg-white border-[3px] border-[#B28845] rounded-full" />
                              </div>
                            </div>

                            <span className="font-inter font-medium text-[16px] leading-[24px] text-[#211F1C] text-right min-w-[40px]">
                              {frag.similarityScore}%
                            </span>
                          </div>

                          {/* Name & Brand */}
                          <div className="flex flex-col gap-2">
                            <Link
                              href={`/perfumes/${frag.slug}`}
                              className="font-hedvig font-normal text-[20px] leading-[32px] text-[#211F1C] hover:text-[#8A6A35] transition-colors line-clamp-2"
                            >
                              {frag.name}
                            </Link>
                            <p className="font-inter font-normal text-[16px] leading-[24px] text-[#4A4946]">
                              {frag.brand}
                            </p>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-1">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                fill="#FBC061"
                              />
                            </svg>
                            <span className="font-inter font-medium text-[18px] leading-[26px] text-[#211F1C]">
                              4.8
                            </span>
                            <span className="font-inter font-normal text-[16px] leading-[24px] text-[#4A4946]">
                              (342 reviews)
                            </span>
                          </div>

                          {/* Divider */}
                          <div className="w-full h-px bg-[#E2E1E1]" />
                        </div>
                        {/* Thumbs Up/Down */}
                        <div className="flex items-center justify-between mt-auto px-4 py-3">
                          <button
                            onClick={() => handleVote(frag.perfumeId, "UP")}
                            className={`flex items-center gap-1 transition-colors ${
                              frag.userVote === "UP"
                                ? "text-[#8A6A35]"
                                : "text-[#4A4946] hover:text-[#8A6A35]"
                            }`}
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7 22V11M2 13V20C2 21.1046 2.89543 22 4 22H17.4262C18.907 22 20.1662 20.9197 20.3914 19.4562L21.4683 12.4562C21.7479 10.6389 20.3418 9 18.5032 9H15C14.4477 9 14 8.55228 14 8V4.46584C14 3.10399 12.896 2 11.5342 2C11.2093 2 10.915 2.1913 10.7831 2.48812L7.26394 10.4061C7.10344 10.7673 6.74532 11 6.35013 11H4C2.89543 11 2 11.8954 2 13Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="font-inter font-normal text-[16px] leading-[24px]">
                              {frag.upvotes}
                            </span>
                          </button>
                          <button
                            onClick={() => handleVote(frag.perfumeId, "DOWN")}
                            className={`flex items-center gap-1 transition-colors ${
                              frag.userVote === "DOWN"
                                ? "text-[#8A6A35]"
                                : "text-[#4A4946] hover:text-[#8A6A35]"
                            }`}
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M17 2V13M22 11V4C22 2.89543 21.1046 2 20 2H6.57381C5.09303 2 3.83378 3.08028 3.60862 4.54379L2.53171 11.5438C2.25214 13.3611 3.65823 15 5.49689 15H9C9.55228 15 10 15.4477 10 16V19.5342C10 20.896 11.104 22 12.4658 22C12.7907 22 13.085 21.8087 13.2169 21.5119L16.7361 13.5939C16.8966 13.2327 17.2547 13 17.6499 13H20C21.1046 13 22 12.1046 22 11Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="font-inter font-normal text-[16px] leading-[24px]">
                              {frag.downvotes}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows - Centered */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  className="flex items-center justify-center w-11 h-11 bg-[#211F1C] rounded-lg transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#211F1C]/90"
                  aria-label="Scroll left"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  className="flex items-center justify-center w-11 h-11 bg-[#211F1C] rounded-lg transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#211F1C]/90"
                  aria-label="Scroll right"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Add Similar Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#FFF9EF] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-[#E2E1E1]">
            <div className="p-6 border-b border-[#E2E1E1] bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-hedvig font-normal text-[24px] leading-[32px] text-[#211F1C] flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-[#FEEBCE] rounded-lg">
                    <Plus className="w-5 h-5 text-[#8A6A35]" />
                  </div>
                  Add Similar Fragrance
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="p-2 hover:bg-[#F5F0E8] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#4A4946]" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#737270]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a perfume..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E1E1] rounded-xl focus:ring-2 focus:ring-[#8A6A35] focus:border-transparent transition-all font-inter text-[16px] leading-[24px] text-[#211F1C] placeholder:text-[#737270]"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[400px]">
              {searching && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FDE2B6] border-t-[#8A6A35] mx-auto mb-4"></div>
                  <p className="font-inter font-medium text-[16px] leading-[24px] text-[#4A4946]">
                    Searching...
                  </p>
                </div>
              )}

              {!searching &&
                searchQuery.length >= 2 &&
                searchResults.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl">
                    <p className="font-inter font-medium text-[16px] leading-[24px] text-[#211F1C]">
                      No perfumes found
                    </p>
                    <p className="font-inter font-normal text-[14px] leading-[20px] text-[#737270] mt-1">
                      Try a different search term
                    </p>
                  </div>
                )}

              {!searching && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <button
                      key={result._id}
                      onClick={() => handleAddSimilar(result._id)}
                      className="w-full flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-[#F5F0E8] transition-colors text-left border border-transparent hover:border-[#E2E1E1]"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#FFF9EF] shrink-0 border border-[#EFEFEF] relative">
                        {result.image ? (
                          <Image
                            src={result.image}
                            alt={result.variant_name}
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl text-[#8A6A35]">
                            ✨
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-hedvig font-normal text-[18px] leading-[26px] text-[#211F1C] truncate">
                          {result.variant_name}
                        </p>
                        <p className="font-inter font-normal text-[14px] leading-[20px] text-[#4A4946] truncate">
                          {result.brand_name}
                        </p>
                      </div>
                      <div className="flex items-center justify-center w-10 h-10 bg-[#211F1C] rounded-lg shrink-0">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searching && searchQuery.length < 2 && (
                <div className="text-center py-12 bg-white rounded-xl">
                  <div className="w-16 h-16 bg-[#FEEBCE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-[#8A6A35]" />
                  </div>
                  <p className="font-inter font-medium text-[16px] leading-[24px] text-[#211F1C]">
                    Start typing to search
                  </p>
                  <p className="font-inter font-normal text-[14px] leading-[20px] text-[#737270] mt-1">
                    Enter at least 2 characters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
