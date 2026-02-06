import Link from "next/link";
import { ArrowRight, Droplets, MapPin } from "lucide-react";
import { ObjectId } from "mongodb";

import BrandsClient from "./BrandsClient";
import { loadBrands } from "./loaders";

import { getMongoDb } from "@/lib/mongodb";
import prisma from "@/lib/prisma";
import Image from "next/image";

type BrandItem = {
  _id: string;
  name: string;
  slug?: string;
  country?: string;
  description?: string;
  perfumes?: { name: string }[];
  perfumes_count?: number;
};

type TrendingBrandItem = {
  _id: string;
  name: string;
  slug: string;
  country?: string | null;
  perfumesCount: number;
};

async function getTrendingBrands(): Promise<TrendingBrandItem[]> {
  try {
    const db = await getMongoDb();

    // Get MANUALLY SELECTED trending brands from PostgreSQL
    const manualTrending = await prisma.trendingBrand.findMany({
      orderBy: { position: "asc" },
      take: 12,
    });

    let trendingBrands: any[] = [];

    if (manualTrending.length > 0) {
      const brandIds = manualTrending
        .map((b) => {
          try {
            return new ObjectId(b.brandId);
          } catch {
            return null;
          }
        })
        .filter((id): id is ObjectId => id !== null);

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

    return trendingBrands.map((b: any) => ({
      _id: b._id.toString(),
      name: b.name,
      slug: b.slug || b._id.toString(),
      country: b.country ?? b.origin_country ?? null,
      perfumesCount: b.perfumes_count || b.perfumes?.length || 0,
    }));
  } catch (error) {
    console.error("Error fetching trending brands for /brands:", error);
    return [];
  }
}

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const [data, trendingBrands] = await Promise.all([
    loadBrands(resolvedParams),
    getTrendingBrands(),
  ]);
  return (
    <div className="min-h-screen bg-[#FFF9EF]">
      {/* Hero Section */}
      <section
        className="relative w-full  flex items-center py-9 "
        // style={{
        //   background: `linear-gradient(90deg, rgba(33, 31, 28, 0.6) 20.81%, rgba(33, 31, 28, 0.4) 88.57%), url('/brands-hero.webp')`,
        //   backgroundSize: 'cover',
        //   backgroundPosition: 'center',
        // }}
      >
        <Image
          src="/brands-hero.webp"
          alt="brands-hero"
          width={1440}
          height={853}
          className="absolute w-full h-full object-cover "
        />
        <div className="absolute inset-0 bg-[#211F1C] opacity-50" />

        <div className="mx-auto max-w-[1440px] w-full px-4 sm:px-6 lg:px-[72px] z-20">
          <div className="max-w-[775px] flex flex-col gap-3 lg:gap-4 p-4 lg:p-0">
            <h1 className="font-hedvig font-normal text-[32px] leading-[40px] sm:text-[44px] sm:leading-[52px] lg:text-[56px] lg:leading-[64px] text-white">
              Discover world-class fragrance brands
            </h1>
            <p className="font-inter font-normal text-[16px] leading-[24px] sm:text-[20px] sm:leading-[28px] lg:text-[24px] lg:leading-[32px] text-white">
              Browse through thousands of fragrances from the world&apos;s most
              renowned perfume houses
            </p>
          </div>
        </div>
      </section>

      {/* Brands Content */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1440px]">
          {/* Featured brands (Trending Brands) */}
          <div className="px-4 sm:px-6 lg:px-[72px] py-5 flex flex-col gap-12">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-10">
              <div className="flex flex-col gap-1 flex-1">
                <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
                  Curated selections
                </span>
                <h2 className="font-hedvig font-normal text-[28px] leading-[36px] lg:text-[40px] lg:leading-[56px] text-[#211F1C]">
                  Featured brands to explore
                </h2>
              </div>

              {/* Figma button is display:none; keeping slot intentionally empty */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingBrands.length > 0 ? (
                trendingBrands.slice(0, 4).map((brand) => (
                  <Link
                    key={brand._id}
                    href={`/brands/${brand.slug}`}
                    className="flex flex-col justify-between rounded-2xl border border-[#EFEFEF] bg-[#FFF9EF] p-4 gap-5 min-h-[240px]"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEEBCE]">
                        <span className="font-hedvig text-[24px] leading-[32px] text-[#211F1C]">
                          {(brand.name?.trim()?.[0] ?? "B").toUpperCase()}
                        </span>
                      </div>

                      <div className="flex flex-col gap-3">
                        <h3 className="font-averia font-normal text-[24px] leading-[32px] text-[#211F1C]">
                          {brand.name}
                        </h3>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin
                              className="h-5 w-5 text-[#737270]"
                              aria-hidden="true"
                            />
                            <span className="font-inter text-[14px] leading-[20px] text-[#737270] truncate">
                              {brand.country || "Unknown"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Droplets
                              className="h-5 w-5 text-[#737270]"
                              aria-hidden="true"
                            />
                            <span className="font-inter text-[14px] leading-[20px] text-[#737270] text-right">
                              {brand.perfumesCount}{" "}
                              {brand.perfumesCount === 1
                                ? "Fragrance"
                                : "Fragrances"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <span className="flex items-center justify-center gap-2 w-full h-10 border border-[#C4C4C3] rounded-lg font-inter font-medium text-[14px] leading-[22px] text-[#211F1C] hover:bg-[#211F1C] hover:text-white transition-colors">
                      View Details
                      <ArrowRight className="h-6 w-6" aria-hidden="true" />
                    </span>
                  </Link>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center text-[#737270] py-8 font-inter">
                  No featured brands available at the moment.
                </div>
              )}
            </div>
          </div>{" "}
        </div>

        <div className=" bg-[#FFFCF7]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-5">
            <BrandsClient
              initialItems={data.items as BrandItem[]}
              total={data.total}
              meta={data.meta}
              query={data.query}
              pageSize={data.pageSize}
              letterTotals={data.letterTotals}
            />
          </div>
        </div>
      </section>

      {/* Your voice matters here - CTA Section */}
      <section className="relative overflow-hidden bg-white isolate">
        {/* Decorative background pattern */}
        <div
          className="absolute -left-[338px] -top-[398px] w-[567px] h-[651px] pointer-events-none -z-10"
          aria-hidden="true"
          style={{ transform: "rotate(-42.21deg)" }}
        >
          <div
            className="absolute w-[200px] h-[330px] border border-[#ECE0CF] rounded-full"
            style={{
              transform: "matrix(0.77, -0.64, 0.7, 0.71, 0, 0)",
              left: "2%",
              top: "-1%",
            }}
          />
          <div
            className="absolute w-[230px] h-[270px] border border-[#ECE0CF] rounded-full"
            style={{
              transform: "matrix(0.77, -0.64, 0.7, 0.71, 0, 0)",
              left: "7%",
              top: "-31%",
            }}
          />
          <div
            className="absolute w-[200px] h-[270px] border border-[#ECE0CF] rounded-full"
            style={{
              transform: "matrix(0.77, -0.64, 0.7, 0.71, 0, 0)",
              left: "-10%",
              top: "8%",
            }}
          />
          <div
            className="absolute w-[220px] h-[280px] border border-[#ECE0CF] rounded-full"
            style={{
              transform: "matrix(0.77, -0.64, 0.7, 0.71, 0, 0)",
              left: "-14%",
              top: "-47%",
            }}
          />
          <div
            className="absolute w-[190px] h-[210px] border border-[#ECE0CF] rounded-full"
            style={{
              transform: "matrix(0.77, -0.64, 0.7, 0.71, 0, 0)",
              left: "2%",
              top: "-51%",
            }}
          />
          <div
            className="absolute w-[210px] h-[220px] border border-[#ECE0CF] rounded-full"
            style={{
              transform: "matrix(0.77, -0.64, 0.7, 0.71, 0, 0)",
              left: "-18%",
              top: "-8%",
            }}
          />
          <div
            className="absolute w-[160px] h-[200px] border border-[#ECE0CF] rounded-full"
            style={{
              transform: "matrix(0.77, -0.64, 0.7, 0.71, 0, 0)",
              left: "-1%",
              top: "-27%",
            }}
          />
          <div
            className="absolute w-[170px] h-[180px] border border-[#ECE0CF] rounded-full"
            style={{
              transform: "matrix(0.77, -0.64, 0.7, 0.71, 0, 0)",
              left: "-7%",
              top: "-15%",
            }}
          />
          <div
            className="absolute w-[140px] h-[160px] border border-[#ECE0CF] rounded-full"
            style={{
              transform: "matrix(0.77, -0.64, 0.7, 0.71, 0, 0)",
              left: "3%",
              top: "-1%",
            }}
          />
          <div
            className="absolute w-[120px] h-[130px] border border-[#ECE0CF] rounded-full"
            style={{
              transform: "matrix(0.77, -0.64, 0.7, 0.71, 0, 0)",
              left: "7%",
              top: "-5%",
            }}
          />
        </div>
        <Image
          width={300}
          height={200}
          src="/Logo_vector.webp"
          alt=""
          aria-hidden="true"
          className="absolute"
        />

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-5 relative">
          <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-6">
            {/* Left Content */}
            <div className="flex flex-col gap-8 w-full lg:w-auto lg:flex-1 lg:max-w-[745px]">
              {/* Header Text */}
              <div className="flex flex-col gap-6">
                {/* Pre-title + Title + Description */}
                <div className="flex flex-col gap-1">
                  <span className="font-hedvig text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px] text-[#8A6A35]">
                    Your voice matters here
                  </span>
                  <div className="flex flex-col gap-4">
                    <h2 className="font-hedvig font-normal text-[32px] leading-[40px] lg:text-[40px] lg:leading-[56px] text-[#211F1C]">
                      Suggest a missing perfume or claim a brand
                    </h2>
                    <p className="font-inter font-normal text-[18px] leading-[26px] lg:text-[24px] lg:leading-[32px] text-[#4A4946]">
                      Found a missing perfume or own a brand? Submit suggestions
                      or claim your profile for verification.
                    </p>
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Community Suggestion */}
                  <div className="flex flex-col gap-1 py-2 px-4 bg-[#FFF4E3] rounded-2xl flex-1 max-w-[354px]">
                    <div className="flex items-center gap-3">
                      {/* Users Icon */}
                      <div className="flex items-center justify-center w-10 h-10 bg-[#FDE2B6] rounded-lg flex-shrink-0">
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
                        Community Suggestion
                      </span>
                    </div>
                    <p className="font-inter font-normal text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px] text-[#4A4946]">
                      Did you find a missing perfume or brand? Let us know!
                      You&apos;ll earn +5 XP if your suggestion is approved.
                    </p>
                  </div>

                  {/* Brand Owner */}
                  <div className="flex flex-col gap-1 py-2 px-4 bg-[#FFF4E3] rounded-2xl flex-1 max-w-[354px]">
                    <div className="flex items-center gap-3">
                      {/* User Icon */}
                      <div className="flex items-center justify-center w-10 h-10 bg-[#FDE2B6] rounded-lg flex-shrink-0">
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
                            stroke="#695129"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M6 21v-2a6 6 0 0 1 6-6 6 6 0 0 1 6 6v2"
                            stroke="#695129"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <span className="font-inter font-medium text-[18px] lg:text-[20px] leading-[26px] lg:leading-[28px] text-[#211F1C]">
                        Brand Owner
                      </span>
                    </div>
                    <p className="font-inter font-normal text-[14px] lg:text-[16px] leading-[22px] lg:leading-[24px] text-[#4A4946]">
                      Are you the owner or representative of a fragrance brand?
                      Claim your profile and get the &quot;Verified Brand&quot;
                      badge.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <Link
                  href="/submit"
                  className="inline-flex items-center justify-between w-full lg:w-auto min-h-[40px] pl-4 pr-1 gap-3 bg-[#211F1C] rounded-xl font-inter font-medium text-[16px] leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors"
                >
                  Suggest a missing item
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
                <Link
                  href="/submit?type=brand-claim"
                  className="inline-flex items-center justify-between w-full lg:w-auto min-h-[40px] pl-4 pr-1 gap-3 border border-[#211F1C] bg-transparent rounded-xl font-inter font-medium text-[16px] leading-[26px] text-[#211F1C] hover:bg-[#211F1C] hover:text-white transition-colors group"
                >
                  Apply for brand account
                  <span className="flex items-center justify-center w-8 h-8 bg-[#211F1C] rounded-lg shrink-0 group-hover:bg-white">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="group-hover:hidden"
                    >
                      <path
                        d="M7 17L17 7M17 7H7M17 7V17"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="hidden group-hover:block"
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

            {/* Right Image */}
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
