'use client';

import React, { useState } from 'react';
import { Settings, Shield, Bell, User, Leaf, Flower2, Save, Loader2 } from 'lucide-react';

interface User {
  username: string;
  email: string;
  image: string | null;
  bio: string | null;
  location: string | null;
  isWardrobePublic: boolean;
  isActivityPublic: boolean;
  emailNotifWeeklyDigest: boolean;
  unsubscribedFromAll: boolean;
}

interface Props {
  user: User;
}

export default function SettingsClient({ user }: Props) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'notifications' | 'password'>('privacy');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Privacy states
  const [isWardrobePublic, setIsWardrobePublic] = useState(user.isWardrobePublic);
  const [isActivityPublic, setIsActivityPublic] = useState(user. isActivityPublic);

  // Email notification states (simplified)
  const [emailNotifWeeklyDigest, setEmailNotifWeeklyDigest] = useState(user.emailNotifWeeklyDigest);
  const [unsubscribedFromAll, setUnsubscribedFromAll] = useState(user. unsubscribedFromAll);

  const handleSavePrivacy = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isWardrobePublic,
          isActivityPublic,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Privacy settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifWeeklyDigest,
          unsubscribedFromAll,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data. error || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className=" bg-[#FAFFF5] py-4 px-4 mb-6">
      {/* Floating Botanical Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-32 right-20 animate-float">
          <Leaf size={20} className="text-green-300/20" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float animate-delay-3">
          <Flower2 size={18} className="text-orange-300/20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-orange-400 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-sm text-gray-600">Manage your account preferences</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card rounded-2xl mb-4 overflow-hidden">
          <div className="flex border-b border-green-100">
            <button
              onClick={() => {
                setActiveTab('privacy');
                setMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'privacy'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="hidden sm:inline">Privacy</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('notifications');
                setMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="hidden sm:inline">Notifications</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('password');
                setMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'password'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Password</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="glass-card rounded-2xl p-6">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Privacy Settings</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Control who can see your profile information
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 pr-4">
                    <p className="font-medium text-gray-900">Public Wardrobe</p>
                    <p className="text-sm text-gray-600">Allow others to view your perfume collection</p>
                  </div>
                  <button
                    onClick={() => setIsWardrobePublic(!isWardrobePublic)}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      isWardrobePublic ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={isWardrobePublic}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isWardrobePublic ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 pr-4">
                    <p className="font-medium text-gray-900">Public Activity</p>
                    <p className="text-sm text-gray-600">Show your reviews and ratings on your profile</p>
                  </div>
                  <button
                    onClick={() => setIsActivityPublic(!isActivityPublic)}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      isActivityPublic ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={isActivityPublic}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isActivityPublic ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSavePrivacy}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ?  (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Privacy Settings
                  </>
                )}
              </button>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Email Notifications</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Manage your email preferences.  All activity notifications appear in-app only.
                </p>
              </div>

              {/* Unsubscribe from All */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-red-900">Unsubscribe from All Emails</p>
                    <p className="text-sm text-red-700">
                      You will only receive critical account security emails
                    </p>
                  </div>
                  <button
                    onClick={() => setUnsubscribedFromAll(!unsubscribedFromAll)}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                      unsubscribedFromAll ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={unsubscribedFromAll}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        unsubscribedFromAll ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {! unsubscribedFromAll && (
                <>
                  {/* Weekly Digest Toggle */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <p className="font-medium text-gray-900">Weekly Digest</p>
                        <p className="text-sm text-gray-600">
                          Receive a weekly summary of activity and highlights (sent every Monday)
                        </p>
                      </div>
                      <button
                        onClick={() => setEmailNotifWeeklyDigest(!emailNotifWeeklyDigest)}
                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                          emailNotifWeeklyDigest ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={emailNotifWeeklyDigest}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            emailNotifWeeklyDigest ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium mb-2">
                      ℹ️ About Notifications
                    </p>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      All activity notifications (new followers, helpful votes, mentions, thread activity) appear in your notification center (bell icon) only. 
                      Email notifications are limited to:
                    </p>
                    <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                      <li>Welcome email (on signup)</li>
                      <li>Email verification</li>
                      <li>Password reset</li>
                      <li>Weekly digest (if enabled above)</li>
                    </ul>
                  </div>
                </>
              )}

              <button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Notification Preferences
                  </>
                )}
              </button>
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Change Password</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Update your password to keep your account secure
                </p>
              </div>

              <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-yellow-800 font-medium">🚧 Password Change Coming Soon</p>
                <p className="text-sm text-yellow-700 mt-2">
                  This feature will be available in the next update. 
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}