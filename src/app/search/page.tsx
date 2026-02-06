'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Filter, X, Star, Loader2, Leaf, Flower2 } from 'lucide-react';
import AccordTags from '@/components/ui/AccordTags';
import RatingSlider from '@/components/ui/RatingSlider';

interface FilterState {
  brands: string[];
  perfumers: string[];
  notes: string[];
  accords: string[];
  rating: number;
  longevity: number;
  sillage: number;
  gender: string;
}

interface Perfume {
  _id: string;
  name: string;
  brand: string;
  slug: string;
  image?: string;
  year: number;
  gender: string;
  rating: number;
  longevity: number;
  sillage: number;
  perfumers: string[];
  accords: { name: string }[];
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [inlineAutocomplete, setInlineAutocomplete] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    perfumers: [],
    notes: [],
    accords: [],
    rating: 0,
    longevity: 0,
    sillage: 0,
    gender: 'all',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('relevance');
  
  // Autocomplete states
  const [brandSuggestions, setBrandSuggestions] = useState<any[]>([]);
  const [noteSuggestions, setNoteSuggestions] = useState<any[]>([]);
  const [accordSuggestions, setAccordSuggestions] = useState<any[]>([]);
  const [perfumerSuggestions, setPerfumerSuggestions] = useState<any[]>([]);
  
