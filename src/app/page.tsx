import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Star, Droplets } from "lucide-react";
import AccordTags from "@/components/ui/AccordTags";
import { getMongoDb } from "@/lib/mongodb";
import prisma from "@/lib/prisma";
import { ObjectId } from "mongodb";
import Image from "next/image";
import dynamic from "next/dynamic";
import { getArticles } from "@/app/actions/drydown";

const PopularPicksSection = dynamic(
  () => import("@/components/home/PopularPicksSection"),
  { ssr: true, loading: () => <section className="bg-white py-12 lg:py-16" aria-label="Loading popular picks"><div className="mx-auto max-w-[1296px] px-4 sm:px-6 lg:px-[72px]"><div className="h-64 animate-pulse rounded-2xl bg-[#F9F7F5]" /></div></section> }
);

const BrandPerfumesSection = dynamic(
  () => import("@/components/home/BrandPerfumesSection"),
  { ssr: true, loading: () => <section className="bg-white py-12 lg:py-16" aria-label="Loading brands"><div className="mx-auto max-w-[1296px] px-4 sm:px-6 lg:px-[72px]"><div className="h-64 animate-pulse rounded-2xl bg-[#F9F7F5]" /></div></section> }
);

// Server Component - fetch data at build time
async function getHomePageData() {
  try {
    const db = await getMongoDb();

    // Get total counts
    const [perfumesCount, brandsCount, reviewsCount] = await Promise.all([
      db.collection("perfumes").countDocuments(),
      db.collection("brands").countDocuments(),
      prisma.review.count(),
    ]);

    // Get MANUALLY SELECTED featured perfumes from PostgreSQL
    const manualFeatured = await prisma.featuredPerfume.findMany({
      orderBy: { position: "asc" },
      take: 24,
    });

    let featuredPerfumes = [];

    if (manualFeatured.length > 0) {
      // Use manually selected perfumes
      const perfumeIds = manualFeatured
        .map((f) => {
          try {
            return new ObjectId(f.perfumeId);
          } catch {
            return null;
          }
        })
        .filter((id) => id !== null);

      if (perfumeIds.length > 0) {
        featuredPerfumes = await db
          .collection("perfumes")
          .find({ _id: { $in: perfumeIds } })
          .toArray();
      }
    }

    // Fallback to random if no manual selections
    if (featuredPerfumes.length === 0) {
      featuredPerfumes = await db
        .collection("perfumes")
        .aggregate([
          { $match: { $or: [{ featured: true }, { rating: { $gte: 4.0 } }] } },
          { $sample: { size: 24 } },
        ])
        .toArray();
    }

    // Get MANUALLY SELECTED trending brands from PostgreSQL
    const manualTrending = await prisma.trendingBrand.findMany({
      orderBy: { position: "asc" },
      take: 12,
    });

    let trendingBrands = [];

    if (manualTrending.length > 0) {
      // Use manually selected brands
      const brandIds = manualTrending
        .map((b) => {
          try {
            return new ObjectId(b.brandId);
          } catch {
            return null;
          }
        })
        .filter((id) => id !== null);

      if (brandIds.length > 0) {
        trendingBrands = await db
          .collection("brands")
          .find({ _id: { $in: brandIds } })
          .toArray();
      }
    }

    // Fallback to random if no manual selections
    if (trendingBrands.length === 0) {
      trendingBrands = await db
        .collection("brands")
        .aggregate([
          {
            $addFields: {
              perfumes_count: {
                $ifNull: [
                  "$perfumes_count",
                  { $size: { $ifNull: ["$perfumes", []] } },
                ],
              },
            },
          },
          {
            $match: {
              $or: [{ trending: true }, { perfumes_count: { $gte: 10 } }],
            },
          },
          { $sample: { size: 12 } },
        ])
        .toArray();
    }

    let latestArticles: any[] = [];
    try {
      const { articles } = await getArticles(undefined, 1, 3);
      latestArticles = articles;
    } catch (e) {
      console.error("Error fetching latest articles for homepage:", e);
      latestArticles = [];
    }

    // Fetch top 9 highest-rated perfumes for each trending brand
    const brandNames = trendingBrands.slice(0, 4).map((b: any) => b.name);
    const brandPerfumesMap: Record<string, any[]> = {};

    if (brandNames.length > 0) {
      const topBrandPerfumes = await db
        .collection("perfumes")
        .aggregate([
          {
            $match: {
              $or: [
                { brand_name: { $in: brandNames } },
                { brand: { $in: brandNames } },
              ],
            },
          },
          { $sort: { rating: -1 } },
          {
            $group: {
              _id: { $ifNull: ["$brand_name", "$brand"] },
              perfumes: { $push: "$$ROOT" },
            },
          },
          {
            $project: {
              _id: 1,
              perfumes: { $slice: ["$perfumes", 9] },
            },
          },
        ])
        .toArray();

      for (const group of topBrandPerfumes) {
        brandPerfumesMap[group._id.toLowerCase()] = group.perfumes.map(
          (p: any) => ({
            _id: p._id.toString(),
            name: p.variant_name || p.name,
            brand: p.brand_name || p.brand,
            slug: p.slug || p._id.toString(),
            image: p.image || p.perfume_image,
            rating: p.rating || 0,
            reviewCount: p.reviewCount || 0,
            gender: p.gender,
            accords: (p.accords || [])
              .slice(0, 3)
              .map((a: any) => ({ name: a.name || a })),
          })
        );
      }
    }

    return {
      perfumesCount: perfumesCount || 10000,
      brandsCount: brandsCount || 500,
      reviewsCount: reviewsCount || 0,
      featuredPerfumes: featuredPerfumes.map((p: any) => ({
        _id: p._id.toString(),
        name: p.variant_name || p.name,
        brand: p.brand_name || p.brand,
        slug: p.slug || p._id.toString(),
        image: p.image || p.perfume_image,
        rating: p.rating || 0,
        gender: p.gender,
        accords: (p.accords || [])
          .slice(0, 3)
          .map((a: any) => ({ name: a.name || a })),
      })),
      brandPerfumesMap,
      trendingBrands: trendingBrands.map((b: any) => ({
        _id: b._id.toString(),
        name: b.name,
        slug: b.slug || b._id.toString(),
        perfumesCount: b.perfumes_count || b.perfumes?.length || 0,
      })),
      latestArticles: latestArticles.map((a: any) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        coverImage: a.coverImage,
        category: a.category,
        readTime: a.readTime,
        publishedAt: a.publishedAt,
        createdAt: a.createdAt,
        author: {
          name: a.author?.name ?? "Fragview",
        },
      })),
    };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return {
      perfumesCount: 10000,
      brandsCount: 500,
      reviewsCount: 0,
      featuredPerfumes: [],
      brandPerfumesMap: {},
      trendingBrands: [],
      latestArticles: [],
    };
  }
}

