import React from "react";
import Link from "next/link";
import {
  Clock,
  User,
  ArrowRight,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getArticles } from "@/app/actions/drydown";
import { auth } from "@/lib/auth";
import ApplyButton from "@/components/drydown/ApplyButton";
import CatagoryTabs from "@/components/drydown/CatagoryTabs";
import Image from "next/image";

export const metadata = {
  title: "The Drydown • Editorial | Fragview",
  description:
    "Curated fragrance stories, reviews, and industry news from expert editors.",
  openGraph: {
    title: "The Drydown - FragView Editorial",
    description:
      "Deep dives, industry news, and curated stories from the world of fragrance.",
    type: "website",
  },
};

export const revalidate = 60; // Refresh every minute


export default async function DrydownPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const session = await auth();
  const resolvedParams = await searchParams;
  const selectedCategory = resolvedParams.category;
  const currentPage = parseInt(resolvedParams.page || "1");

  // Fetch articles with pagination
  const { articles, total, totalPages } = await getArticles(
    selectedCategory && selectedCategory !== "All"
      ? selectedCategory
      : undefined,
    currentPage,
    9 // 9 articles per page (1 featured + 8 in grid)
  );

  const featured = articles[0];
  const recent = articles.slice(1);

  // Check if user is ADMIN or EDITOR
  const canManage =
    session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";

  return (
    <div className="min-h-screen bg-[#FFF9EF]">
      {/* Hero Section */}
      <section className="w-full bg-[#FFF9EF] px-6 lg:px-[72px] py-5">
        <div className="mx-auto max-w-[1296px] flex flex-col items-center gap-4 lg:gap-8">
          {/* Title - Mobile: 48px, Desktop: 88px */}
          <h1 className="font-hedvig font-normal text-[48px] leading-[56px] lg:text-[80px] lg:leading-[96px] text-center text-[#211F1C]">
            The Drydown
          </h1>

          {/* Admin/Editor Manage Link */}
          {canManage && (
            <Link
              href="/admin/drydown"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#211F1C] text-white font-inter font-medium rounded-lg hover:bg-[#211F1C]/90 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Manage Articles
            </Link>
          )}
<CatagoryTabs selectedCategory={selectedCategory} />
          {/* Category Tabs - Mobile: scrollable with arrow, Desktop: full width */}
         
          {/* Featured Article or Empty State */}
          {articles.length === 0 ? (
            /* Empty State */
            <div className="w-full flex flex-col items-center justify-center py-16 gap-6">
              {/* Document Icon */}
              <div className="w-16 h-16 flex items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect
                    x="8"
                    y="4"
                    width="32"
                    height="40"
                    rx="4"
                    stroke="#737270"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 16H32M16 24H32M16 32H24"
                    stroke="#737270"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="text-center max-w-md">
                <h2 className="font-hedvig font-normal text-2xl leading-8 text-[#211F1C] mb-2">
                  No posts yet but plenty to come
                </h2>
                <p className="font-inter font-normal text-base leading-6 text-[#737270]">
                  We haven&apos;t published anything here yet — but exciting
                  content is on the way. Want to be one of the first voices
                  featured here? Join us and contribute.
                </p>
              </div>
              {/* Join as Editor Button */}
              <Link
                href={canManage ? "/admin/drydown/new" : "/drydown"}
                className="inline-flex items-center justify-between h-[50px] pl-4 pr-1 bg-[#211F1C] rounded-xl font-inter font-medium text-lg leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors"
              >
                {canManage ? "Write First Article" : "Join as an Editor"}
                <span className="flex items-center justify-center w-10 h-10 bg-white rounded-lg ml-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 17L17 7M17 7H7M17 7V17"
                      stroke="#211F1C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          ) : (
            /* Featured Article */
            featured && (
              <div className="w-full flex flex-col lg:flex-row items-stretch  gap-8 lg:gap-16">
                {/* Left Side - Content */}
                <div className="flex-1 flex flex-col justify-center gap-5">
                  {/* Badges */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4 lg:gap-6">
                      {/* Category Badge */}
                      <span className="flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-sm leading-5 text-[#695129]">
                        {featured.category || "Guide"}
                      </span>
                      {/* Date Badge */}
                      <span className="flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-sm leading-5 text-[#695129]">
                        {new Date(
                          featured.publishedAt || featured.createdAt
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Title - Mobile: 40px, Desktop: 48px */}
                    <h2 className="font-hedvig font-normal text-[40px] leading-[48px] lg:text-[40px] lg:leading-[50px] text-[#211F1C]">
                      {featured.title}
                    </h2>

                    {/* Read More Link - Mobile: 16px, Desktop: 20px */}
                    <Link
                      href={`/drydown/${featured.slug}`}
                      className="inline-flex items-center gap-2 w-fit font-inter font-medium text-base lg:text-xl leading-6 lg:leading-7 text-[#211F1C] underline hover:text-[#8A6A35] transition-colors"
                    >
                      Read More
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12H19M19 12L12 5M19 12L12 19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>

                  {/* Divider + Meta */}
                  <div className="flex flex-col gap-4">
                    <div className="w-full h-px bg-[#E2E1E1]" />
                    <div className="flex items-center justify-between gap-4 lg:gap-6 flex-wrap">
                      {/* Author */}
                      <div className="flex items-center gap-[3px] ">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="8"
                            r="4"
                            stroke="#4A4946"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M4 20C4 17 8 14 12 14C16 14 20 17 20 20"
                            stroke="#4A4946"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="font-inter font-normal text-sm lg:text-base leading-5 lg:leading-6 text-[#4A4946]">
                          {featured.author?.name || "Fragview"}
                        </span>
                      </div>
                      {/* Read Time */}
                      <div className="flex items-center gap-[3px]">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="#4A4946"
                            strokeWidth="2"
                          />
                          <path
                            d="M12 7V12L15 15"
                            stroke="#4A4946"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="font-inter font-normal text-sm lg:text-base leading-5 lg:leading-6 text-[#4A4946]">
                          {featured.readTime || "5 min read"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Image - Mobile: below content, Desktop: right side */}
                <div className="w-full lg:w-[530px] h-[352px] rounded-xl overflow-hidden">
                  {featured.coverImage ? (
                    <Image
                      width={530}
                      height={352}
                      quality={100}
                      src={featured.coverImage}
                      alt={featured.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#ECE0CF] flex items-center justify-center">
                      <span className="font-hedvig text-2xl text-[#695129]">
                        Fragview
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Recent Articles Grid */}
      {articles.length > 0 && recent.length > 0 && (
        <section className="w-full bg-[#FFF9EF] px-6 lg:px-[72px] py-12">
          <div className="mx-auto max-w-[1296px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recent.map((article) => (
                <Link
                  href={`/drydown/${article.slug}`}
                  key={article.id}
                  className="group"
                >
                  <div className="bg-[#FFF4E3] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-[200px] lg:h-[240px] overflow-hidden">
                      {article.coverImage ? (
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#ECE0CF] flex items-center justify-center">
                          <span className="font-hedvig text-xl text-[#695129]">
                            Fragview
                          </span>
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className="px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-sm leading-5 text-[#695129]">
                          {article.category}
                        </span>
                        <span className="px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-sm leading-5 text-[#695129]">
                          {new Date(
                            article.publishedAt || article.createdAt
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col gap-4">
                      <h3 className="font-averia font-normal text-xl lg:text-2xl leading-8 text-[#211F1C] group-hover:text-[#8A6A35] transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="font-inter font-normal text-base leading-6 text-[#4A4946] line-clamp-3 flex-1">
                        {article.excerpt}
                      </p>

                      {/* Divider + Meta */}
                      <div className="mt-auto flex flex-col gap-4">
                        <div className="w-full h-px bg-[#E2E1E1]" />
                        <div className="flex items-center justify-between">
                          {/* Author */}
                          <div className="flex items-center gap-[3px]">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                            >
                              <circle
                                cx="12"
                                cy="8"
                                r="4"
                                stroke="#4A4946"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M4 20C4 17 8 14 12 14C16 14 20 17 20 20"
                                stroke="#4A4946"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="font-inter font-normal text-base leading-6 text-[#4A4946]">
                              {article.author?.name || "Fragview"}
                            </span>
                          </div>
                          {/* Read Time */}
                          <div className="flex items-center gap-[3px]">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                                stroke="#4A4946"
                                strokeWidth="2"
                              />
                              <path
                                d="M12 7V12L15 15"
                                stroke="#4A4946"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="font-inter font-normal text-base leading-6 text-[#4A4946]">
                              {article.readTime || "5 min read"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {/* Previous Button */}
                <Link
                  href={
                    currentPage > 1
                      ? `/drydown?${new URLSearchParams({
                          ...(selectedCategory &&
                            selectedCategory !== "All" && {
                              category: selectedCategory,
                            }),
                          page: (currentPage - 1).toString(),
                        }).toString()}`
                      : "/drydown"
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-inter font-medium text-base transition-all ${
                    currentPage > 1
                      ? "border border-[#E2E1E1] text-[#211F1C] hover:bg-[#E2E1E1]/50"
                      : "border border-[#E2E1E1] text-[#C4C4C3] cursor-not-allowed pointer-events-none"
                  }`}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Link>

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Link
                            key={page}
                            href={`/drydown?${new URLSearchParams({
                              ...(selectedCategory &&
                                selectedCategory !== "All" && {
                                  category: selectedCategory,
                                }),
                              page: page.toString(),
                            }).toString()}`}
                            className={`w-10 h-10 flex items-center justify-center rounded-full font-inter font-medium text-base transition-all ${
                              page === currentPage
                                ? "bg-[#211F1C] text-white"
                                : "border border-[#E2E1E1] text-[#211F1C] hover:bg-[#E2E1E1]/50"
                            }`}
                          >
                            {page}
                          </Link>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="text-[#737270]">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                  )}
                </div>

                {/* Next Button */}
                <Link
                  href={
                    currentPage < totalPages
                      ? `/drydown?${new URLSearchParams({
                          ...(selectedCategory &&
                            selectedCategory !== "All" && {
                              category: selectedCategory,
                            }),
                          page: (currentPage + 1).toString(),
                        }).toString()}`
                      : "/drydown"
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-inter font-medium text-base transition-all ${
                    currentPage < totalPages
                      ? "border border-[#E2E1E1] text-[#211F1C] hover:bg-[#E2E1E1]/50"
                      : "border border-[#E2E1E1] text-[#C4C4C3] cursor-not-allowed pointer-events-none"
                  }`}
                >
                  Next
                  <ChevronRight size={16} />
                </Link>
              </div>
            )}

            {/* Page Info */}
            {totalPages > 1 && (
              <div className="text-center font-inter text-sm text-[#737270] mt-4">
                Showing {(currentPage - 1) * 9 + 1} -{" "}
                {Math.min(currentPage * 9, total)} of {total} articles
              </div>
            )}
          </div>
        </section>
      )}

      {/* Read & explore (The Drydown) - Figma style */}
      {/* <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-5">
          <div className="flex flex-col gap-1">
            <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
              Read &amp; explore
            </span>
         
            <h2 className="font-hedvig font-normal text-[28px] leading-[36px] lg:text-[40px] lg:leading-[50px] text-[#211F1C]">
              Notes on perfume, style, and how we wear scent
            </h2>
          </div> 


          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.slice(0, 3).length > 0 ? (
              articles.slice(0, 3).map((article) => (
                <Link
                  key={article.id}
                  href={`/drydown/${article.slug}`}
                  className="group flex flex-col bg-[#FFF4E3] rounded-[16px] overflow-hidden isolate group hover:shadow-md "
                >
            
                  <div className="relative h-[280px] lg:h-[345px] bg-white border-t border-l border-r border-[#EFEFEF] rounded-t-[16px]">
                    {article.coverImage ? (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300 ease-in-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-[#ECE0CF]" />
                    )}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <span className="flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-[14px] leading-[20px] text-[#695129]">
                        {article.category || 'News'}
                      </span>
                      <span className="flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-[14px] leading-[20px] text-[#695129]">
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

      
                  <div className="flex flex-col flex-1 p-6 gap-6">
                    <div className="flex flex-col gap-3">
          
                      <h3 className="font-averia font-normal text-[24px] leading-[32px] text-[#211F1C] line-clamp-2">
                        {article.title}
                      </h3>
                 
                      <p className="font-inter font-normal text-[16px] lg:text-[18px] leading-[24px] lg:leading-[26px] text-[#4A4946] line-clamp-4">
                        {article.excerpt}
                      </p>
                    </div>

      
                    <div className="mt-auto flex flex-col gap-6">
              
                      <div className="w-full h-px bg-[#E2E1E1]" />

                 
                      <div className="flex items-center justify-between">
                   
                        <div className="flex items-center gap-[3px]">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <circle cx="12" cy="8" r="4" stroke="#4A4946" strokeWidth="2" strokeLinecap="round" />
                            <path d="M4 20C4 17 8 14 12 14C16 14 20 17 20 20" stroke="#4A4946" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <span className="font-inter font-normal text-[16px] leading-[24px] text-[#4A4946]">
                            {article.author?.name || 'Fragview'}
                          </span>
                        </div>
     
                        <div className="flex items-center gap-[3px]">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" stroke="#4A4946" strokeWidth="2" />
                            <path d="M12 7V12L15 15" stroke="#4A4946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="font-inter font-normal text-[16px] leading-[24px] text-[#4A4946]">
                            {article.readTime || '5 min read'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="md:col-span-3 text-center text-[#737270] py-8 font-inter">
                No articles available at the moment.
              </div>
            )}
          </div>

   
          <div className="mt-4 flex justify-center">
            <Link
              href="/drydown"
              className="inline-flex items-center justify-between w-[164px] h-[40px] pl-4 pr-1 gap-3 bg-[#211F1C] rounded-[12px] font-inter font-medium text-[16px] leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors"
            >
              View More
              <span className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#211F1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section> */}

      {/* Join our team - CTA Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Decorative background pattern */}
        <div
          className="absolute -left-[338px] -top-[398px] w-[567px] h-[651px] pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute w-[200px] h-[330px] border border-[#ECE0CF] rounded-full"
            style={{ transform: "rotate(-42deg)", left: "2%", top: "-1%" }}
          />
          <div
            className="absolute w-[230px] h-[270px] border border-[#ECE0CF] rounded-full"
            style={{ transform: "rotate(-42deg)", left: "7%", top: "-31%" }}
          />
          <div
            className="absolute w-[200px] h-[270px] border border-[#ECE0CF] rounded-full"
            style={{ transform: "rotate(-42deg)", left: "-10%", top: "8%" }}
          />
          <div
            className="absolute w-[220px] h-[280px] border border-[#ECE0CF] rounded-full"
            style={{ transform: "rotate(-42deg)", left: "-14%", top: "-47%" }}
          />
          <div
            className="absolute w-[190px] h-[210px] border border-[#ECE0CF] rounded-full"
            style={{ transform: "rotate(-42deg)", left: "2%", top: "-51%" }}
          />
          <div
            className="absolute w-[210px] h-[220px] border border-[#ECE0CF] rounded-full"
            style={{ transform: "rotate(-42deg)", left: "-18%", top: "-8%" }}
          />
          <div
            className="absolute w-[160px] h-[200px] border border-[#ECE0CF] rounded-full"
            style={{ transform: "rotate(-42deg)", left: "-1%", top: "-27%" }}
          />
          <div
            className="absolute w-[170px] h-[180px] border border-[#ECE0CF] rounded-full"
            style={{ transform: "rotate(-42deg)", left: "-7%", top: "-15%" }}
          />
          <div
            className="absolute w-[140px] h-[160px] border border-[#ECE0CF] rounded-full"
            style={{ transform: "rotate(-42deg)", left: "3%", top: "-1%" }}
          />
          <div
            className="absolute w-[120px] h-[130px] border border-[#ECE0CF] rounded-full"
            style={{ transform: "rotate(-42deg)", left: "7%", top: "-5%" }}
          />
        </div>
       <Image
           width={ 300 }
           height={ 200 }
           src="/Logo_vector.webp"
           alt=""
           aria-hidden="true"
           className="absolute"
         />
        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-5 relative">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
            {/* Left Content */}
            <div className="flex flex-col gap-8 w-full lg:w-auto lg:flex-1 lg:max-w-[724px]">
              {/* Header Text */}
              <div className="flex flex-col gap-4 lg:gap-6">
                {/* Pre-title + Title */}
                <div className="flex flex-col gap-1">
                  <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
                    Join our team
                  </span>
                  <h2 className="font-hedvig font-normal text-[32px] leading-[40px] lg:text-[40px] lg:leading-[50px] text-[#211F1C]">
                    Write for us, share your expertise
                  </h2>
                </div>

                {/* Description */}
                <p className="font-inter font-normal text-[18px] leading-[26px] lg:text-[20px] lg:leading-[30px] text-[#4A4946]">
                  We&apos;re looking for writers, reviewers, and industry
                  insiders to contribute to The Fragview Blog. Share your unique
                  perspective with our community of scent enthusiasts.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Write what you love */}
                <div className="flex flex-col gap-1 p-4 lg:py-2 lg:px-4 bg-[#FFF4E3] rounded-2xl flex-1">
                  <div className="flex items-center gap-3">
                    {/* Pencil Icon */}
                    <div className="flex items-center justify-center w-10 h-10 bg-[#FDE2B6] rounded-lg">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
                          stroke="#695129"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15 5l4 4"
                          stroke="#695129"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="font-inter font-medium text-[18px] lg:text-[20px] leading-[26px] lg:leading-[28px] text-[#211F1C]">
                      Write what you love
                    </span>
                  </div>
                  <p className="font-inter font-normal text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px] text-[#4A4946]">
                    Cover topics you&apos;re passionate about, from niche
                    discoveries to industry trends.
                  </p>
                </div>

                {/* Reach thousands */}
                <div className="flex flex-col gap-1 p-4 lg:py-2 lg:px-4 bg-[#FFF4E3] rounded-2xl flex-1">
                  <div className="flex items-center gap-3">
                    {/* Users Icon */}
                    <div className="flex items-center justify-center w-10 h-10 bg-[#FDE2B6] rounded-lg">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <circle
                          cx="9"
                          cy="7"
                          r="4"
                          stroke="#695129"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
                          stroke="#695129"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="17"
                          cy="7"
                          r="3"
                          stroke="#695129"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M21 21v-2a3 3 0 0 0-3-3h-1"
                          stroke="#695129"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="font-inter font-medium text-[18px] lg:text-[20px] leading-[26px] lg:leading-[28px] text-[#211F1C]">
                      Reach thousands
                    </span>
                  </div>
                  <p className="font-inter font-normal text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px] text-[#4A4946]">
                    Connect with a dedicated audience of fragrance enthusiasts
                    worldwide.
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div>
                      <a
                href="mailto:info@fragview.com"
                  className="inline-flex items-center justify-between h-[40px] pl-4 pr-1 gap-3 bg-[#211F1C] rounded-xl font-inter font-medium text-[16px] leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors"
                >
                  Join as an Editor
                  <span className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 17L17 7M17 7H7M17 7V17"
                        stroke="#211F1C"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>
              </div>
            </div>

            {/* Right Image - Mobile: below content, Desktop: right side */}
            {/* <div className="w-full lg:w-[524px] h-[280px] sm:h-[350px] lg:h-[418px] rounded-xl overflow-hidden flex-shrink-0">
              <img
                src="/join-team-drydown.webp"
                alt="Join our team"
                className="w-full h-full object-cover"
                loading="lazy"
              /> */}
                   <div className="relative w-full lg:w-[527px] h-[300px] sm:h-[400px] lg:h-[466px] rounded-xl overflow-hidden flex-shrink-0">
                            <Image
                              src="/join-team-brand.webp"
                              alt="Suggest a perfume or claim a brand"
                              fill
                              sizes="(max-width: 768px) 100vw, 527px"
                              className="object-cover object-center"
                              loading="lazy"
                            />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
