"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const NewFooter = () => {
  const { data: session } = useSession();

  const scrollerTexts = [
    "Find your next scent",
    "100% honest reviews",
    "Discover range of scents",
    "Backed by real experience",
    "Choose with context",
  ];

  return (
    <footer className="flex flex-col items-center w-full bg-transparent">
      {/* Pre-Footer Section */}
      <div className="w-full flex flex-col items-center">
        {/* Hero Banner with Background Image */}

        <div
          className="relative w-full rounded-t-[56px]  "
          style={{
            background: `linear-gradient(360deg, rgba(33, 31, 28, 0.6) 0%, rgba(33, 31, 28, 0.4) 106%), url('/footer-bg.webp')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-10">
            <div className="flex flex-col items-start gap-6 max-w-[679px]">
              {/* Pre-title */}
              <div className="flex flex-col gap-1">
                <span className="font-hedvig font-normal text-xl lg:text-2xl leading-8 text-[#EFEFEF]">
                  Discover what fits
                </span>
                {/* Title */}
                <h2 className="font-hedvig font-normal text-3xl sm:text-4xl lg:text-[48px] leading-tight lg:leading-[56px] text-white">
                  We&apos;re here to help you explore scents that feel right
                </h2>
              </div>

              {/* Buttons */}
              <div className="flex flex-row flex-wrap items-center gap-4 lg:gap-6">
                {/* Get Started Button */}
                <Link
                  href={session ? "/discover" : "/signup"}
                  className="inline-flex items-center justify-between w-[203px] h-[50px] pl-4 pr-1 bg-[#211F1C] rounded-xl font-inter font-medium text-lg leading-[26px] text-white hover:bg-[#211F1C]/90 transition-colors"
                >
                  Get Started
                  <span className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
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

                {/* Our Collection Button */}
                <Link
                  href="/perfumes"
                  className="inline-flex items-center justify-between w-[227px] h-[50px] pl-4 pr-1 border border-white rounded-xl font-inter font-medium text-lg leading-[26px] text-white hover:bg-white/10 transition-colors"
                >
                  Our Collection
                  <span className="flex items-center justify-center w-10 h-10 bg-white/40 rounded-lg">
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
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Scroller Strip */}
        <div className="w-full h-[72px] bg-[#211F1C] flex items-center overflow-hidden z-40">
          <div className="flex items-center gap-6 animate-scroll whitespace-nowrap">
            {/* Duplicate texts for seamless loop */}
            {[...scrollerTexts, ...scrollerTexts, ...scrollerTexts].map(
              (text, idx) => (
                <React.Fragment key={idx}>
                  <span className="font-hedvig font-normal text-xl lg:text-2xl leading-8 tracking-[0.02em] text-white">
                    {text}
                  </span>
                  {/* Star separator */}
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M16 0L19.5 12.5L32 16L19.5 19.5L16 32L12.5 19.5L0 16L12.5 12.5L16 0Z"
                      fill="white"
                    />
                  </svg>
                </React.Fragment>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative w-full bg-[#211F1C] overflow-hidden">
        {/* Decorative flower images (top-left and bottom-right) */}
        <img
          src="/footerimglogohalf.webp"
          alt=""
          aria-hidden="true"
          className="absolute -top-10 -left-10 w-[250px] lg:w-[350px] h-auto opacity-60 brightness-200 contrast-150 pointer-events-none hidden md:block object-contain z-0"
        />
        <img
          src="/footerimglogo.webp"
          alt=""
          aria-hidden="true"
          className="absolute -bottom-10 -right-10 w-[250px] lg:w-[350px] h-auto opacity-60 brightness-200 contrast-150 pointer-events-none hidden md:block object-contain z-0"
        />

        {/* Top Border Line */}
        <div className="w-full h-px bg-white/50" />

        {/* Footer Content */}
        <div className="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-12 lg:px-[72px] py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-12">
            {/* Left Side - Link Columns */}
            <div className="flex flex-col sm:flex-row gap-8 lg:gap-[61px] max-sm:grid max-sm:grid-cols-2">
              {/* Account Column */}
              <div className="flex flex-col gap-5 min-w-[180px] lg:w-[212px]">
                <h3 className="font-[var(--font-averia)] font-normal text-sm leading-[22px] uppercase text-[#C4C4C3]">
                  ACCOUNT
                </h3>
                <div className="flex flex-col gap-4">
                  <Link
                    href="/profile"
                    className="font-[var(--font-inter)] font-normal text-base leading-6 text-white hover:text-white/80 transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/wardrobe"
                    className="font-[var(--font-inter)] font-normal text-base leading-6 text-white hover:text-white/80 transition-colors"
                  >
                    My Wardrobe
                  </Link>
                  <Link
                    href="/profile/reviews"
                    className="font-[var(--font-inter)] font-normal text-base leading-6 text-white hover:text-white/80 transition-colors"
                  >
                    My Reviews
                  </Link>
                  <Link
                    href="/settings"
                    className="font-[var(--font-inter)] font-normal text-base leading-6 text-white hover:text-white/80 transition-colors"
                  >
                    Settings
                  </Link>
                </div>
              </div>

              {/* Explore Column */}
              <div className="flex flex-col gap-5 min-w-[180px] lg:w-[212px]">
                <h3 className="font-[var(--font-averia)] font-normal text-sm leading-[22px] uppercase text-[#C4C4C3]">
                  EXPLORE
                </h3>
                <div className="flex flex-col gap-4">
                  <Link
                    href="/brands"
                    className="font-[var(--font-inter)] font-normal text-base leading-6 text-white hover:text-white/80 transition-colors"
                  >
                    Brands
                  </Link>
                  <Link
                    href="/perfumes"
                    className="font-[var(--font-inter)] font-normal text-base leading-6 text-white hover:text-white/80 transition-colors"
                  >
                    Perfumes
                  </Link>
                  <Link
                    href="/drydown"
                    className="font-[var(--font-inter)] font-normal text-base leading-6 text-white hover:text-white/80 transition-colors"
                  >
                    Drydown
                  </Link>
                </div>
              </div>

              {/* Connect Column */}
              <div className="flex flex-col gap-5 min-w-[180px] lg:w-[212px]">
                <h3 className="font-[var(--font-averia)] font-normal text-sm leading-[22px] uppercase text-[#C4C4C3]">
                  CONNECT
                </h3>
                <div className="flex flex-col gap-4">
                  <Link
                    href="/contact"
                    className="font-[var(--font-inter)] font-normal text-base leading-6 text-white hover:text-white/80 transition-colors"
                  >
                    Contact
                  </Link>
                  <Link
                    href="/submit"
                    className="font-[var(--font-inter)] font-normal text-base leading-6 text-white hover:text-white/80 transition-colors"
                  >
                    Submit Perfume
                  </Link>
                </div>
              </div>
            </div>

            {/* Vertical Divider - Desktop Only (1280px and above) */}
            <div className="hidden lm:block w-px h-[180px] bg-white/50 self-start" />

            {/* Right Side - Contact Info */}
            <div className="flex flex-col gap-[26px] lg:w-[290px]">
              <h3 className="font-[var(--font-hedvig)] font-normal text-xl lg:text-2xl leading-8 text-white">
                Contact us for any inquiry
              </h3>

              {/* Email Button */}
              <a
                href="mailto:info@fragview.com"
                className="inline-flex items-center gap-3 w-fit h-[44px] px-3 pr-4 bg-transparent border border-white rounded-full hover:bg-white/10 transition-colors"
              >
                <span className="relative flex items-center justify-center w-8 h-8 bg-transparent border border-white rounded-full">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <path
                      d="M3 7L12 13L21 7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="font-[var(--font-inter)] font-normal text-base leading-6 text-white">
                  info@fragview.com
                </span>
              </a>

              {/* Social Icons */}
              <div className="flex items-center gap-4">
                {/* Facebook */}
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex items-center justify-center w-10 h-10 bg-transparent border border-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex items-center justify-center w-10 h-10 bg-transparent border border-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="4"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <circle cx="17" cy="7" r="1" fill="white" />
                  </svg>
                </a>

                {/* X (Twitter) */}
                <a
                  href="#"
                  aria-label="X"
                  className="flex items-center justify-center w-10 h-10 bg-transparent border border-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 4L10.5 12.5M20 20L13.5 11.5M10.5 12.5L4 20M10.5 12.5L13.5 11.5M13.5 11.5L20 4"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="flex items-center justify-center w-10 h-10 bg-transparent border border-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="2"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 11V16M8 8V8.01M12 16V11M16 16V13C16 11.8954 15.1046 11 14 11C12.8954 11 12 11.8954 12 13"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-white/50" />

        {/* Large Fragview Text */}
        <div className="relative w-full flex justify-center overflow-hidden pt-2 pb-6">
          <span className="font-hedvig font-normal text-[80px] sm:text-[150px] lg:text-[160px] leading-none text-white whitespace-nowrap select-none">
            Fragview
          </span>
        </div>

        {/* Bottom Line */}
        <div className="w-full h-px bg-white/50" />

        {/* Bottom Bar */}
        <div className="px-6 sm:px-12 lg:px-[72px] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-inter font-normal text-base leading-6 text-white">
            Copyright © {new Date().getFullYear()} Fragview. All rights
            reserved.
          </p>
          <div className="relative z-10 flex items-center gap-6">
            <Link
              href="/terms"
              className="font-inter font-normal text-base leading-6 text-white hover:text-white/80 transition-colors"
            >
              Term of Service
            </Link>
            <Link
              href="/privacy"
              className="font-inter font-normal text-base leading-6 text-white hover:text-white/80 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* CSS for scroll animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </footer>
  );
};

export default NewFooter;
