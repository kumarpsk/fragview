'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePerfumeEnrichment, markAsComplete } from '@/app/actions/admin/enrichment';
import { ArrowLeft, Save, CheckCircle, Loader2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import ImageUploadComponent from './ImageUploadComponent';

interface Perfume {
  _id: string;
  name: string;
  brand_name: string;
  gender: string;
  concentration: string;
  description: string;
  launch_year: number | null;
  perfumer: string | null;
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
  accords: string[];
  image: string | null;
  missing_fields: string[];
  enrichment_status: string;
}

interface Props {
  perfume: Perfume;
}

export default function PerfumeEnrichmentClient({ perfume }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: perfume. name,
    brand_name: perfume.brand_name,
    gender: perfume.gender,
    concentration: perfume.concentration,
    description: perfume. description,
    launch_year: perfume.launch_year,
    perfumer: perfume.perfumer || '',
    notes: perfume.notes,
    accords: perfume. accords,
    image: perfume.image,
  });

  const [topNotesInput, setTopNotesInput] = useState('');
  const [middleNotesInput, setMiddleNotesInput] = useState('');
  const [baseNotesInput, setBaseNotesInput] = useState('');
  const [accordsInput, setAccordsInput] = useState('');

  const handleImageUpload = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl });
  };

  const handleAddNote = (type: 'top' | 'middle' | 'base', value: string) => {
    if (! value.trim()) return;
    
    setFormData({
      ...formData,
      notes: {
        ...formData.notes,
        [type]: [...formData.notes[type], value. trim()],
      },
    });

    // Clear input
    if (type === 'top') setTopNotesInput('');
    if (type === 'middle') setMiddleNotesInput('');
    if (type === 'base') setBaseNotesInput('');
  };

  const handleRemoveNote = (type: 'top' | 'middle' | 'base', index: number) => {
    setFormData({
      ...formData,
      notes: {
        ...formData.notes,
        [type]: formData.notes[type].filter((_, i) => i !== index),
      },
    });
  };

  const handleAddAccord = (value: string) => {
    if (!value.trim()) return;
    setFormData({
      ...formData,
      accords: [...formData.accords, value.trim()],
    });
    setAccordsInput('');
  };

  const handleRemoveAccord = (index: number) => {
    setFormData({
      ...formData,
      accords: formData.accords. filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    setLoading(true);
    
    const result = await updatePerfumeEnrichment(perfume._id, formData);
    
    if (result.success) {
      alert('✅ Perfume enriched successfully!');
      router.push('/admin/enrichment');
    } else {
      alert('❌ Error: ' + result.error);
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!confirm('Mark this perfume as complete?  This will remove it from the enrichment queue.')) return;
    
    setLoading(true);
    const result = await markAsComplete(perfume._id, 'perfume');
    
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
          <h1 className="text-3xl font-bold text-gray-900">Enrich Perfume</h1>
          <p className="text-gray-600">{perfume.name} by {perfume.brand_name}</p>
        </div>
      </div>

      {/* Missing Fields Alert */}
      {perfume.missing_fields.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Upload className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Missing Fields</p>
              <p className="text-sm text-orange-700 mt-1">
                {perfume.missing_fields.join(', ')}
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Perfume Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ... formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Concentration
                  </label>
                  <select
                    value={formData. concentration}
                    onChange={(e) => setFormData({ ...formData, concentration: e.target. value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Eau de Parfum">Eau de Parfum</option>
                    <option value="Eau de Toilette">Eau de Toilette</option>
                    <option value="Eau de Cologne">Eau de Cologne</option>
                    <option value="Parfum">Parfum</option>
                    <option value="Extrait de Parfum">Extrait de Parfum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Launch Year
                  </label>
                  <input
                    type="number"
                    value={formData.launch_year || ''}
                    onChange={(e) => setFormData({ ...formData, launch_year: parseInt(e.target.value) || null })}
                    placeholder="YYYY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perfumer
                </label>
                <input
                  type="text"
                  value={formData.perfumer}
                  onChange={(e) => setFormData({ ...formData, perfumer: e.target.value })}
                  placeholder="Enter perfumer name"
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
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter perfume description..."
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notes Pyramid</h2>
            
            {/* Top Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Top Notes
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={topNotesInput}
                  onChange={(e) => setTopNotesInput(e. target.value)}
                  onKeyPress={(e) => e. key === 'Enter' && handleAddNote('top', topNotesInput)}
                  placeholder="Add a note and press Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleAddNote('top', topNotesInput)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.notes.top.map((note, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {note}
                    <button
                      onClick={() => handleRemoveNote('top', index)}
                      className="hover:text-green-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Middle Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Middle Notes
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={middleNotesInput}
                  onChange={(e) => setMiddleNotesInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNote('middle', middleNotesInput)}
                  placeholder="Add a note and press Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleAddNote('middle', middleNotesInput)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.notes. middle.map((note, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {note}
                    <button
                      onClick={() => handleRemoveNote('middle', index)}
                      className="hover:text-purple-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Base Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Notes
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={baseNotesInput}
                  onChange={(e) => setBaseNotesInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNote('base', baseNotesInput)}
                  placeholder="Add a note and press Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleAddNote('base', baseNotesInput)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.notes.base.map((note, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                  >
                    {note}
                    <button
                      onClick={() => handleRemoveNote('base', index)}
                      className="hover:text-orange-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Accords */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Accords</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={accordsInput}
                onChange={(e) => setAccordsInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddAccord(accordsInput)}
                placeholder="Add an accord and press Enter"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={() => handleAddAccord(accordsInput)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.accords. map((accord, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {accord}
                  <button
                    onClick={() => handleRemoveAccord(index)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Perfume Image</h3>
            <ImageUploadComponent
              currentImage={formData.image}
              onImageUpload={handleImageUpload}
              label="Upload Perfume Image"
            />
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
            
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white font-medium rounded-lg hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="font-medium text-gray-900 capitalize">{perfume.enrichment_status}</p>
              </div>
              <div>
                <p className="text-gray-500">Missing Fields</p>
                <p className="font-medium text-gray-900">
                  {perfume.missing_fields.length === 0 ? 'None' : perfume.missing_fields. length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}