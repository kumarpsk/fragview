'use client';

import { useState } from 'react';
import { X, Check, Plus } from 'lucide-react';
import { addToWardrobe } from '@/app/actions/wardrobe';

interface Props {
  perfumeId: string;
  perfumeName: string;
  perfumeBrand: string;
  perfumeImage?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_SUBCATS: Record<string, string[]> = {
  'My Bottles': ['Daily Wear', 'Special Occasions', 'Office', 'Date Night', 'Summer', 'Winter', 'Gym', 'General'],
  'Wishlist': ['High Priority', 'Must Try', 'Someday', 'Gift Ideas', 'General'],
  'Past Bottles': ['Finished', 'Gifted Away', 'Sold', 'General'],
};

export default function AddToWardrobeModal({
  perfumeId,
  perfumeName,
  perfumeBrand,
  perfumeImage,
  onClose,
  onSuccess,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<'My Bottles' | 'Wishlist' | 'Past Bottles'>('My Bottles');
  const [selectedSubcat, setSelectedSubcat] = useState('General');
  const [customSubcat, setCustomSubcat] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Map category to status
      let status: 'CURRENTLY_USING' | 'WISH_LIST' | 'USED_UP' = 'CURRENTLY_USING';
      if (selectedCategory === 'Wishlist') status = 'WISH_LIST';
      if (selectedCategory === 'Past Bottles') status = 'USED_UP';

      // Use custom subcategory if provided
      const finalSubcat = isCustom && customSubcat.trim() 
        ? customSubcat.trim() 
        : selectedSubcat;

      // Call server action
      const result = await addToWardrobe(
        perfumeId,
        status,
        finalSubcat,
        notes.trim() || undefined
      );

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError('Failed to add to wardrobe. Please try again.');
      console.error('Add to wardrobe error:', err);
    } finally {
      setLoading(false);
    }
  };

  const availableSubcats = DEFAULT_SUBCATS[selectedCategory] || ['General'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 bg-[#211F1C] border-b border-green-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white">Add to Wardrobe</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Perfume Preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {perfumeImage && (
              <img 
                src={perfumeImage} 
                alt={perfumeName}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{perfumeName}</p>
              <p className="text-sm text-gray-600 truncate">{perfumeBrand}</p>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['My Bottles', 'Wishlist', 'Past Bottles'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedSubcat('General');
                    setIsCustom(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-[#211F1C] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subcategory
            </label>
            {! isCustom ?  (
              <div className="space-y-2">
                <select
                  value={selectedSubcat}
                  onChange={(e) => setSelectedSubcat(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 outline-none text-white"
                >
                  {availableSubcats.map((subcat) => (
                    <option key={subcat} value={subcat} className='text-white'>
                      {subcat}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setIsCustom(true)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Subcategory
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customSubcat}
                  onChange={(e) => setCustomSubcat(e.target.value)}
                  placeholder="Enter custom subcategory..."
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsCustom(false);
                    setCustomSubcat('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  ← Back to presets
                </button>
              </div>
            )}
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add personal notes about this perfume..."
              className="w-full p-3 border border-gray-200 rounded-lg text-sm h-20 focus:ring-2 focus:ring-gray-500 outline-none resize-none text-white"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {notes.length}/500 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (isCustom && ! customSubcat.trim())}
              className="flex-1 py-3 bg-[#211F1C] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Add to Wardrobe
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}