'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Building2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Application {
  id: string;
  brandName: string;
  companyName: string;
  country: string;
  contactName: string;
  contactEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
}

interface Props {
  applications: Application[];
}

export default function BrandApplicationsList({ applications }: Props) {
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const filteredApplications = applications.filter((app) => {
    if (filter !== 'all' && app.status !== filter) return false;
    return true;
  });

  const statusCounts = {
    PENDING: applications.filter((a) => a.status === 'PENDING').length,
    APPROVED: applications.filter((a) => a.status === 'APPROVED').length,
    REJECTED: applications.filter((a) => a.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-[var(--font-inter)] font-medium text-[#4A4946]">Status:</span>
          <div className="flex gap-2 max-md:flex-col">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-[var(--font-inter)] font-medium transition-all ${
                filter === 'all'
                  ? 'bg-[#211F1C] text-white shadow-sm'
                  : 'bg-[#F9F7F5] text-[#4A4946] hover:bg-[#E2E1E1] border border-[#E2E1E1]'
              }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-xl text-sm font-[var(--font-inter)] font-medium transition-all ${
                filter === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1.5" />
              Pending ({statusCounts.PENDING})
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-4 py-2 rounded-xl text-sm font-[var(--font-inter)] font-medium transition-all ${
                filter === 'APPROVED'
                  ? 'bg-lime-700 text-white shadow-sm'
                  : 'bg-lime-50 text-lime-800 hover:bg-lime-100 border border-lime-200'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-1.5" />
              Approved ({statusCounts.APPROVED})
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`px-4 py-2 rounded-xl text-sm font-[var(--font-inter)] font-medium transition-all ${
                filter === 'REJECTED'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <XCircle className="w-4 h-4 inline mr-1.5" />
              Rejected ({statusCounts.REJECTED})
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] overflow-hidden shadow-sm">
        {filteredApplications.length === 0 ? (
          <div className="p-16 text-center">
            <Building2 className="w-20 h-20 mx-auto mb-5 text-[#C4C4C3]" />
            <p className="font-hedvig text-xl text-[#211F1C] mb-2">No applications found</p>
            <p className="font-[var(--font-inter)] text-sm text-[#4A4946]">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9F7F5] border-b border-[#E2E1E1]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-[var(--font-inter)] font-semibold text-[#4A4946] uppercase tracking-wider">
                    Brand Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-[var(--font-inter)] font-semibold text-[#4A4946] uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-[var(--font-inter)] font-semibold text-[#4A4946] uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-[var(--font-inter)] font-semibold text-[#4A4946] uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-[var(--font-inter)] font-semibold text-[#4A4946] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-[var(--font-inter)] font-semibold text-[#4A4946] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-[var(--font-inter)] font-semibold text-[#4A4946] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E1E1]">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-[#F9F7F5]/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-amber-800" />
                        <span className="text-sm font-[var(--font-inter)] font-semibold text-[#211F1C]">
                          {application.brandName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-[var(--font-inter)] text-[#211F1C]">
                      {application.companyName}
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-sm font-[var(--font-inter)] font-medium text-[#211F1C]">
                          {application.contactName}
                        </p>
                        <p className="text-xs font-[var(--font-inter)] text-[#737270] mt-0.5">{application.contactEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-[var(--font-inter)] text-[#211F1C]">
                      {application.country}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-[var(--font-inter)] text-[#4A4946]">
                      {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-[var(--font-inter)] font-medium ${
                          application.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : application.status === 'APPROVED'
                            ? 'bg-lime-100 text-lime-800 border border-lime-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-[var(--font-inter)] font-medium">
                      <Link
                        href={`/admin/brand-applications/${application.id}`}
                        className="inline-flex items-center gap-1.5 text-amber-800 hover:text-amber-900 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}