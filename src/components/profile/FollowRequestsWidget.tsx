'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface FollowRequest {
  id: string;
  createdAt: string;
  follower: {
    id: string;
    username: string;
    image?: string;
    bio?: string;
    experiencePoints: number;
  };
}

export default function FollowRequestsWidget() {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/follow/request');
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching follow requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (followId: string, action: 'approve' | 'reject') => {
    setActioningId(followId);
    try {
      const res = await fetch('/api/follow/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followId, action })
      });

      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== followId));
        alert(action === 'approve' ?  'Follow request approved!' : 'Follow request rejected');
      }
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setActioningId(null);
    }
  };

  const getLevel = (xp: number) => {
    if (xp >= 1001) return 'Master';
    if (xp >= 501) return 'Expert';
    if (xp >= 201) return 'Connoisseur';
    if (xp >= 51) return 'Enthusiast';
    return 'Novice';
  };

  if (loading) {
    return (
      <div className=" p-6 mb-8">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6  text-gray-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (requests.length === 0) return null;

  return (
    <div className=" p-6 mb-8 border-2 border-gray-200 rounded-md max-sm:p-2">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-bold text-gray-900">
          Follow Requests ({requests.length})
        </h2>
      </div>

      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-4  rounded-xl border border-gray-200 max-sm:p-2"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link href={`/u/${request.follower.username}`}>
                {request.follower.image ? (
                  <img
                    src={request.follower.image}
                    alt={request.follower.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#feebce] flex items-center justify-center text-black font-bold">
                    {request.follower.username[0].toUpperCase()}
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link 
                  href={`/u/${request.follower.username}`}
                  className="font-semibold text-gray-900 hover:text-gray-600"
                >
                  @{request.follower.username}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full font-medium">
                    {getLevel(request.follower.experiencePoints)}
                  </span>
                </div>
                {request.follower.bio && (
                  <p className="text-xs text-gray-600 mt-1 truncate">{request.follower.bio}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleAction(request.id, 'approve')}
                disabled={actioningId === request.id}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                title="Approve"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAction(request.id, 'reject')}
                disabled={actioningId === request.id}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                title="Reject"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}