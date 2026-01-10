'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Calendar, Award, Edit, Settings, TrendingUp, MessageSquare, Leaf, Trees, Loader2, MapPin, CheckCircle2, Heart, ShoppingBag } from 'lucide-react';
import UserBadges from '@/components/gamification/UserBadges';
import { useSession } from 'next-auth/react';
import { useAuthModal } from '@/components/auth/AuthModal';
import { getProfileData, ProfileData, ActivityItem } from '@/app/actions/profile';
import EditProfileModal from '@/components/profile/EditProfileModal';
import FollowRequestsWidget from '@/components/profile/FollowRequestsWidget';
import FollowedBrandsWidget from '@/components/profile/FollowedBrandsWidget';

type TabId = 'overview' | 'reviews' | 'achievements';

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const { open } = useAuthModal();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'all' | 'reviews' | 'wardrobe'>('all');

  // --- AUTH & FETCH ---
  useEffect(() => {
    if (status === 'unauthenticated') {
      open({ mode: 'signin', reason: 'Sign in to view your profile' });
    }
  }, [status, open]);

  const fetchProfile = async () => {
    if (status !== 'authenticated') return;
    setLoading(true);
    const data = await getProfileData();
    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [status]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // --- RENDER HELPERS ---
  const renderActivityItem = (activity: ActivityItem) => {
    const isReview = activity.type === 'review';
    const hasRating = typeof activity.rating === 'number' && activity.rating > 0;

    return (
      <div key={activity.id} className="flex gap-4 pb-4 border-b border-green-50 last:border-0 group items-start">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-green-100">
             {activity.image ? <img src={activity.image} className="w-full h-full object-contain p-1" alt={activity.fragranceName} /> : <Leaf className="w-6 h-6 m-auto text-green-200 mt-3" />}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm ${isReview ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
            {isReview ? <MessageSquare className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {/* 1. Fragrance Name */}
          <div className="text-sm font-bold text-gray-900 truncate">
            {activity.fragranceName}
          </div>
          
          {/* 2.  Brand Name */}
          <div className="text-xs text-gray-500 mb-2">{activity.brand}</div>
          
          {/* 3.  Action Row */}
          <div className="flex flex-wrap items-center gap-2">
            {isReview ? (
              <>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  Reviewed
                </span>
                {hasRating && (
                  <div className="flex items-center bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-orange-700">
                    <Star className="w-3 h-3 fill-current mr-1" /> {activity.rating}
                  </div>
                )}
                {activity.preview && <span className="text-xs text-gray-500 italic truncate max-w-[200px]">&quot;{activity.preview}&quot;</span>}
              </>
            ) : (
              <>
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                  {activity.status === 'WISH_LIST' ? 'Wished' : 'Added to Wardrobe'}
                </span>
                {activity.subcat && activity.subcat !== 'General' && (
                  <span className="text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                    {activity.subcat}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="text-[10px] text-gray-400 mt-1.5">{formatDate(activity.date)}</div>
        </div>
      </div>
    );
  };

  // --- LOADING ---
  if (status === 'loading' || loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAFFF5]"><Loader2 className="w-8 h-8 text-green-600 animate-spin" /></div>;
  if (! session || ! profile) return <div className="min-h-screen bg-[#FAFFF5]" />;

  const { user, stats, gamification, nudge, recentActivity, signatureScents } = profile;

  const filteredActivity = recentActivity.filter(activity => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'reviews') return activity.type === 'review';
    if (activityFilter === 'wardrobe') return activity.type !== 'review';
    return true;
  });

  return (
    <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: '#FAFFF5' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl animate-pulse animate-delay-2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Follow Requests Widget */}
        <FollowRequestsWidget />
        
        {/* 1.  HERO CARD */}
        <div className="glass-card rounded-2xl shadow-sm p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5"><Trees size={200} /></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            
            {/* User Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                  {user.image ? <img src={user.image} alt={user.name} className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-gray-300">{user.name.charAt(0)}</span>}
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center space-x-3 mb-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">{user.name}</h1>
                    <button onClick={() => setShowEditModal(true)} className="p-1.5 text-gray-400 hover:text-green-600 transition-colors bg-white/50 rounded-full hover:bg-white shadow-sm">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 text-green-500" /> Joined {formatDate(user.joinDate)}</div>
                    {user.location && <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-orange-500" /> {user.location}</div>}
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4 max-w-lg text-sm">
                    {user.bio || <span className="italic text-gray-400">No bio yet. </span>}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider flex items-center gap-1 ${gamification.level === 'Novice' ? 'bg-gray-100 text-gray-600' : 'bg-gradient-to-r from-green-400 to-orange-400 text-white'}`}>
                      <Award className="w-3 h-3" /> {gamification.level}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{gamification.xp} XP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 self-center">
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 text-center border border-white/50 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">{stats.reviews}</div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Reviews</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 text-center border border-white/50 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">{stats.wardrobe}</div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Wardrobe</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 text-center border border-white/50 shadow-sm opacity-60">
                <div className="text-2xl font-bold text-gray-900">{stats.followers}</div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Followers</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 text-center border border-white/50 shadow-sm opacity-60">
                <div className="text-2xl font-bold text-gray-900">{stats.following}</div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SUBTLE NUDGE */}
        {! nudge.isComplete && (
          <div className="mb-8 mx-auto max-w-3xl">
            <div className="bg-white/80 backdrop-blur-sm border border-green-100 rounded-full p-1.5 pl-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-green-500 animate-spin" style={{ animationDuration: '3s' }}></div>
                <span className="text-sm text-gray-600">
                  Profile <span className="font-bold text-gray-900">{nudge.completionPercentage}%</span> complete.  
                  <span className="hidden sm:inline"> Missing: {nudge.missingFields.slice(0, 2).join(', ')}...</span>
                </span>
              </div>
              <button 
                onClick={() => setShowEditModal(true)} 
                className="px-4 py-1.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors"
              >
                Complete
              </button>
            </div>
          </div>
        )}

        {/* 3.  TABS */}
        <div className="glass-card rounded-2xl shadow-sm mb-8">
          <div className="border-b border-green-100 flex px-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'reviews', label: 'Reviews', icon: MessageSquare },
              { id: 'achievements', label: 'Achievements', icon: Award },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`px-4 py-4 border-b-2 text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id ?  'border-green-500 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Activity Feed</h3>
                    
                    {/* Activity Filters */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActivityFilter('all')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          activityFilter === 'all'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setActivityFilter('reviews')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          activityFilter === 'reviews'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Reviews
                      </button>
                      <button
                        onClick={() => setActivityFilter('wardrobe')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          activityFilter === 'wardrobe'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Wardrobe
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {filteredActivity.length > 0 ? filteredActivity.map(renderActivityItem) : (
                      <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center">
                        No {activityFilter === 'all' ? '' : activityFilter} activity yet.
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Signature Scents</h3>
                  {signatureScents.length > 0 ? (
                    <div className="grid grid-cols-3 lg:grid-cols-2 gap-3 mb-8">
                      {signatureScents.map((scent: any) => (
                        <Link href={`/perfumes/${scent.id}`} key={scent.id} className="group aspect-square rounded-xl bg-white border border-gray-100 p-2 flex items-center justify-center hover:border-green-300 transition-colors">
                           {scent.image ? <img src={scent.image} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" /> : <ShoppingBag className="text-gray-200" />}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic mb-8 bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                      Add your Top 5 in settings. 
                    </div>
                  )}

                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Following Brands</h3>
                  <FollowedBrandsWidget />

                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 mt-6">Taste Profile</h3>
                  <div className="space-y-5">
                    <div>
                      <div className="text-xs font-semibold text-gray-900 mb-2">Favorite Notes</div>
                      <div className="flex flex-wrap gap-1.5">
                        {user.favNotes.length > 0 ? user.favNotes.map(n => <span key={n} className="bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">{n}</span>) : <span className="text-xs text-gray-400 italic">None selected</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 mb-2">Favorite Accords</div>
                      <div className="flex flex-wrap gap-1.5">
                        {user.favAccords.length > 0 ? user.favAccords.map(n => <span key={n} className="bg-orange-50 border border-orange-100 text-orange-700 px-2.5 py-1 rounded-md text-xs font-medium">{n}</span>) : <span className="text-xs text-gray-400 italic">None selected</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 mb-2">Favorite Perfumers</div>
                      <div className="flex flex-wrap gap-1.5">
                        {user.favPerfumers.length > 0 ? user.favPerfumers.map(n => <span key={n} className="bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">{n}</span>) : <span className="text-xs text-gray-400 italic">None selected</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ACHIEVEMENTS */}
            {activeTab === 'achievements' && (
              <div className="max-w-2xl mx-auto text-center">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-10 text-white mb-12 shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">🏆</div>
                    <h2 className="text-4xl font-bold mb-2">{gamification.level}</h2>
                    <p className="text-gray-400 mb-6">{gamification.xp} / {gamification.nextLevelXP} XP</p>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${gamification.progress}%` }}></div>
                    </div>
                  </div>
                </div>
                <UserBadges user={{ credibilityScore: gamification.xp }} />
              </div>
            )}

            {/* TAB: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {recentActivity.filter(a => a.type === 'review').map(renderActivityItem)}
                {recentActivity.filter(a => a.type === 'review').length === 0 && <p className="text-center py-10 text-gray-400">No reviews yet.</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <EditProfileModal 
          user={{...user, favPerfumesDisplay: signatureScents}} 
          onClose={() => setShowEditModal(false)} 
          onSuccess={() => { setShowEditModal(false); fetchProfile(); }} 
        />
      )}
    </div>
  );
};

export default ProfilePage;