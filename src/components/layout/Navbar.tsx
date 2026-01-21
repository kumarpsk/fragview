"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  User,
  ChevronDown,
  Bell,
} from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModal";
import { useSession, signOut } from "next-auth/react";
import SearchAutocomplete from "@/components/common/SearchAutocomplete";
import TopbarActions from "./TopbarActions";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { open } = useAuthModal();

  const user = session?.user;

  return (
    <header className="fixed top-0 z-50 w-full">
      {/* Top Strip */}
      <div className="h-12 bg-fv-ink text-white">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-center px-4 sm:px-6 lg:px-[72px]">
          <div className="flex items-center gap-4 text-center text-sm sm:text-base">
            <svg
              width="24"
              height="24"
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
            <span className="leading-6">
              Explore the best of perfumes, all for free
            </span>
            <svg
              width="24"
              height="24"
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
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="w-full border-b border-fv-parchment-border bg-fv-parchment">
        {/* Desktop: py-3 (12px), Mobile: py-2.5 (10px) for 64px total with 44px content */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-[72px] py-2.5 lg:py-3">
          {/* Desktop layout */}
          <div className="hidden lg:flex h-[50px] items-center justify-between gap-2">
            {/* Left group: Logo + links */}
            <div className="flex items-center gap-6 shrink-0 max-xl:gap-2">
              <Link href="/" className="group flex items-center gap-2">
                <Image
                  src="/logo-icon.svg"
                  alt="FragView"
                  width={37}
                  height={44}
                  className="h-11 w-auto"
                  priority
                />
                <span className="font-hedvig text-[28px] leading-[42px] font-normal text-fv-ink">
                  Fragview
                </span>
              </Link>

              <div className="flex items-center gap-6 max-xl:gap-2">
                <Link
                  href="/perfumes"
                  className={`relative font-averia text-[22px] leading-[30px] font-light transition-colors whitespace-nowrap px-1
                    ${
                      pathname === "/perfumes" ||
                      pathname.startsWith("/perfumes/")
                        ? 'text-fv-ink after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-1 after:bg-fv-ink after:rounded-full after:content-[""] after:w-full after:mx-auto'
                        : "text-fv-ink hover:text-fv-gold-dark"
                    }`}
                >
                  Perfumes
                </Link>
                <Link
                  href="/brands"
                  className={`relative font-averia text-[22px] leading-[30px] font-light transition-colors whitespace-nowrap px-1
                    ${
                      pathname === "/brands" || pathname.startsWith("/brands/")
                        ? 'text-fv-ink after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-1 after:bg-fv-ink after:rounded-full after:content-[""] after:w-full after:mx-auto'
                        : "text-fv-ink hover:text-fv-gold-dark"
                    }`}
                >
                  Brands
                </Link>
                <Link
                  href="/drydown"
                  className={`relative font-averia text-[22px] leading-[30px] font-light transition-colors whitespace-nowrap px-1
                    ${
                      pathname === "/drydown" ||
                      pathname.startsWith("/drydown/")
                        ? 'text-fv-ink after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-1 after:bg-fv-ink after:rounded-full after:content-[""] after:w-full after:mx-auto'
                        : "text-fv-ink hover:text-fv-gold-dark"
                    }`}
                >
                  Drydown
                </Link>
              </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-[384px] max-xl:max-w-[250px]">
              <SearchAutocomplete placeholder="Search" className="w-full" />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center shrink-0">
              <TopbarActions />
            </div>
          </div>

          {/* Mobile layout */}
          <div className="flex h-10 items-center justify-between lg:hidden">
            <Link href="/" className="group flex items-center gap-2">
              <Image
                src="/logo-icon.svg"
                alt="FragView"
                width={27}
                height={32}
                className="h-8 w-auto"
                priority
              />
              <span className="font-[var(--font-hedvig)] text-[20px] leading-[42px] font-normal text-fv-ink">
                Fragview
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {user && (
                <Link href="/notifications" aria-label="Notifications">
                  <Bell className="h-6 w-6 text-fv-ink" strokeWidth={1.5} />
                </Link>
              )}
              <button
                onClick={() => setIsOpen((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-fv-ink transition-colors hover:bg-white/60"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile panel */}
        {isOpen && (
          <div className="lg:hidden border-t border-fv-gold bg-fv-parchment">
            <div className="flex flex-col gap-5 px-6 py-6">
              {/* Search */}
              <SearchAutocomplete placeholder="Search" className="w-full" />

              {/* Explore section */}
              <div className="flex flex-col gap-2">
                <span className="font-[var(--font-hedvig)] text-sm leading-5 text-fv-olive">
                  Explore
                </span>

                <div className="flex flex-col gap-6">
                  <Link
                    href="/brands"
                    className="flex items-center justify-between"
                    onClick={() => setIsOpen(false)}
                  >
                    <span
                      className={`font-[var(--font-averia)] text-[20px] leading-7 font-light ${pathname === "/brands" || pathname.startsWith("/brands/") ? "text-[#B28845] underline" : "text-fv-ink"}`}
                    >
                      Brands
                    </span>
                    <ArrowUpRight className="h-6 w-6 text-fv-olive" />
                  </Link>
                  <Link
                    href="/perfumes"
                    className="flex items-center justify-between"
                    onClick={() => setIsOpen(false)}
                  >
                    <span
                      className={`font-[var(--font-averia)] text-[20px] leading-7 font-light ${pathname === "/perfumes" || pathname.startsWith("/perfumes/") ? "text-[#B28845] underline" : "text-fv-ink"}`}
                    >
                      Perfumes
                    </span>
                    <ArrowUpRight className="h-6 w-6 text-fv-olive" />
                  </Link>
                  <Link
                    href="/drydown"
                    className="flex items-center justify-between"
                    onClick={() => setIsOpen(false)}
                  >
                    <span
                      className={`font-[var(--font-averia)] text-[20px] leading-7 font-light ${pathname === "/drydown" || pathname.startsWith("/drydown/") ? "text-[#B28845] underline" : "text-fv-ink"}`}
                    >
                      Drydown
                    </span>
                    <ArrowUpRight className="h-6 w-6 text-fv-olive" />
                  </Link>
                  {user && (
                    <Link
                      href="/wardrobe"
                      className="flex items-center justify-between"
                      onClick={() => setIsOpen(false)}
                    >
                      <span
                        className={`font-[var(--font-averia)] text-[20px] leading-7 font-light ${pathname === "/wardrobe" || pathname.startsWith("/wardrobe/") ? "text-[#B28845] underline" : "text-fv-ink"}`}
                      >
                        My Wardrobe
                      </span>
                      <ArrowUpRight className="h-6 w-6 text-fv-olive" />
                    </Link>
                  )}
                </div>
              </div>

              {user && (
                <>
                  {/* Divider */}
                  <div className="border-t border-fv-border" />

                  {/* Account section */}
                  <div className="flex flex-col gap-2">
                    <span className="font-[var(--font-hedvig)] text-sm leading-5 text-fv-olive">
                      Account
                    </span>

                    <div className="flex flex-col gap-6">
                      <Link
                        href="/profile"
                        className="flex items-center justify-between"
                        onClick={() => setIsOpen(false)}
                      >
                        <span
                          className={`font-[var(--font-averia)] text-[20px] leading-7 font-light ${pathname === "/profile" ? "text-[#B28845] underline" : "text-fv-ink"}`}
                        >
                          My Profile
                        </span>
                        <ArrowUpRight className="h-6 w-6 text-fv-olive" />
                      </Link>
                      <Link
                        href="/wardrobe"
                        className="flex items-center justify-between"
                        onClick={() => setIsOpen(false)}
                      >
                        <span
                          className={`font-[var(--font-averia)] text-[20px] leading-7 font-light ${pathname === "/wardrobe" ? "text-[#B28845] underline" : "text-fv-ink"}`}
                        >
                          My Wardrobe
                        </span>
                        <ArrowUpRight className="h-6 w-6 text-fv-olive" />
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center justify-between"
                        onClick={() => setIsOpen(false)}
                      >
                        <span
                          className={`font-[var(--font-averia)] text-[20px] leading-7 font-light ${pathname === "/settings" ? "text-[#B28845] underline" : "text-fv-ink"}`}
                        >
                          Settings
                        </span>
                        <ArrowUpRight className="h-6 w-6 text-fv-olive" />
                      </Link>
                      <Link
                        href="/submit"
                        className="flex items-center justify-between"
                        onClick={() => setIsOpen(false)}
                      >
                        <span
                          className={`font-[var(--font-averia)] text-[20px] leading-7 font-light ${pathname === "/submit" ? "text-[#B28845] underline" : "text-fv-ink"}`}
                        >
                          Submit Perfume
                        </span>
                        <ArrowUpRight className="h-6 w-6 text-fv-olive" />
                      </Link>
                    </div>
                  </div>

                  {/* Logout button */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-fv-border-strong bg-white px-6 font-[var(--font-inter)] text-base font-medium text-fv-ink hover:bg-fv-parchment/60 transition-colors w-fit"
                  >
                    Logout
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {!user && (
                <>
                  {/* Divider */}
                  <div className="border-t border-fv-border" />

                  {/* Actions */}
                  <div className="flex flex-col gap-6 ">
                    <Link
                      href="/signin"
                      onClick={(e) => {
                        e.preventDefault();
                        open({ mode: "signin", reason: "Sign in to continue" });
                      }}
                      className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg border border-[#C4C4C3] bg-transparent px-6 py-2 font-[var(--font-inter)] text-base leading-6 font-medium text-fv-ink hover:bg-white/60 transition-colors"
                    >
                      Log in
                      <ArrowRight className="h-6 w-6" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/signup"
                      onClick={(e) => {
                        e.preventDefault();
                        open({
                          mode: "signup",
                          reason: "Create your FragView account",
                        });
                      }}
                      className="inline-flex h-10 w-fit items-center gap-3 rounded-xl bg-fv-ink pl-4 pr-1 py-1 font-[var(--font-inter)] text-base leading-6 font-medium text-white hover:bg-fv-ink/90 transition-colors"
                    >
                      <span>Get Started</span>
                      <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-white text-fv-ink">
                        <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
