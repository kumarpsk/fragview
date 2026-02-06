'use client';

import { useState, useEffect } from 'react';
import { Bell, Loader2, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface FollowedBrand {
  id: string;
  brandId: string;
  brandName: string;
  createdAt: string;
}

export default function FollowedBrandsWidget() {
  const [brands, setBrands] = useState<FollowedBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFollowedBrands();
  }, []);

  const fetchFollowedBrands = async () => {
    try {
      const res = await fetch('/api/brands/follow');
      const data = await res.json();
      setBrands(data.brands || []);
    } catch (error) {
      console.error('Error fetching followed brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (brandId: string, brandName: string) => {
    if (! confirm(`Unfollow ${brandName}?  You won't receive notifications about new releases.`)) {
      return;
    }

    setUnfollowingId(brandId);
    try {
      const res = await fetch('/api/brands/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, brandName })
      });

      if (res.ok) {
        setBrands(prev => prev.filter(b => b.brandId !== brandId));
      }
    } catch (error) {
      console.error('Error unfollowing brand:', error);
    } finally {
      setUnfollowingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className=" p-6">
        <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-gray-600 w-10 h-10" />
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-bold text-gray-900">Following Brands</h3>
        </div>
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">You&apos;re not following any brands yet</p>
          <Link 
            href="/brands"
            className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Explore Brands
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-bold text-gray-900">Following Brands</h3>
        </div>
        <span className="text-sm text-gray-500">{brands.length} brand{brands.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-orange-100 hover:border-orange-300 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-orange-400 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {brand.brandName[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <Link 
                  href={`/brands/${brand.brandId}`}
                  className="font-semibold text-gray-900 hover:text-green-600 flex items-center gap-1 group"
                >
                  <span className="truncate">{brand.brandName}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
                <p className="text-xs text-gray-500">
                  Following since {formatDate(brand.createdAt)}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleUnfollow(brand.brandId, brand.brandName)}
              disabled={unfollowingId === brand.brandId}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 ml-2"
              title="Unfollow"
            >
              {unfollowingId === brand.brandId ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}