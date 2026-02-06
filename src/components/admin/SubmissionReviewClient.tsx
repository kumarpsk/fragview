'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { approveSubmission, rejectSubmission } from '@/app/actions/admin/submissions';
import { Package, Building2, User, Calendar, CheckCircle, XCircle, Loader2, ArrowLeft, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Submission {
  id: string;
  type: 'PERFUME' | 'BRAND';
  status: string;
  data: any;
  createdAt: Date;
  adminNotes?: string | null;
  user: {
    username: string;
    email: string;
    image: string | null;
  };
}

interface Props {
  submission: Submission;
}

export default function SubmissionReviewClient({ submission }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(submission.adminNotes || '');
  const [editedData, setEditedData] = useState(submission.data);

  // ✅ Duplicate check state
  const [checkingDuplicate, setCheckingDuplicate] = useState(true);
  const [duplicateCheck, setDuplicateCheck] = useState<any>(null);

  // ✅ Check for duplicates when component loads
  useEffect(() => {
    async function checkDuplicate() {
      try {
        const response = await fetch('/api/check-duplicate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: submission.type.toLowerCase(),
            name: submission.data.name || submission.data.brandName,
            brandName: submission.data.brand,
          }),
        });

        const result = await response.json();
        setDuplicateCheck(result);
      } catch (error) {
        console.error('Failed to check duplicate:', error);
      } finally {
        setCheckingDuplicate(false);
      }
    }

    checkDuplicate();
  }, [submission]);

  const handleApprove = async () => {
    // ✅ Block approval if duplicate exists
    if (duplicateCheck?.exists) {
      alert('❌ Cannot approve!  This ' + submission.type.toLowerCase() + ' already exists in the database. Please reject this submission.');
      return;
    }

    if (! confirm('Are you sure you want to approve this submission?')) return;
    
    setLoading(true);
    const result = await approveSubmission(submission.id, editedData, notes);
    
    if (result.success) {
      alert('✅ Submission approved successfully!');
      router.push('/admin/submissions');
    } else {
      alert('❌ Error: ' + result.error);
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    setLoading(true);
    const result = await rejectSubmission(submission.id, reason);
    
    if (result.success) {
      alert('✅ Submission rejected');
      router.push('/admin/submissions');
    } else {
      alert('❌ Error: ' + result.error);
      setLoading(false);
    }
  };

  const isAlreadyProcessed = submission.status !== 'PENDING';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/submissions"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            submission.type === 'PERFUME' ? 'bg-purple-100' : 'bg-blue-100'
          }`}>
            {submission.type === 'PERFUME' ? (
              <Package className="w-6 h-6 text-purple-600" />
            ) : (
              <Building2 className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Review {submission.type} Submission
            </h1>
            <p className="text-gray-600">
              Submitted {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      {isAlreadyProcessed && (
        <div className={`p-4 rounded-xl border-2 ${
          submission.status === 'APPROVED'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`font-medium ${
            submission.status === 'APPROVED' ? 'text-green-900' : 'text-red-900'
          }`}>
            ✓ This submission has already been {submission.status.toLowerCase()}
          </p>
        </div>
      )}

      {/* ✅ DUPLICATE CHECK - Exact Match Warning */}
      {! checkingDuplicate && duplicateCheck?.exists && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-red-900 text-2xl mb-2">⚠️ DUPLICATE DETECTED! </p>
              <p className="text-sm text-red-700 mb-3">
                This {submission.type.toLowerCase()} already exists in the database:
              </p>
              <div className="mt-3 p-4 bg-red-100 rounded-lg border-2 border-red-300">
                <p className="font-bold text-red-900 text-lg">
                  {duplicateCheck.perfume?.name || duplicateCheck.brand?.name}
                  {duplicateCheck.perfume?.brand_name && ` by ${duplicateCheck.perfume.brand_name}`}
                </p>
                <Link
                  href={`/${submission.type.toLowerCase()}s/${duplicateCheck.perfume?._id || duplicateCheck.brand?._id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                >
                  View Existing Entry
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
              <div className="mt-4 p-3 bg-red-200 border-2 border-red-400 rounded-lg">
                <p className="text-red-900 font-bold text-center">
                  ❌ DO NOT APPROVE - This will create a duplicate entry!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ DUPLICATE CHECK - Similar Items Warning */}
      {!checkingDuplicate && ! duplicateCheck?.exists && duplicateCheck?.similar?.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-yellow-900 text-lg">⚠️ Similar entries found</p>
              <p className="text-sm text-yellow-700 mt-1 mb-3">
                Please verify these are not duplicates before approving:
              </p>
              <ul className="space-y-2">
                {duplicateCheck.similar.map((item: any) => (
                  <li key={item._id} className="flex items-center gap-2">
                    <span className="text-yellow-700">•</span>
                    <Link
                      href={`/${submission.type.toLowerCase()}s/${item._id}`}
                      target="_blank"
                      className="text-sm text-yellow-700 hover:text-yellow-900 underline font-medium inline-flex items-center gap-1"
                    >
                      {item.name} {item.brand_name && `by ${item.brand_name}`}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-yellow-600 mt-3 font-medium">
                ⚠️ If none of these match exactly, you can proceed with approval. 
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Checking Duplicate Loading State */}
      {checkingDuplicate && (
        <div className="flex items-center gap-2 text-sm text-gray-600 p-4 bg-gray-50 rounded-xl">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Checking for duplicates in database...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Submission Details</h2>
            
            <div className="space-y-4">
              {submission.type === 'PERFUME' ?  (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Perfume Name
                    </label>
                    <input
                      type="text"
                      value={editedData.name || ''}
                      onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={isAlreadyProcessed}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={editedData.brand || ''}
                      onChange={(e) => setEditedData({ ...editedData, brand: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={isAlreadyProcessed}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <input
                        type="text"
                        value={editedData.gender || ''}
                        onChange={(e) => setEditedData({ ...editedData, gender: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={isAlreadyProcessed}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Concentration
                      </label>
                      <input
                        type="text"
                        value={editedData.concentration || ''}
                        onChange={(e) => setEditedData({ ...editedData, concentration: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={isAlreadyProcessed}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editedData.description || ''}
                      onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={isAlreadyProcessed}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={editedData.brandName || editedData.name || ''}
                      onChange={(e) => setEditedData({ ...editedData, brandName: e.target.value, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={isAlreadyProcessed}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editedData.country || ''}
                      onChange={(e) => setEditedData({ ...editedData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={isAlreadyProcessed}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editedData.description || ''}
                      onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={isAlreadyProcessed}
                    />
                  </div>
                </>
              )}

              {/* Submitter Notes */}
              {editedData.notes && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Submitter Notes:</p>
                  <p className="text-sm text-gray-600">{editedData.notes}</p>
                </div>
              )}

              {/* Reference Link */}
              {editedData.link && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Reference Link:</p>
                  <a 
                    href={editedData.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
                  >
                    {editedData.link}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Notes (Internal)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for other admins (optional)..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isAlreadyProcessed}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Submitter Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Submitted By</h3>
            <div className="flex items-center gap-3 mb-4">
              {submission.user.image ?  (
                <img
                  src={submission.user.image}
                  alt={submission.user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-orange-400 flex items-center justify-center text-white font-bold">
                  {submission.user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{submission.user.username}</p>
                <p className="text-sm text-gray-500">{submission.user.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {! isAlreadyProcessed && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
              
              <button
                onClick={handleApprove}
                disabled={loading || checkingDuplicate || duplicateCheck?.exists}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white font-medium rounded-lg hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ?  (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Approve & Add to Database
                  </>
                )}
              </button>

              {duplicateCheck?.exists && (
                <p className="text-xs text-red-600 text-center font-medium">
                  ⚠️ Cannot approve - duplicate detected
                </p>
              )}

              <button
                onClick={handleReject}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                Reject Submission
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}