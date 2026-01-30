'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Building2, AlertCircle, CheckCircle, Clock, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnrichmentItem {
  _id: string;
  name: string;
  brand?: string;
  logo?: string;
  image?: string;
  missingFields: string[];
  enrichmentStatus: string;
  addedBy: string;
  createdAt: Date;
}

interface Props {
  perfumes: EnrichmentItem[];
  brands: EnrichmentItem[];
}

export default function EnrichmentDashboard({ perfumes, brands }: Props) {
  const [activeTab, setActiveTab] = useState<'perfumes' | 'brands'>('perfumes');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress'>('pending');

  const currentItems = activeTab === 'perfumes' ? perfumes : brands;
  
  const filteredItems = currentItems.filter(item => {
    if (statusFilter === 'all') return true;
    return item.enrichmentStatus === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'in_progress':
        return 'bg-amber-50 text-amber-800 border border-amber-200';
      case 'completed':
        return 'bg-lime-100 text-lime-800 border border-lime-200';
      default:
        return 'bg-[#F9F7F5] text-[#4A4946] border border-[#E2E1E1]';
    }
  };

  const getMissingFieldBadge = (field: string) => {
    const labels: Record<string, string> = {
      image: '📷 Image',
      logo: '🏢 Logo',
      description: '📝 Description',
      top_notes: '🌸 Top Notes',
      middle_notes: '🌺 Middle Notes',
      base_notes: '🌲 Base Notes',
      accords: '🎨 Accords',
      perfumer: '👤 Perfumer',
      founded_year: '📅 Founded Year',
      website: '🌐 Website',
    };
    return labels[field] || field;
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('perfumes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-[var(--font-inter)] font-medium transition-all ${
                activeTab === 'perfumes'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-[#F9F7F5] text-[#4A4946] hover:bg-[#E2E1E1] border border-[#E2E1E1]'
              }`}
            >
              <Package className="w-4 h-4" />
              Perfumes ({perfumes.length})
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-[var(--font-inter)] font-medium transition-all ${
                activeTab === 'brands'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'bg-[#F9F7F5] text-[#4A4946] hover:bg-[#E2E1E1] border border-[#E2E1E1]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Brands ({brands.length})
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-[var(--font-inter)] font-medium text-[#4A4946]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-[#E2E1E1] rounded-xl text-sm font-[var(--font-inter)] bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-[#211F1C]"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] p-16 text-center shadow-sm">
            <CheckCircle className="w-20 h-20 mx-auto mb-5 text-lime-600" />
            <p className="font-hedvig text-xl text-[#211F1C] mb-2">All caught up!</p>
            <p className="font-[var(--font-inter)] text-sm text-[#4A4946]">
              No {activeTab} need enrichment at this time.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] p-6 hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                {/* Image/Logo */}
                {item.image || item.logo ? (
                  <img
                    src={item.image || item.logo}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-[#F9F7F5] rounded-xl flex items-center justify-center border border-[#E2E1E1]">
                    {activeTab === 'perfumes' ? (
                      <Package className="w-8 h-8 text-[#C4C4C3]" />
                    ) : (
                      <Building2 className="w-8 h-8 text-[#C4C4C3]" />
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-[var(--font-inter)] font-semibold text-[#211F1C] truncate">
                    {item.name}
                  </h3>
                  {item.brand && (
                    <p className="text-sm font-[var(--font-inter)] text-[#4A4946] truncate mt-0.5">{item.brand}</p>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-[var(--font-inter)] font-medium mt-2 ${getStatusColor(item.enrichmentStatus)}`}>
                    {item.enrichmentStatus === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {item.enrichmentStatus === 'in_progress' && <Edit className="w-3 h-3 mr-1" />}
                    {item.enrichmentStatus}
                  </span>
                </div>
              </div>

              {/* Missing Fields */}
              <div className="mb-4">
                <p className="text-xs font-[var(--font-inter)] font-medium text-[#4A4946] mb-2">Missing Fields:</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.missingFields.length === 0 ? (
                    <span className="text-xs font-[var(--font-inter)] text-[#737270] italic">None</span>
                  ) : (
                    item.missingFields.map((field) => (
                      <span
                        key={field}
                        className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-700 text-xs font-[var(--font-inter)] rounded-lg border border-red-200"
                      >
                        {getMissingFieldBadge(field)}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="mb-4 pb-4 border-b border-[#E2E1E1]">
                <p className="text-xs font-[var(--font-inter)] text-[#4A4946]">
                  Added {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
                <p className="text-xs font-[var(--font-inter)] text-[#4A4946] mt-0.5">
                  Source: <span className="font-medium text-[#211F1C]">{item.addedBy}</span>
                </p>
              </div>

              {/* Actions */}
              <Link
                href={`/admin/enrichment/${activeTab}/${item._id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-700 text-white font-[var(--font-inter)] font-medium rounded-xl hover:bg-lime-800 transition-colors shadow-sm"
              >
                <Edit className="w-4 h-4" />
                Enrich Now
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}