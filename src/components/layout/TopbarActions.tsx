"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuthModal } from "@/components/auth/AuthModal";
import { useSession, signOut } from "next-auth/react";
import {
  ArrowUpRight,
  ArrowRight,
  User,
  ChevronDown,
  Bell,
} from "lucide-react";

export default function TopbarActions({
  isMobile = false,
}: {
  isMobile?: boolean;
}) {
  const { data: session, status } = useSession();
  const { open } = useAuthModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Mobile layout: stacked buttons, smaller sizes per Figma
  if (isMobile) {
    return (
      <div className="flex flex-col gap-6">
        {status === "loading" && (
          <div className="h-10 w-32 rounded bg-gray-200 animate-pulse" />
        )}

        {status !== "loading" && user && (
          <div className="flex flex-col gap-4">
            <Link
              className="font-[var(--font-averia)] text-[20px] leading-7 font-light text-fv-ink"
              href="/profile"
            >
              @{user.username || user.email?.split("@")[0]}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-fv-border-strong bg-white px-6 font-[var(--font-inter)] text-base font-medium text-fv-ink hover:bg-fv-parchment/60 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}

        {status !== "loading" && !user && (
          <>
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
          </>
        )}
      </div>
    );
  }

  // Desktop layout with dropdown
  return (
    <div className="flex items-center gap-6">
      {status === "loading" && (
        <div className="h-[50px] w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {status !== "loading" && user && (
        <div className="flex items-center gap-6 w-[168px] h-8">
          <Link
            className="text-fv-ink hover:text-fv-gold-dark transition-colors"
            aria-label="Wardrobe"
            href="/wardrobe"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
              <circle
                cx="10"
                cy="12"
                r="1.1"
                fill="currentColor"
                stroke="none"
              />
              <circle
                cx="14"
                cy="12"
                r="1.1"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </Link>

          <Link
            className="text-fv-ink hover:text-fv-gold-dark transition-colors"
            href="/notifications"
            aria-label="Notifications"
          >
            <Bell className="h-8 w-8" strokeWidth={1.5} />
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 text-fv-ink hover:text-fv-gold-dark transition-colors"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <User className="h-8 w-8" strokeWidth={1.5} />
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                strokeWidth={1.5}
              />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-lg bg-white border border-fv-border-strong shadow-lg overflow-hidden z-50">
                <div className="py-2">
                  <Link
                    href="/profile"
                    className="flex items-center justify-between px-4 py-3 text-sm text-fv-ink hover:bg-fv-parchment/40 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>My Profile</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/wardrobe"
                    className="flex items-center justify-between px-4 py-3 text-sm text-fv-ink hover:bg-fv-parchment/40 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>My Wardrobe</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center justify-between px-4 py-3 text-sm text-fv-ink hover:bg-fv-parchment/40 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>Settings</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/submit"
                    className="flex items-center justify-between px-4 py-3 text-sm text-fv-ink hover:bg-fv-parchment/40 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>Submit Perfume</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <div className="border-t border-fv-border-strong my-2"></div>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm text-fv-ink hover:bg-fv-parchment/40 transition-colors text-left"
                  >
                    <span>Logout</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {status !== "loading" && !user && (
        <div className="flex items-center gap-6 max-xl:gap-1">
          <Link
            href="/signin"
            onClick={(e) => {
              e.preventDefault();
              open({ mode: "signin", reason: "Sign in to continue" });
            }}
            className="inline-flex h-[40px] items-center justify-center gap-2 rounded-lg border border-fv-border-strong bg-white px-6 py-2.5 font-[var(--font-inter)] text-lg leading-[26px] font-medium text-fv-ink hover:bg-fv-parchment/60 transition-colors whitespace-nowrap"
          >
            Log in
            <ArrowRight className="h-6 w-6 shrink-0" aria-hidden="true" />
          </Link>
          <Link
            href="/signup"
            onClick={(e) => {
              e.preventDefault();
              open({ mode: "signup", reason: "Create your FragView account" });
            }}
            className="inline-flex h-[40px] items-center gap-3 rounded-xl bg-fv-ink pl-4 pr-1 font-[var(--font-inter)] text-lg leading-[26px] font-medium text-white hover:bg-fv-ink/90 transition-colors whitespace-nowrap"
          >
            <span>Get Started</span>
            <span className="inline-flex p-1 shrink-0 items-center justify-center rounded-lg bg-white text-fv-ink">
              <ArrowUpRight className="h-6 w-6" aria-hidden="true" />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
