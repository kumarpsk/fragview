'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Loader2, Check, X } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

interface Props {
  onClose: () => void;
  onCountChange: (count: number) => void;
}

export default function NotificationDropdown({ onClose, onCountChange }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null); // ✅ NEW

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications?.slice(0, 10) || []);
      onCountChange(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ?  { ...n, read: true } : n))
      );
      
      const unreadCount = notifications.filter(n => !n.read && n.id !== notificationId).length;
      onCountChange(unreadCount);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setMarking(true);
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onCountChange(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setMarking(false);
    }
  };

  // ✅ NEW: Handle follow request approve/reject
  const handleFollowRequest = async (notificationId: string, followId: string, action: 'approve' | 'reject') => {
    setActioningId(notificationId);
    try {
      const response = await fetch('/api/follow/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followId, action }),
      });

      if (response.ok) {
        // Remove notification from list after action
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        const unreadCount = notifications.filter(n => !n.read && n.id !== notificationId).length;
        onCountChange(unreadCount);
      } else {
        alert('Failed to process request');
      }
    } catch (error) {
      console.error('Error processing follow request:', error);
      alert('Network error');
    } finally {
      setActioningId(null);
    }
  };

  // ✅ NEW: Extract followId from notification link
  const extractFollowId = (link: string): string | null => {
    // Example link: /u/username? followId=abc123
    const match = link.match(/followId=([^&]+)/);
    return match ? match[1] : null;
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      NEW_FOLLOWER: '👤',
      FOLLOW_REQUEST: '🤝',       
      FOLLOW_APPROVED: '✅',        
      BRAND_NEW_RELEASE: '🎉',     
      REVIEW_HELPFUL: '👍',
      REVIEW_LIKE: '❤️',
      REVIEW_REPLY: '💬',
      THREAD_ACTIVITY: '🔔',
      SUBMISSION_APPROVED: '✅',
      SUBMISSION_REJECTED: '❌',
      SYSTEM_ANNOUNCEMENT: '📢',
    };
    return icons[type] || '🔔';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-gray-900">Notifications</h3>
          </div>
          <button
            onClick={markAllAsRead}
            disabled={marking || notifications.every(n => n.read)}
            className="text-xs text-gray-600 hover:text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {marking ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Marking... 
              </>
            ) : (
              <>
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map((notif) => {
            // ✅ Check if this is a follow request notification
            const isFollowRequest = notif.type === 'FOLLOW_REQUEST';
            const followId = isFollowRequest ? extractFollowId(notif.link) : null;
            const isActioning = actioningId === notif.id;

            return (
              <div
                key={notif.id}
                className={`p-4 border-b border-gray-100 hover:bg-green-50/30 transition-colors ${
                  ! notif.read ? 'bg-green-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={notif.link}
                      onClick={() => {
                        markAsRead(notif.id);
                        onClose();
                      }}
                      className="text-sm text-gray-900 hover:text-green-600 block mb-1"
                    >
                      {notif.message}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {formatTime(notif.createdAt)}
                    </p>

                    {/* ✅ NEW: Show approve/reject buttons for follow requests */}
                    {isFollowRequest && followId && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleFollowRequest(notif.id, followId, 'approve')}
                          disabled={isActioning}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleFollowRequest(notif.id, followId, 'reject')}
                          disabled={isActioning}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                  {! notif.read && (
                    <div className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-1" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gradient-to-r from-green-50 to-orange-50">
        <Link
          href="/notifications"
          onClick={onClose}
          className="block text-center text-sm font-medium text-green-600 hover:text-green-700"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}