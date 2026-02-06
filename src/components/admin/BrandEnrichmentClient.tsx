'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateBrandEnrichment, markAsComplete } from '@/app/actions/admin/enrichment';
import { ArrowLeft, Save, CheckCircle, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import ImageUploadComponent from './ImageUploadComponent';

interface Brand {
  _id: string;
  name: string;
  country: string | null;
  description: string;
  founded_year: number | null;
  website: string | null;
  logo: string | null;
  missing_fields: string[];
  enrichment_status: string;
}

interface Props {
  brand: Brand;
}

export default function BrandEnrichmentClient({ brand }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: brand.name,
    country: brand.country || '',
    description: brand.description,
    founded_year: brand.founded_year,
    website: brand.website || '',
    logo: brand.logo,
  });

  const handleLogoUpload = (logoUrl: string) => {
    setFormData({ ...formData, logo: logoUrl });
  };

  const handleSave = async () => {
    setLoading(true);
    
    const result = await updateBrandEnrichment(brand._id, formData);
    
    if (result. success) {
      alert('✅ Brand enriched successfully!');
      router.push('/admin/enrichment');
    } else {
      alert('❌ Error: ' + result.error);
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!confirm('Mark this brand as complete?  This will remove it from the enrichment queue.')) return;
    
    setLoading(true);
    const result = await markAsComplete(brand._id, 'brand');
    
    if (result.success) {
      alert('✅ Marked as complete!');
      router. push('/admin/enrichment');
    } else {
      alert('❌ Error: ' + result.error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/enrichment"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enrich Brand</h1>
          <p className="text-gray-600">{brand.name}</p>
        </div>
      </div>

      {/* Missing Fields Alert */}
      {brand.missing_fields.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Upload className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Missing Fields</p>
              <p className="text-sm text-orange-700 mt-1">
                {brand.missing_fields.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Brand Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData. country}
                    onChange={(e) => setFormData({ ...formData, country: e.target. value })}
                    placeholder="e.g., France, USA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    value={formData.founded_year || ''}
                    onChange={(e) => setFormData({ ...formData, founded_year: parseInt(e.target.value) || null })}
                    placeholder="YYYY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData. website}
                  onChange={(e) => setFormData({ ...formData, website: e.target. value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ... formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter brand description..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Brand Logo</h3>
            <ImageUploadComponent
              currentImage={formData.logo}
              onImageUpload={handleLogoUpload}
              label="Upload Brand Logo"
            />
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
            
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ?  (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>

            <button
              onClick={handleMarkComplete}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              Mark as Complete
            </button>
          </div>

          {/* Status Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Status</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500">Current Status</p>
                <p className="font-medium text-gray-900 capitalize">{brand.enrichment_status}</p>
              </div>
              <div>
                <p className="text-gray-500">Missing Fields</p>
                <p className="font-medium text-gray-900">
                  {brand.missing_fields.length === 0 ? 'None' : brand.missing_fields.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}