"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Building2,
  FileText,
  Star,
  TrendingUp,
  Settings,
  ClipboardList,
  BarChart3,
  ShieldAlert,
  Palette,
  AlertCircle, // ✅ Added for Enrichment
} from "lucide-react";
import { useRef } from "react";
import { scrollTabsBy, scrollToTabIndex } from "@/utils/colors";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Submissions", href: "/admin/submissions", icon: ClipboardList },
  {
    name: "Brand Applications",
    href: "/admin/brand-applications",
    icon: Building2,
  },
  { name: "Needs Enrichment", href: "/admin/enrichment", icon: AlertCircle }, // ✅ NEW
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Perfumes", href: "/admin/perfumes", icon: Package },
  { name: "Brands", href: "/admin/brands", icon: Building2 },
  { name: "Featured Content", href: "/admin/featured", icon: Star },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Moderation", href: "/admin/moderation", icon: ShieldAlert },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollRight = () => scrollTabsBy(tabsRef, 160);

  const scrollToTab = (index: number) => scrollToTabIndex(tabsRef, index);
  return (
    <>
      {/* Mobile nav (<= md) */}
      <div className="mt-3 w-full relative md:hidden h-fit px-2">
        <div
          ref={tabsRef}
          className="
          flex items-center lg:gap-0
          border border-[#EFEFEF] rounded-[32px]
              h-9 lg:h-12
          overflow-x-auto lg:overflow-hidden
         scrollbar-hide  scroll-smooth
        "
        >
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  scrollToTab(index);
                }}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-[var(--font-inter)] whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#211F1C] text-white"
                    : "bg-white text-[#4A4946] border border-[#E2E1E1] hover:bg-[#F9F7F5]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="lg:hidden flex-shrink-0 w-12" />
        </div>
        <div
          className="
    absolute right-0 top-1/2 -translate-y-1/2
    h-8 flex items-center
    bg-gradient-to-l from-[#FFF9EF] via-[#FFF9EF] to-transparent
    pl-6 pr-1 rounded-full
  "
        >
          <button
            type="button"
            onClick={scrollRight}
            className="w-8 h-8 flex items-center justify-center
               bg-[#211F1C] rounded-full"
            aria-label="Scroll tabs"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6L15 12L9 18"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* Desktop sidebar (md and up) */}
      <aside className="hidden md:block fixed left-0 top-28 h-screen w-64 bg-[#211F1C] border-r border-[#3A352F] text-[#F9F4EA] overflow-y-auto">
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-[var(--font-inter)] transition-colors ${
                  isActive
                    ? "bg-[#FFF4E3] text-[#211F1C] font-medium"
                    : "text-[#E2E1E1] hover:bg-[#3A352F] hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to Site */}
        <div className="mt-4 p-4 border-t border-[#3A352F]">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-3 text-sm font-[var(--font-inter)] text-[#E2E1E1] hover:text-white hover:bg-[#3A352F] rounded-lg transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </aside>
    </>
  );
}
