'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Star, TrendingUp, Calendar, Award, Heart } from 'lucide-react';
import AccordTags from '@/components/ui/AccordTags';

const DiscoverPage = () => {
  const [activeTab, setActiveTab] = useState('trending');

  // Mock data for different discovery sections
  const trendingFragrances = [
    {
      id: 1,
      name: 'Sauvage',
      brand: 'Dior',
      rating: 4.3,
      reviews: 1247,
      trendScore: 98,
      accords: [{ name: 'fresh' }, { name: 'woody' }, { name: 'spicy' }]
    },
    {
      id: 2,
      name: 'Black Opium',
      brand: 'Yves Saint Laurent',
      rating: 4.5,
      reviews: 892,
      trendScore: 95,
      accords: [{ name: 'oriental' }, { name: 'gourmand' }, { name: 'sweet' }]
    },
    {
      id: 3,
      name: 'Bleu de Chanel',
      brand: 'Chanel',
      rating: 4.4,
      reviews: 1156,
      trendScore: 92,
      accords: [{ name: 'fresh' }, { name: 'woody' }, { name: 'citrus' }]
    }
  ];

  const newReleases = [
    {
      id: 4,
      name: 'Libre Intense',
      brand: 'Yves Saint Laurent',
      rating: 4.2,
      reviews: 234,
      releaseDate: '2024-01-15',
      accords: [{ name: 'floral' }, { name: 'oriental' }, { name: 'spicy' }]
    },
    {
      id: 5,
      name: 'Sauvage Parfum',
      brand: 'Dior',
      rating: 4.6,
      reviews: 456,
      releaseDate: '2024-02-20',
      accords: [{ name: 'woody' }, { name: 'fresh' }, { name: 'spicy' }]
    }
  ];

  const seasonalPicks = [
    {
      id: 6,
      name: 'Aqua di Gio Profondo',
      brand: 'Giorgio Armani',
      rating: 4.3,
      reviews: 678,
      season: 'Summer',
      accords: [{ name: 'aquatic' }, { name: 'fresh' }, { name: 'marine' }]
    },
    {
      id: 7,
      name: 'Tom Ford Oud Wood',
      brand: 'Tom Ford',
      rating: 4.7,
      reviews: 543,
      season: 'Winter',
      accords: [{ name: 'woody' }, { name: 'oriental' }, { name: 'smoky' }]
    }
  ];

  const collections = [
    {
      id: 1,
      title: 'Fresh & Clean',
      description: 'Perfect for everyday wear and office environments',
      fragranceCount: 15,
      image: 'fresh-collection',
      color: 'from-blue-400 to-cyan-300'
    },
    {
      id: 2,
      title: 'Oriental Luxury',
      description: 'Rich, complex fragrances for special occasions',
      fragranceCount: 12,
      image: 'oriental-collection',
      color: 'from-amber-400 to-orange-300'
    },
    {
      id: 3,
      title: 'Woody Classics',
      description: 'Timeless woody fragrances that never go out of style',
      fragranceCount: 18,
      image: 'woody-collection',
      color: 'from-amber-600 to-yellow-400'
    },
    {
      id: 4,
      title: 'Floral Romance',
      description: 'Romantic and feminine floral compositions',
      fragranceCount: 22,
      image: 'floral-collection',
      color: 'from-pink-400 to-rose-300'
    }
  ];

  const renderFragranceCard = (fragrance: any, showExtra: 'trend' | 'date' | 'season' | null = null) => (
    <div key={fragrance.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
      <div className="h-64 bg-gradient-to-br from-pastel-blue to-pastel-purple opacity-20 dark:opacity-30"></div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {fragrance.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{fragrance.brand}</p>
          </div>
          {showExtra === 'trend' && (
            <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              {fragrance.trendScore}
            </div>
          )}
          {showExtra === 'date' && (
            <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
              <Calendar className="w-4 h-4 mr-1" />
              New
            </div>
          )}
          {showExtra === 'season' && (
            <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
              <Award className="w-4 h-4 mr-1" />
              {fragrance.season}
            </div>
          )}
        </div>
        
        <div className="flex items-center mb-4">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">{fragrance.rating}</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">({fragrance.reviews})</span>
        </div>

        <AccordTags accords={fragrance.accords} className="mb-4" />
        
        <Link href={`/perfume/${fragrance.id}`} className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white text-center py-2 rounded-lg font-medium hover:shadow-lg transition-shadow block">
          Discover
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF9EF] dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header - FIXED */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Discover</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
            Explore curated collections, trending fragrances, and find your next signature scent
          </p>
        </div>

        {/* Featured Collections - FIXED */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">Curated Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((collection) => (
              <Link key={collection.id} href={`/collection/${collection.id}`}>
                <div className="group cursor-pointer">
                  <div className={`h-48 rounded-2xl bg-gradient-to-br ${collection.color} p-6 flex flex-col justify-end text-white mb-4 transform group-hover:scale-105 transition-transform shadow-lg`}>
                    <h3 className="text-xl font-semibold mb-2">{collection.title}</h3>
                    <p className="text-sm opacity-90">{collection.fragranceCount} fragrances</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm px-2 transition-colors duration-300">
                    {collection.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Tabbed Content - FIXED */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          {/* Tab Navigation - FIXED */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-8 py-4">
              <button
                onClick={() => setActiveTab('trending')}
                className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'trending'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Trending Now
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'new'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                New Releases
              </button>
              <button
                onClick={() => setActiveTab('seasonal')}
                className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'seasonal'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Award className="w-4 h-4 inline mr-2" />
                Seasonal Picks
              </button>
            </div>
          </div>

          {/* Tab Content - FIXED */}
          <div className="p-8">
            {activeTab === 'trending' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Trending Fragrances</h3>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">The most popular fragrances right now</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {trendingFragrances.map(fragrance => renderFragranceCard(fragrance, 'trend'))}
                </div>
              </div>
            )}

            {activeTab === 'new' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">New Releases</h3>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">The latest fragrances from top brands</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {newReleases.map(fragrance => renderFragranceCard(fragrance, 'date'))}
                </div>
              </div>
            )}

            {activeTab === 'seasonal' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Seasonal Picks</h3>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Perfect fragrances for the current season</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {seasonalPicks.map(fragrance => renderFragranceCard(fragrance, 'season'))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Inspiration Section - Already has proper gradient */}
        <section className="mt-16">
          <div className="bg-black/90 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Need More Inspiration?</h2>
            <p className="text-xl mb-8 text-primary-100">
              Take our fragrance quiz to discover your perfect scent profile
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quiz" className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow">
                Take Fragrance Quiz
              </Link>
              <Link href="/search" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
                Advanced Search
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DiscoverPage;