export const revalidate = 300; // 5 minutes

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <div className="min-h-screen bg-white text-fv-ink">
      {/* Hero Section - Figma style */}
      {/* Hero Section */}
      <section className="relative bg-fv-parchment overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/Logo_vector.webp"
            alt=""
            fill
            className="object-cover object-center opacity-[.33] pointer-events-none"
            sizes="100vw"
            fetchPriority="low"
            loading="lazy"
          />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-8 md:px-12 lg:px-[72px] py-6">
          <div className="mx-auto max-w-[1296px]">
            {/* FLEX LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-center justify-center">
              {/* LEFT COLUMN */}
              <div className="flex flex-col lg:w-[686px]">
                {/* TEXT */}
                <h1 className=" font-hedvig text-[36px] sm:text-[44px] lg:text-[48px] leading-[1.14] text-fv-ink">
                  Discover perfumes worth your time and liking
                </h1>

                <p
                  className="
              mt-5 
              font-[var(--font-inter)]
              text-[#4A4946]
              text-sm
              sm:text-lg
              lg:text-xl 
            "
                >
                  You can browse scents, understand how they feel, and keep
                  track of the fragrances that catch your attention with
                  personal wardrobe to save perfumes you like, want to try or
                  remember.
                </p>

                {/* TWO SMALL CARDS */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Explore by brands */}
                  <Link
                    href="/brands"
                    className="group relative h-[260px] md:h-[300px] overflow-hidden rounded-2xl"
                  >
                    <Image
                      src="/brands_home.webp"
                      alt="Explore by brands"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                    <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between">
                      <span className="text-white font-[var(--font-inter)] text-lg font-medium">
                        Explore by brands
                      </span>
                      <ArrowUpRight className="h-6 w-6 text-white" />
                    </div>
                  </Link>

                  {/* Drydown */}
                  <Link
                    href="/drydown"
                    className="group relative h-[260px] md:h-[300px] overflow-hidden rounded-2xl"
                  >
                    <Image
                      src="/drydown_home.webp"
                      alt="Drydown"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                    <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between">
                      <span className="text-white font-[var(--font-inter)] text-lg font-medium">
                        Drydown
                      </span>
                      <ArrowUpRight className="h-6 w-6 text-white" />
                    </div>
                  </Link>
                </div>
              </div>

              {/* BIG CARD – MOVES BELOW ON TABLET */}
              <Link
                href="/perfumes"
                className="
    group relative
    w-full
    h-[360px]
    md:h-[420px]
    lg:w-[570px]
    lg:h-[550px]
    rounded-2xl
    overflow-hidden
    pt-4 pb-4 pl-5 pr-5
  "
              >
                <Image
                  src="/perfumes_home.webp"
                  alt="View Perfumes"
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 570px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-2xl" />

                {/* Content */}
                <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between gap-2">
                  <span className="text-white font-[var(--font-inter)] text-xl sm:text-2xl font-medium">
                    View Perfumes
                  </span>
                  <ArrowUpRight className="h-8 w-8 text-white" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Cards - Responsive */}
      <section className="bg-white">
        <div
          className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 md:px-12 lg:px-[72px] py-6"
        >
          {/* Content wrapper */}
          <div className="mx-auto max-w-[1296px] flex flex-col gap-6 ">
            {/* Section Text */}
            <div className="flex flex-col gap-0.5">
              {/* Pre-title */}
              <div className="font-hedvig text-lg sm:text-xl md:text-[24px] leading-tight sm:leading-[32px] font-normal text-[#8A6A35]">
                The scale of Fragview
              </div>

              {/* Title */}
              <h2 className="font-hedvig text-3xl sm:text-4xl md:text-[40px] leading-tight sm:leading-[56px] font-normal text-fv-ink">
                A lot to explore, in one place
              </h2>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Card 01 */}
              <div className="rounded-xl border border-[#E2E1E1] bg-white p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="font-hedvig text-lg sm:text-[20px] leading-[28px] font-normal text-[#737270]">
                      Fragrances
                    </div>
                    <div className="font-hedvig text-4xl sm:text-5xl md:text-[50px] leading-tight sm:leading-[64px] font-normal text-fv-ink">
                      {data.perfumesCount >= 1000
                        ? `${Math.floor(data.perfumesCount / 1000)}k+`
                        : `${data.perfumesCount}+`}
                    </div>
                  </div>
                  <p className="font-[var(--font-inter)] text-base sm:text-[18px] leading-relaxed sm:leading-[26px] text-[#737270]">
                    From niche houses to heritage classics, all mapped by notes,
                    mood and seasonality.
                  </p>
                </div>
              </div>

              {/* Card 02 */}
              <div className="rounded-xl border border-[#E2E1E1] bg-white p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="font-hedvig text-lg sm:text-[20px] leading-[28px] font-normal text-[#737270]">
                      Brands
                    </div>
                    <div className="font-hedvig text-4xl sm:text-5xl md:text-[50px] leading-tight sm:leading-[64px] font-normal text-fv-ink">
                      {data.brandsCount >= 1000
                        ? `${Math.floor(data.brandsCount / 1000)}k+`
                        : `${data.brandsCount}+`}
                    </div>
                  </div>
                  <p className="font-[var(--font-inter)] text-base sm:text-[18px] leading-relaxed sm:leading-[26px] text-[#737270]">
                    Thousands of perfume brands, with a vast collection of their
                    perfumes.
                  </p>
                </div>
              </div>

              {/* Card 03 */}
              <div className="rounded-xl border border-[#E2E1E1] bg-white p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="font-hedvig text-lg sm:text-[20px] leading-[28px] font-normal text-[#737270]">
                      Reviews
                    </div>
                    <div className="font-hedvig text-4xl sm:text-5xl md:text-[50px] leading-tight sm:leading-[64px] font-normal text-fv-ink">
                      {data.reviewsCount >= 1000
                        ? `${Math.floor(data.reviewsCount / 1000)}k+`
                        : `${data.reviewsCount}+`}
                    </div>
                  </div>
                  <p className="font-[var(--font-inter)] text-base sm:text-[18px] leading-relaxed sm:leading-[26px] text-[#737270]">
                    Honest reviews, not just star ratings — so you understand
                    how a scent truly wears.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular picks (Figma-style tabs + grid) */}
      <PopularPicksSection perfumes={data.featuredPerfumes} />

      {/* Perfumes by brand (Figma-style with brand tabs and perfume cards) */}
      <BrandPerfumesSection
        brands={data.trendingBrands}
        brandPerfumesMap={data.brandPerfumesMap}
      />

      {/* OLD Perfumes by brand section - commented out
      <section className="bg-white">
        <div className="mx-auto max-w-[1296px] px-4 sm:px-6 lg:px-[72px] py-12 lg:py-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-lg sm:text-xl text-fv-olive">Perfumes by brand</div>
              <h2 className="mt-2 text-3xl sm:text-4xl lg:text-[48px] leading-tight font-semibold">
                Explore fragrance houses
              </h2>
            </div>
            <Link
              href="/brands"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-fv-border-strong bg-white px-4 py-2 text-sm font-medium text-fv-ink hover:bg-fv-parchment/60"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.trendingBrands.length > 0 ? (
              data.trendingBrands.map((brand: any) => (
                <Link key={brand._id} href={`/brands/${brand.slug}`} className="group">
                  <div className="rounded-xl border border-fv-border bg-white p-5 text-center transition-colors group-hover:bg-fv-parchment/40">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-fv-border bg-fv-parchment text-fv-ink font-semibold">
                      {brand.name?.[0] ?? 'B'}
                    </div>
                    <div className="mt-3 font-semibold">{brand.name}</div>
                    <div className="mt-1 text-xs text-fv-text-muted">{brand.perfumesCount} fragrances</div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center text-fv-text-muted py-8">
                No trending brands available at the moment
              </div>
            )}
          </div>

          <div className="mt-8 sm:hidden">
            <Link
              href="/brands"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-fv-border-strong bg-white px-4 py-3 text-sm font-medium text-fv-ink hover:bg-fv-parchment/60"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      */}

      {/* Read & explore (The Drydown) - Figma style */}
      <section className="bg-[#FFF9EF]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-5">
          {/* Header */}
          <div className="flex flex-col gap-1">
            {/* Pre-title */}
            <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
              Read &amp; explore
            </span>
            {/* Title */}
            <h2 className="font-hedvig font-normal text-[28px] leading-[36px] lg:text-[40px] lg:leading-[56px] text-[#211F1C]">
              Notes on perfume, style, and how we wear scent
            </h2>
          </div>

          {/* Article Cards Grid */}
          <div className="mt-4  grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.latestArticles?.length ? (
              data.latestArticles.map((a: any) => (
                <Link
                  key={a.id}
                  href={`/drydown/${a.slug}`}
                  className="group flex flex-col bg-[#FFF4E3] rounded-[16px] overflow-hidden isolate"
                >
                  {/* Image Area */}
                  <div className="relative h-[280px] lg:h-[335px] bg-white border-t border-l border-r border-[#EFEFEF] rounded-t-[16px] overflow-hidden">
                    {a.coverImage ? (
                      <Image
                        src={a.coverImage}
                        alt={a.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-[#ECE0CF]" />
                    )}
                    {/* Badges - Category & Date */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      {/* Category Badge */}
                      <span className="flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-[14px] leading-[20px] text-[#695129]">
                        {a.category || "News"}
                      </span>
                      {/* Date Badge */}
                      <span className="flex items-center justify-center px-[10px] py-1 bg-[#ECE0CF] rounded-[24px] font-inter font-medium text-[14px] leading-[20px] text-[#695129]">
                        {new Date(
                          a.publishedAt || a.createdAt
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex flex-col flex-1 p-6 gap-6 max-xl:p-2">
                    <div className="flex flex-col gap-3">
                      {/* Title */}
                      <h3 className="font-averia font-normal text-[24px] leading-[32px] text-[#211F1C] line-clamp-2">
                        {a.title}
                      </h3>
                      {/* Excerpt */}
                      <p className="font-inter font-normal text-[16px] lg:text-[18px] leading-[24px] lg:leading-[26px] text-[#4A4946] line-clamp-4">
                        {a.excerpt}
                      </p>
                    </div>

                    {/* Divider + Meta */}
                    <div className="mt-auto flex flex-col gap-6 ">
                      {/* Divider */}
                      <div className="w-full h-px bg-[#E2E1E1]" />

                      {/* Author & Read Time */}
                      <div className="flex items-center justify-between gap-2">
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
                          <span className="font-inter font-normal text-[16px] leading-[24px] text-[#4A4946]">
                            {a.author?.name || "Fragview"}
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
                          <span className="font-inter font-normal text-[16px] leading-[24px] text-[#4A4946]">
                            {a.readTime || "5 min read"}
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

          {/* View More Button */}
          <div className="mt-3 flex justify-center">
            <Link
              href="/drydown"
              className="inline-flex items-center justify-between py-2 px-4 gap-4 bg-[#211F1C] rounded-[12px] font-inter font-medium text-[16px] leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors"
            >
              View More
              <span className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shrink-0">
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
        </div>
      </section>

      {/* OLD CTA - Commented out, replaced by NewFooter Pre-Footer section
      <section className="bg-fv-parchment border-t border-fv-parchment-border">
        <div className="mx-auto max-w-[1296px] px-4 sm:px-6 lg:px-[72px] py-12 lg:py-16">
          <div className="rounded-2xl border border-fv-border bg-white p-8 sm:p-10">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-semibold">Ready to Find Your Signature Scent?</h2>
              <p className="mt-3 text-fv-text-muted">
                Join thousands of fragrance enthusiasts on FragView and start building your scent wardrobe today
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-between gap-3 rounded-xl bg-fv-ink px-4 py-3 text-base font-medium text-white transition-colors hover:bg-fv-ink/90"
              >
                <span className="px-2">Get Started</span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-fv-ink">
                  <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                </span>
              </Link>

              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-fv-border-strong bg-white px-6 py-3 text-base font-medium text-fv-ink hover:bg-fv-parchment/60"
              >
                Explore Now
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      */}
    </div>
  );
}
