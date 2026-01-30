'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Trash2, Check, X } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

interface Props {
  initialNotifications: Notification[];
}

export default function NotificationsClient({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [marking, setMarking] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setMarking(true);
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setMarking(false);
    }
  };

  const clearAll = async () => {
    if (! confirm('Clear all notifications?  This cannot be undone.')) return;
    
    setClearing(true);
    try {
      await fetch('/api/notifications/clear', { method: 'DELETE' });
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    } finally {
      setClearing(false);
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
        alert(action === 'approve' ? 'Follow request approved!' : 'Follow request rejected');
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

  const getBadgeColor = (type: string) => {
    if (type.includes('APPROVED')) return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
    if (type.includes('REJECTED')) return 'bg-red-50 text-red-800 border border-red-200';
    if (type.includes('SYSTEM')) return 'bg-amber-50 text-amber-800 border border-amber-200';
    return 'bg-[#F9F7F5] text-[#4A4946] border border-[#E2E1E1]';
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return then.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="relative overflow-hidden py-4 mb-6 min-h-[50vh] bg-[#F8F7F4]">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header card - white, rounded, warm theme */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-[#E2E1E1]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#211F1C] rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-[var(--font-hedvig)] text-[#211F1C]">
                  Notifications
                </h1>
                <p className="text-sm font-[var(--font-inter)] text-[#4A4946]">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>

            {/* Actions - dark brown primary, outline secondary */}
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                disabled={marking || unreadCount === 0}
                className="px-4 py-2.5 bg-[#211F1C] text-white rounded-xl hover:bg-[#211F1C]/90 transition-colors text-sm font-[var(--font-inter)] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {marking ? 'Marking...' : 'Mark all read'}
              </button>
              <button
                onClick={clearAll}
                disabled={clearing || notifications.length === 0}
                className="px-4 py-2.5 bg-white text-[#211F1C] border border-[#E2E1E1] rounded-xl hover:bg-[#F9F7F5] transition-colors text-sm font-[var(--font-inter)] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {clearing ? 'Clearing...' : 'Clear all'}
              </button>
            </div>
          </div>

          {/* Filter Tabs - selected: dark bg + white text (like "All" in image) */}
          <div className="flex items-center gap-2 mt-6">
            {(['all', 'unread', 'read'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-[var(--font-inter)] font-medium transition-colors capitalize ${
                  filter === tab
                    ? 'bg-[#211F1C] text-white shadow-sm'
                    : 'bg-[#F9F7F5] text-[#4A4946] border border-[#E2E1E1] hover:bg-[#E2E1E1]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List - white cards */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#E2E1E1]">
              <Bell className="w-16 h-16 text-[#C4C4C3] mx-auto mb-4" />
              <p className="font-[var(--font-inter)] text-[#4A4946] font-medium">
                {filter === 'unread' && 'No unread notifications'}
                {filter === 'read' && 'No read notifications'}
                {filter === 'all' && 'No notifications yet'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => {
              const isFollowRequest = notification.type === 'FOLLOW_REQUEST';
              const followId = isFollowRequest ? extractFollowId(notification.link) : null;
              const isActioning = actioningId === notification.id;

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border ${
                    !notification.read ? 'border-2 border-amber-200/80' : 'border-[#E2E1E1]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#F9F7F5] border border-[#E2E1E1] rounded-lg flex items-center justify-center text-2xl shrink-0">
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link
                          href={notification.link}
                          onClick={() => markAsRead(notification.id)}
                          className="font-[var(--font-inter)] font-medium flex-1 text-[#211F1C] hover:text-amber-800 transition-colors"
                        >
                          {notification.message}
                        </Link>
                        <span className={`text-xs px-2 py-1 rounded-full font-[var(--font-inter)] font-medium ${getBadgeColor(notification.type)}`}>
                          {notification.type.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <p className="text-sm font-[var(--font-inter)] text-[#4A4946] mb-2">
                        {formatTime(notification.createdAt)}
                      </p>

                      {isFollowRequest && followId && (
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleFollowRequest(notification.id, followId, 'approve')}
                            disabled={isActioning}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#211F1C] text-white rounded-xl hover:bg-[#211F1C]/90 transition-colors text-sm font-[var(--font-inter)] font-medium disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            Approve Request
                          </button>
                          <button
                            onClick={() => handleFollowRequest(notification.id, followId, 'reject')}
                            disabled={isActioning}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#211F1C] border border-[#E2E1E1] rounded-xl hover:bg-[#F9F7F5] transition-colors text-sm font-[var(--font-inter)] font-medium disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            Reject Request
                          </button>
                        </div>
                      )}

                      {!notification.read && (
                        <span className="inline-block mt-2 text-xs font-[var(--font-inter)] font-medium text-amber-800">
                          • Unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}