'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Ban, User } from 'lucide-react';
import Link from 'next/link';

interface FlaggedReview {
  id: string;
  userId: string;
  perfumeId: string;
  rating: number;
  text: string;
  flaggedCount: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    image?: string | null;
    role: string;
  };
}

export default function ModerationQueueClient() {
  const [reviews, setReviews] = useState<FlaggedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchFlaggedReviews();
  }, []);

  const fetchFlaggedReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/moderation');
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching flagged reviews:', error);
      alert('Failed to load flagged reviews');
    }
    setLoading(false);
  };

  const handleApprove = async (reviewId: string) => {
    if (!confirm('Are you sure you want to approve this review and remove all flags?')) return;

    setActioningId(reviewId);
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId })
      });

      if (res.ok) {
        alert('Review approved! ');
        fetchFlaggedReviews();
      } else {
        alert('Failed to approve review');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Error approving review');
    } finally {
      setActioningId(null);
    }
  };

  const handleRemove = async (reviewId: string) => {
    if (!confirm('Are you sure you want to REMOVE this review?  This will soft-delete it.')) return;

    setActioningId(reviewId);
    try {
      const res = await fetch(`/api/admin/moderation? reviewId=${reviewId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Review removed! ');
        fetchFlaggedReviews();
      } else {
        alert('Failed to remove review');
      }
    } catch (error) {
      console.error('Error removing review:', error);
      alert('Error removing review');
    } finally {
      setActioningId(null);
    }
  };

  const handleBanUser = async (userId: string, username: string) => {
    const reason = prompt(
      `⚠️ WARNING: This will permanently BAN user "${username}" and remove ALL their content.\n\nEnter reason for ban:`
    );
    
    if (!reason) return;

    if (!confirm(`FINAL CONFIRMATION: Ban user "${username}" permanently?`)) return;

    setActioningId(userId);
    try {
      const res = await fetch('/api/admin/moderation/ban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason })
      });

      if (res.ok) {
        alert(`User "${username}" has been banned successfully. `);
        fetchFlaggedReviews();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to ban user');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Error banning user');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {loading ?  (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          <p className="ml-4 font-[var(--font-inter)] text-[#4A4946]">Loading flagged reviews... </p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] p-12 text-center shadow-sm">
          <CheckCircle className="w-16 h-16 text-lime-700 mx-auto mb-4" />
          <h3 className="text-2xl font-hedvig text-[#211F1C] mb-2">All clear</h3>
          <p className="font-[var(--font-inter)] text-[#4A4946]">
            There are no flagged reviews to moderate at this time.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-hedvig text-[#211F1C]">
                  {reviews.length} Flagged Review{reviews.length !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm font-[var(--font-inter)] text-[#4A4946]">Pending moderation review</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] p-6 hover:shadow-md transition-shadow"
              >
                {/* Header: User Info & Flag Count */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <Link href={`/u/${review.user.username}`}>
                      {review.user.image ? (
                        <img
                          src={review.user.image}
                          alt={review.user.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#E2E1E1]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C4A484] to-[#211F1C] flex items-center justify-center">
                          <span className="text-xl font-[var(--font-inter)] font-bold text-white">
                            {review.user.username[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* User Details */}
                    <div>
                      <Link 
                        href={`/u/${review.user.username}`}
                        className="font-[var(--font-inter)] font-semibold text-[#211F1C] hover:text-amber-800"
                      >
                        @{review.user.username}
                      </Link>
                      <p className="text-sm font-[var(--font-inter)] text-[#4A4946]">{review.user.email}</p>
                      <p className="text-xs font-[var(--font-inter)] text-[#737270] mt-1">
                        Posted {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Flag Badge */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-sm font-[var(--font-inter)] font-semibold">
                      <AlertTriangle className="w-4 h-4" />
                      {review.flaggedCount} Report{review.flaggedCount !== 1 ? 's' : ''}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-[var(--font-inter)] font-medium ${
                        review.user.role === 'ADMIN'
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : review.user.role === 'MODERATOR'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-[#F9F7F5] text-[#4A4946] border border-[#E2E1E1]'
                      }`}
                    >
                      {review.user.role}
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                <div className="bg-[#F9F7F5] rounded-2xl p-4 mb-4 border border-[#E2E1E1]">
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-[var(--font-inter)] font-medium text-[#4A4946]">Rating</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < review.rating ? 'text-amber-500' : 'text-[#E2E1E1]'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="font-[var(--font-inter)] text-[#211F1C] whitespace-pre-wrap leading-relaxed">
                    {review.text}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleApprove(review.id)}
                    disabled={actioningId === review.id}
                    className="flex items-center gap-2 px-4 py-2 bg-lime-700 text-white rounded-xl hover:bg-lime-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-[var(--font-inter)] font-medium shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {actioningId === review.id ?  'Processing...' : 'Approve (Remove Flag)'}
                  </button>

                  <button
                    onClick={() => handleRemove(review.id)}
                    disabled={actioningId === review.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-[var(--font-inter)] font-medium shadow-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    {actioningId === review.id ?  'Processing...' : 'Remove Review'}
                  </button>

                  <div className="h-6 w-px bg-[#E2E1E1]"></div>

                  <button
                    onClick={() => handleBanUser(review.user.id, review.user.username)}
                    disabled={actioningId === review.user.id || review.user.role === 'ADMIN'}
                    className="flex items-center gap-2 px-4 py-2 bg-[#211F1C] text-white rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-[var(--font-inter)] font-medium shadow-sm"
                    title={review.user.role === 'ADMIN' ? 'Cannot ban admin users' : 'Permanently ban this user'}
                  >
                    <Ban className="w-4 h-4" />
                    {actioningId === review.user.id ?  'Banning...' : 'Ban User'}
                  </button>

                  <Link
                    href={`/u/${review.user.username}`}
                    className="flex items-center gap-2 px-4 py-2 border border-[#E2E1E1] text-[#211F1C] rounded-xl hover:bg-[#F9F7F5] transition-colors text-sm font-[var(--font-inter)] font-medium ml-auto"
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}