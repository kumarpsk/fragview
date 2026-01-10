import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-fv-parchment border-t border-fv-parchment-border">
      <div className="mx-auto max-w-[1296px] px-4 sm:px-6 lg:px-[72px] py-10 lg:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo-icon.svg" alt="FragView" width={32} height={38} className="h-[38px] w-auto" />
              <span className="font-[var(--font-hedvig)] text-xl font-normal text-fv-ink">
                Fragview
              </span>
            </Link>
            <p className="text-sm text-fv-text-muted leading-relaxed">
              Discover, review, and explore the world of fragrances.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="text-fv-text-muted hover:text-fv-gold-dark transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-fv-text-muted hover:text-fv-gold-dark transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-fv-text-muted hover:text-fv-gold-dark transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-[var(--font-hedvig)] text-sm font-semibold text-fv-olive uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/brands" className="text-sm text-fv-ink hover:text-fv-gold-dark transition-colors">
                  Brands
                </Link>
              </li>
              <li>
                <Link href="/perfumes" className="text-sm text-fv-ink hover:text-fv-gold-dark transition-colors">
                  Perfumes
                </Link>
              </li>
              <li>
                <Link href="/drydown" className="text-sm text-fv-ink hover:text-fv-gold-dark transition-colors">
                  The Drydown
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-fv-ink hover:text-fv-gold-dark transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-[var(--font-hedvig)] text-sm font-semibold text-fv-olive uppercase tracking-wider mb-4">
              Account
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/profile" className="text-sm text-fv-ink hover:text-fv-gold-dark transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/wardrobe" className="text-sm text-fv-ink hover:text-fv-gold-dark transition-colors">
                  My Wardrobe
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-sm text-fv-ink hover:text-fv-gold-dark transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-[var(--font-hedvig)] text-sm font-semibold text-fv-olive uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/submit" className="text-sm text-fv-ink hover:text-fv-gold-dark transition-colors">
                  Submit a Perfume
                </Link>
              </li>
              <li>
                <Link href="/discover" className="text-sm text-fv-ink hover:text-fv-gold-dark transition-colors">
                  Discover
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-fv-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-fv-text-muted">
            © {new Date().getFullYear()} Fragview. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-fv-text-muted hover:text-fv-ink transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-fv-text-muted hover:text-fv-ink transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;