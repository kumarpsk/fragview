import Image from 'next/image';
import { loadPerfumes } from './loaders';
import PerfumesClient from './PerfumesClient';
import Link from 'next/link';

export const revalidate = 300;

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const baseUrl = 'https://fragviewvercel.vercel.app/perfumes';
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
  const title = q ? `Perfumes matching "${q}" | FragView` : 'Perfume Listing | FragView';
  const description =
    'Discover perfumes on FragView. Filter by brand, gender, rating and explore fragrance details.';
  return {
    title,
    description,
    alternates: { canonical: q ? `${baseUrl}?q=${encodeURIComponent(q)}` : baseUrl },
  };
}

export default async function PerfumesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedParams = await searchParams;
  const data = await loadPerfumes(resolvedParams);
  return (
    <div className="min-h-screen bg-[#FFF9EF]">
      {/* Hero Section */}
      <section
        className="relative w-full py-9 flex items-center"
        // style={{
        //   background: `linear-gradient(90deg, rgba(33, 31, 28, 0.6) 20.81%, rgba(33, 31, 28, 0.4) 88.57%), url('/perfumes-hero.webp')`,
        //   backgroundSize: 'cover',
        //   backgroundPosition: 'center',
        // }}
      >
        <Image src="/perfumes-hero.webp" alt="perfumes-hero" width={1440} height={853} className="absolute w-full h-full object-cover " />
     <div className="absolute inset-0 bg-[#211F1C] opacity-50" />
        <div className="mx-auto max-w-[1440px] w-full px-4 sm:px-6 lg:px-[72px] relative z-20">
          <div className="max-w-[775px] flex flex-col gap-3 lg:gap-4 p-4 lg:p-0">
            {/* Title */}
            <h1 className="font-hedvig font-normal text-[32px] leading-[40px] sm:text-[44px] sm:leading-[52px] lg:text-[56px] lg:leading-[64px] text-white">
              A curated world of modern fragrances
            </h1>
            {/* Description */}
            <p className="font-hedvig font-normal text-[16px] leading-[24px] sm:text-[20px] sm:leading-[28px] lg:text-[24px] lg:leading-[32px] text-white">
              Browse scents by name, character, and composition, designed to make exploration feel simple and unrushed.
            </p>
          </div>
        </div>
      </section>

      {/* Perfumes Content */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-12">
          <PerfumesClient
            initialItems={data.items}
            total={data.total}
            meta={data.meta}
            query={data.query}
            pageSize={data.pageSize}
          />
        </div>
      </section>

      {/* Your voice matters here - CTA Section */}
      <section className="relative overflow-hidden bg-[#FFF9EF] isolate">

        {/* Decorative background pattern */}
        <div
          className="absolute -left-[338px] -top-[398px] w-[567px] h-[651px] pointer-events-none -z-10"
          aria-hidden="true"
          style={{ transform: 'rotate(-42.21deg)' }}
        >
          <div
            className="absolute w-[200px] h-[330px] border border-[#ECE0CF] rounded-full"
            style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '2%', top: '-1%' }}
          />
          <div
            className="absolute w-[230px] h-[270px] border border-[#ECE0CF] rounded-full"
            style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '7%', top: '-31%' }}
          />
          <div
            className="absolute w-[200px] h-[270px] border border-[#ECE0CF] rounded-full"
            style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '-10%', top: '8%' }}
          />
          <div
            className="absolute w-[220px] h-[280px] border border-[#ECE0CF] rounded-full"
            style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '-14%', top: '-47%' }}
          />
          <div
            className="absolute w-[190px] h-[210px] border border-[#ECE0CF] rounded-full"
            style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '2%', top: '-51%' }}
          />
          <div
            className="absolute w-[210px] h-[220px] border border-[#ECE0CF] rounded-full"
            style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '-18%', top: '-8%' }}
          />
          <div
            className="absolute w-[160px] h-[200px] border border-[#ECE0CF] rounded-full"
            style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '-1%', top: '-27%' }}
          />
          <div
            className="absolute w-[170px] h-[180px] border border-[#ECE0CF] rounded-full"
            style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '-7%', top: '-15%' }}
          />
          <div
            className="absolute w-[140px] h-[160px] border border-[#ECE0CF] rounded-full"
            style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '3%', top: '-1%' }}
          />
          <div
            className="absolute w-[120px] h-[130px] border border-[#ECE0CF] rounded-full"
            style={{ transform: 'matrix(0.77, -0.64, 0.7, 0.71, 0, 0)', left: '7%', top: '-5%' }}
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

          <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-6 " >
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
                    <p className="font-inter font-normal text-[18px] leading-[26px] lg:text-[20px] lg:leading-[32px] text-[#4A4946]">
                      Found a missing perfume or own a brand? Submit suggestions or claim your profile for verification.
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
                      Did you find a missing perfume or brand? Let us know! You&apos;ll earn +5 XP if your suggestion is approved.
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
                      Are you the owner or representative of a fragrance brand? Claim your profile and get the &quot;Verified Brand&quot; badge.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link
                  href="/submit"
                  className="inline-flex items-center justify-between min-h-[40px] pl-4 pr-1 gap-3 bg-[#211F1C] rounded-xl font-inter font-medium text-[16px] leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors"
                >
                  Suggest a missing item
                  <span className=" flex items-center justify-center w-8 h-8 bg-white rounded-lg shrink-0">
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
                  className="inline-flex items-center justify-between min-h-[40px] pl-4 pr-1 gap-3 border border-[#211F1C] bg-transparent rounded-xl font-inter font-medium text-[16px] leading-[26px] text-[#211F1C] hover:bg-[#211F1C] hover:text-white transition-colors group"
                >
                  Apply for brand account
                  <span className=" flex items-center justify-center w-8 h-8 bg-[#211F1C] rounded-lg shrink-0 group-hover:bg-white">
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