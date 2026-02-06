'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveBrandApplication, rejectBrandApplication } from '@/app/actions/admin/brand-applications';
import { Building2, Mail, Phone, Globe, CheckCircle, XCircle, Loader2, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Application {
  id: string;
  brandName: string;
  companyName: string;
  country: string;
  website: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  position: string | null;
  brandData: any;
  perfumesData: any;
  verificationDocs: string[];
  status: string;
  adminNotes: string | null;
  createdAt: Date;
}

interface Props {
  application: Application;
}

export default function BrandApplicationReviewClient({ application }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(application.adminNotes || '');

  const handleApprove = async () => {
    if (! confirm('Are you sure you want to approve this brand application?  This will create the brand and perfumes in the database.')) return;
    
    setLoading(true);
    const result = await approveBrandApplication(application.id, notes);
    
    if (result. success) {
      alert('✅ Brand application approved!  Brand and perfumes have been created.');
      router.push('/admin/brand-applications');
    } else {
      alert('❌ Error: ' + result.error);
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    setLoading(true);
    const result = await rejectBrandApplication(application.id, reason);
    
    if (result. success) {
      alert('✅ Brand application rejected');
      router.push('/admin/brand-applications');
    } else {
      alert('❌ Error: ' + result.error);
      setLoading(false);
    }
  };

  const isAlreadyProcessed = application.status !== 'PENDING';
  const brandData = application.brandData as any;
  const perfumesData = application.perfumesData as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/brand-applications"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Review Brand Application
            </h1>
            <p className="text-gray-600">
              Submitted {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      {isAlreadyProcessed && (
        <div className={`p-4 rounded-xl border-2 ${
          application. status === 'APPROVED'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`font-medium ${
            application.status === 'APPROVED' ? 'text-green-900' : 'text-red-900'
          }`}>
            ✓ This application has already been {application.status.toLowerCase()}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Brand Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name
                  </label>
                  <p className="text-gray-900 font-semibold">{application.brandName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Company
                  </label>
                  <p className="text-gray-900">{application.companyName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <p className="text-gray-900">{application.country}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  {application.website ? (
                    <a
                      href={application.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                    </a>
                  ) : (
                    <p className="text-gray-500">Not provided</p>
                  )}
                </div>
              </div>

              {brandData?. description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Description
                  </label>
                  <p className="text-gray-600 text-sm leading-relaxed">{brandData. description}</p>
                </div>
              )}

              {brandData?.foundedYear && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Founded Year
                  </label>
                  <p className="text-gray-900">{brandData.foundedYear}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <p className="text-gray-900">{application.contactName}</p>
                </div>

                {application.position && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <p className="text-gray-900">{application.position}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <a
                  href={`mailto:${application.contactEmail}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {application.contactEmail}
                </a>
              </div>

              {application.contactPhone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone
                  </label>
                  <p className="text-gray-900">{application.contactPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Perfumes Data */}
          {Array.isArray(perfumesData) && perfumesData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Perfumes Data ({perfumesData.length} perfumes)
              </h2>
              
              <div className="space-y-3">
                {perfumesData.slice(0, 5).map((perfume: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{perfume.name}</p>
                    {perfume.description && (
                      <p className="text-sm text-gray-600 mt-1">{perfume.description}</p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      {perfume.gender && <span>• {perfume.gender}</span>}
                      {perfume. concentration && <span>• {perfume.concentration}</span>}
                      {perfume.launchYear && <span>• {perfume.launchYear}</span>}
                    </div>
                  </div>
                ))}
                {perfumesData.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    + {perfumesData.length - 5} more perfumes
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Verification Documents */}
          {application.verificationDocs. length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Verification Documents</h2>
              
              <div className="space-y-2">
                {application.verificationDocs.map((doc, index) => (
                  <a
                    key={index}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-900">Document {index + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Notes (Internal)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for other admins (optional)..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isAlreadyProcessed}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Application Summary</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  application.status === 'PENDING'
                    ? 'bg-orange-100 text-orange-800'
                    : application.status === 'APPROVED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {application.status}
                </span>
              </div>
              <div>
                <p className="text-gray-500">Brand Name</p>
                <p className="font-medium text-gray-900">{application. brandName}</p>
              </div>
              <div>
                <p className="text-gray-500">Country</p>
                <p className="font-medium text-gray-900">{application.country}</p>
              </div>
              <div>
                <p className="text-gray-500">Perfumes Count</p>
                <p className="font-medium text-gray-900">
                  {Array.isArray(perfumesData) ?  perfumesData.length : 0}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Submitted</p>
                <p className="font-medium text-gray-900">
                  {formatDistanceToNow(new Date(application. createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {! isAlreadyProcessed && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
              
              <button
                onClick={handleApprove}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ?  (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Approve & Create Brand
                  </>
                )}
              </button>

              <button
                onClick={handleReject}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                Reject Application
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}