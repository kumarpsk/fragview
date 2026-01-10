'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Star } from 'lucide-react';
import AccordTags from '@/components/ui/AccordTags';

type Brand = {
  name: string;
  country: string;
  founded: number;
  founder: string;
  description: string;
  fullDescription: string;
  logo: string;
  headquarters: string;
  website: string;
};

type Fragrance = {
  id: number;
  name: string;
  year: number;
  gender: string;
  rating: number;
  reviews: number;
  image: string;
  accords: Array<{ name: string }>;
};

type BrandPageClientProps = {
  brand: Brand;
  fragrances: Fragrance[];
};

export default function BrandPageClient({ brand, fragrances }: BrandPageClientProps) {
  const [sortBy, setSortBy] = useState<'name' | 'year' | 'rating' | 'reviews'>('name');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female' | 'unisex'>('all');

  const sortedFragrances = useMemo(() => {
    const filteredFragrances = fragrances.filter(
      (fragrance) => filterGender === 'all' || fragrance.gender.toLowerCase() === filterGender,
    );

    return [...filteredFragrances].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'year':
          return b.year - a.year;
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });
  }, [filterGender, fragrances, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        {/* Brand Header - FIXED */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-pastel-blue to-pastel-purple rounded-2xl opacity-20 dark:opacity-30"></div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{brand.name}</h1>
                  <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {brand.country}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Founded {brand.founded}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                    {brand.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-primary-100 dark:border-primary-800 transition-colors duration-300">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Brand Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Founder:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{brand.founder}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Headquarters:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{brand.headquarters}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Website:</span>
                  <span className="ml-2 font-medium text-primary-600 dark:text-primary-400">{brand.website}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total Fragrances:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{fragrances.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 transition-colors duration-300">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">About {brand.name}</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">
              {brand.fullDescription}
            </p>
          </div>
        </div>

        {/* Fragrances Section - FIXED */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0 transition-colors duration-300">All Fragrances</h2>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value as typeof filterGender)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
              >
                <option value="name">Sort by Name</option>
                <option value="year">Sort by Year</option>
                <option value="rating">Sort by Rating</option>
                <option value="reviews">Sort by Reviews</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedFragrances.map((fragrance) => (
              <Link key={fragrance.id} href={`/perfume/${fragrance.id}`}>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group border border-gray-100 dark:border-gray-600">
                  <div className="h-64 bg-gradient-to-br from-pastel-blue to-pastel-purple opacity-20 dark:opacity-30"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {fragrance.name}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">
                          <span>{fragrance.year}</span>
                          <span>•</span>
                          <span>{fragrance.gender}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">{fragrance.rating}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">({fragrance.reviews})</span>
                    </div>

                    <AccordTags accords={fragrance.accords} className="mb-4" />

                    <button className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white py-2 rounded-lg font-medium hover:shadow-lg transition-shadow">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {sortedFragrances.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg transition-colors duration-300">
                No fragrances found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