  // Filter input states
  const [brandInput, setBrandInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [accordInput, setAccordInput] = useState('');
  const [perfumerInput, setPerfumerInput] = useState('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Prevent duplicate API calls
  const isLoadingRef = useRef(false);
  const hasMountedRef = useRef(false);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  
  // Smart search with duplicate prevention
  useEffect(() => {
    if (isLoadingRef.current) {
      return;
    }
    
    // Check if user has made any changes from default state
    const isDefaultState = 
      !searchQuery.trim() &&
      filters.brands.length === 0 &&
      filters.perfumers.length === 0 &&
      filters.notes.length === 0 &&
      filters.accords.length === 0 &&
      filters.gender === 'all' &&
      filters.rating === 0 &&
      filters.longevity === 0 &&
      filters.sillage === 0;
    
    // If in default state and not interacted, load random perfumes
    if (isDefaultState && !hasInteracted) {
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        loadRandomPerfumes();
      }
      return;
    }
    
    // User has interacted, mark it
    if (!hasInteracted && !isDefaultState) {
      setHasInteracted(true);
    }
    
    // Perform search with debounce
    const timer = setTimeout(() => {
      performSearch();
    }, 150);
    
    return () => clearTimeout(timer);
  }, [searchQuery, filters, page, sort, hasInteracted]);
  
  // Load random perfumes with timeout
  async function loadRandomPerfumes() {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch('/api/search/random?limit=10', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await res.json();
      
      setPerfumes(data.perfumes || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request timed out, using fallback');
      } else {
        console.error('Random perfumes error:', error);
      }
      setPerfumes([]);
      setTotal(0);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }
  
  // Inline autocomplete with reduced debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setInlineAutocomplete('');
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        const data = await res.json();
        
        const firstSuggestion = 
          data.brands[0]?.name || 
          data.perfumes[0]?.variant_name || 
          '';
        
        if (firstSuggestion && firstSuggestion.toLowerCase().startsWith(searchQuery.toLowerCase())) {
          setInlineAutocomplete(firstSuggestion);
        } else {
          setInlineAutocomplete('');
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Autocomplete error:', error);
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Brand autocomplete
  useEffect(() => {
    if (brandInput.length < 1) {
      setBrandSuggestions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/filters?type=brands&q=${encodeURIComponent(brandInput)}`);
        const data = await res.json();
        setBrandSuggestions(data);
      } catch (error) {
        console.error('Brand suggestions error:', error);
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, [brandInput]);
  
  // Note autocomplete
  useEffect(() => {
    if (noteInput.length < 1) {
      setNoteSuggestions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/filters?type=notes&q=${encodeURIComponent(noteInput)}`);
        const data = await res.json();
        setNoteSuggestions(data);
      } catch (error) {
        console.error('Note suggestions error:', error);
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, [noteInput]);
  
  // Accord autocomplete
  useEffect(() => {
    if (accordInput.length < 1) {
      setAccordSuggestions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/filters?type=accords&q=${encodeURIComponent(accordInput)}`);
        const data = await res.json();
        setAccordSuggestions(data);
      } catch (error) {
        console.error('Accord suggestions error:', error);
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, [accordInput]);
  
  // Perfumer autocomplete
  useEffect(() => {
    if (perfumerInput.length < 1) {
      setPerfumerSuggestions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/filters?type=perfumers&q=${encodeURIComponent(perfumerInput)}`);
        const data = await res.json();
        setPerfumerSuggestions(data);
      } catch (error) {
        console.error('Perfumer suggestions error:', error);
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, [perfumerInput]);
  
  // Search with abort controller and timeout
  async function performSearch() {
    if (isLoadingRef.current) return;
    
    // Cancel previous request if still pending
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }
    
    isLoadingRef.current = true;
    setLoading(true);
    
    // Create new abort controller for this request
    const controller = new AbortController();
    searchAbortControllerRef.current = controller;
    
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        brands: filters.brands.join(','),
        gender: filters.gender,
        ratingMin: filters.rating.toString(),
        longevityMin: filters.longevity.toString(),
        sillageMin: filters.sillage.toString(),
        notes: filters.notes.join(','),
        accords: filters.accords.join(','),
        perfumers: filters.perfumers.join(','),
        sort,
        page: page.toString(),
      });
      
      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`/api/search/advanced?${params}`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await res.json();
      
      setPerfumes(data.perfumes || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Search aborted or timed out');
      } else {
        console.error('Search error:', error);
        setPerfumes([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
      searchAbortControllerRef.current = null;
    }
  }
  
  const addToFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev[type];
      if (Array.isArray(current)) {
        if (!current.includes(value)) {
          return { ...prev, [type]: [...current, value] };
        }
      }
      return prev;
    });
    if (!hasInteracted) setHasInteracted(true);
  };
  
  const removeFromFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev[type];
      if (Array.isArray(current)) {
        return { ...prev, [type]: current.filter(v => v !== value) };
      }
      return prev;
    });
  };
  
  const clearAllFilters = () => {
    // Cancel any pending search
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }
    
    setFilters({
      brands: [],
      perfumers: [],
      notes: [],
      accords: [],
      rating: 0,
      longevity: 0,
      sillage: 0,
      gender: 'all',
    });
    setSearchQuery('');
    setHasInteracted(false);
    hasMountedRef.current = false;
    setPage(1);
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.brands.length > 0) count++;
    if (filters.perfumers.length > 0) count++;
    if (filters.notes.length > 0) count++;
    if (filters.accords.length > 0) count++;
    if (filters.gender !== 'all') count++;
    if (filters.rating > 0) count++;
    if (filters.longevity > 0) count++;
    if (filters.sillage > 0) count++;
    return count;
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && inlineAutocomplete && inlineAutocomplete !== searchQuery) {
      e.preventDefault();
      setSearchQuery(inlineAutocomplete);
      setInlineAutocomplete('');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: '#FAFFF5' }}>
      {/* Animated Background Elements - ADDED */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl animate-pulse animate-delay-2" />
        
        <div className="absolute top-32 right-20 animate-float">
          <Leaf size={20} className="text-green-300/20" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float animate-delay-3">
          <Flower2 size={18} className="text-orange-300/20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
            Fragrance Search
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Find your perfect fragrance using our advanced search filters
          </p>
        </div>

        {/* Search Bar with Inline Autocomplete - UPDATED STYLING */}
        <div className="glass-card rounded-2xl shadow-sm p-6 mb-8 border border-green-100/50">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <div className="relative">
                {inlineAutocomplete && inlineAutocomplete.toLowerCase().startsWith(searchQuery.toLowerCase()) && (
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <span className="invisible">{searchQuery}</span>
                    <span>{inlineAutocomplete.slice(searchQuery.length)}</span>
                  </div>
                )}
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search fragrances, brands, notes..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!hasInteracted) setHasInteracted(true);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 backdrop-blur-sm text-gray-800 transition-colors duration-300"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-6 py-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors duration-300 relative bg-white/80 backdrop-blur-sm"
            >
              <Filter className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-gray-700">Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - UPDATED WITH GLASS EFFECT */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-6`}>
            <div className="glass-card rounded-2xl shadow-sm p-6 border border-green-100/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-green-600 hover:text-green-700 transition-colors duration-300"
                >
                  Clear All
                </button>
              </div>

              {/* Brand Filter with Autocomplete */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Brand</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-800 transition-colors duration-300"
                  />
                  {brandSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm border border-green-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                      {brandSuggestions.map((brand) => (
                        <button
                          key={brand._id}
                          onClick={() => {
                            addToFilter('brands', brand.name);
                            setBrandInput('');
                            setBrandSuggestions([]);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-green-50 text-sm text-gray-700"
                        >
                          {brand.name} <span className="text-gray-500">({brand.count})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {filters.brands.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.brands.map(brand => (
                      <span key={brand} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {brand}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromFilter('brands', brand)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Perfumer Filter with Autocomplete */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Perfumer</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search perfumers..."
                    value={perfumerInput}
                    onChange={(e) => setPerfumerInput(e.target.value)}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-800 transition-colors duration-300"
                  />
                  {perfumerSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm border border-green-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                      {perfumerSuggestions.map((perfumer, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            addToFilter('perfumers', perfumer.name);
                            setPerfumerInput('');
                            setPerfumerSuggestions([]);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-green-50 text-sm text-gray-700"
                        >
                          {perfumer.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {filters.perfumers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.perfumers.map(perfumer => (
                      <span key={perfumer} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                        {perfumer}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromFilter('perfumers', perfumer)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Gender Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Gender</h3>
                <div className="space-y-2">
                  {['all', 'male', 'female', 'unisex'].map(gender => (
                    <label key={gender} className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={filters.gender === gender}
                        onChange={(e) => {
                          setFilters(prev => ({ ...prev, gender: e.target.value }));
                          if (!hasInteracted) setHasInteracted(true);
                        }}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating, Longevity, Sillage Sliders */}
              <div className="mb-6 space-y-4">
                <RatingSlider
                  label="Minimum Rating"
                  value={filters.rating}
                  onChange={(value) => {
                    setFilters(prev => ({ ...prev, rating: value }));
                    if (!hasInteracted) setHasInteracted(true);
                  }}
                />
                <RatingSlider
                  label="Minimum Longevity"
                  value={filters.longevity}
                  onChange={(value) => {
                    setFilters(prev => ({ ...prev, longevity: value }));
                    if (!hasInteracted) setHasInteracted(true);
                  }}
                />
                <RatingSlider
                  label="Minimum Sillage"
                  value={filters.sillage}
                  onChange={(value) => {
                    setFilters(prev => ({ ...prev, sillage: value }));
                    if (!hasInteracted) setHasInteracted(true);
                  }}
                />
              </div>

              {/* Notes with Autocomplete */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Notes</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-800 transition-colors duration-300"
                  />
                  {noteSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm border border-green-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                      {noteSuggestions.map((note, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            addToFilter('notes', note.name);
                            setNoteInput('');
                            setNoteSuggestions([]);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-green-50 text-sm text-gray-700"
                        >
                          {note.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {filters.notes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.notes.map(note => (
                      <span key={note} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {note}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromFilter('notes', note)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Accords with Autocomplete */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Accords</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search accords..."
                    value={accordInput}
                    onChange={(e) => setAccordInput(e.target.value)}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-800 transition-colors duration-300"
                  />
                  {accordSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm border border-green-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                      {accordSuggestions.map((accord, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            addToFilter('accords', accord.name);
                            setAccordInput('');
                            setAccordSuggestions([]);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-green-50 text-sm text-gray-700"
                        >
                          {accord.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {filters.accords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.accords.map(accord => (
                      <span key={accord} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                        {accord}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromFilter('accords', accord)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-gray-600" />
                      Searching...
                    </span>
                  ) : (
                    <>
                      {hasInteracted ? `Found ${total.toLocaleString()} fragrances` : 'Explore our collection'}
                    </>
                  )}
                </p>
                <select 
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-800 transition-colors duration-300"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
              </div>
            ) : perfumes.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">
                  {hasInteracted 
                    ? 'No fragrances found. Try adjusting your filters.'
                    : 'Use the search bar or filters above to find your perfect scent.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {perfumes.map((fragrance) => (
                  <div key={fragrance._id} className="glass-card rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-green-100/50">
                    <div className="flex">
                      <div className="w-48 h-48 bg-gradient-to-br from-green-50/50 to-orange-50/50 flex items-center justify-center overflow-hidden">
                        {fragrance.image ? (
                          <img 
                            src={fragrance.image} 
                            alt={fragrance.name}
                            className="w-full h-full object-contain p-4"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-100 to-orange-100 opacity-20"></div>
                        )}
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Link href={`/perfumes/${fragrance.slug}`}>
                              <h3 className="text-xl font-semibold text-gray-900 hover:text-green-600 cursor-pointer transition-colors duration-300">
                                {fragrance.name}
                              </h3>
                            </Link>
                            <p className="text-gray-700">{fragrance.brand}</p>
                            <div className="flex items-center mt-2 text-sm text-gray-600">
                              <span className="capitalize">{fragrance.gender}</span>
                              {fragrance.perfumers.length > 0 && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{fragrance.perfumers[0]}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-orange-400 fill-current" />
                              <span className="ml-1 text-sm font-medium text-gray-900">{fragrance.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>

                        {fragrance.accords.length > 0 && (
                          <div className="mb-4">
                            <AccordTags accords={fragrance.accords} />
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="flex space-x-6 text-sm text-gray-600">
                            <div>
                              <span className="text-gray-500">Longevity:</span>
                              <span className="ml-1 font-medium text-gray-800">{fragrance.longevity.toFixed(1)}/5</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Sillage:</span>
                              <span className="ml-1 font-medium text-gray-800">{fragrance.sillage.toFixed(1)}/5</span>
                            </div>
                          </div>
                          <Link href={`/perfumes/${fragrance.slug}`} className="bg-gradient-to-r from-green-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && perfumes.length > 0 && total > 25 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-green-200 bg-white/80 text-gray-700 hover:bg-green-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={perfumes.length < 25}
                  className="px-4 py-2 rounded-lg border border-green-200 bg-white/80 text-gray-700 hover:bg-green-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;