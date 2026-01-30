import { requireAdmin } from '@/lib/admin/permissions';
import { getDashboardStats, getRecentActivity } from '@/lib/admin/stats';
import StatsCard from '@/components/admin/StatsCard';
import ActivityFeed from '@/components/admin/ActivityFeed';
import QuickActions from '@/components/admin/QuickActions';
import { 
  Users, 
  Package, 
  Building2, 
  Star, 
  AlertCircle,
  TrendingUp,
  FileText,
  Calendar
} from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | FragView',
  description: 'FragView admin control panel',
};

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats();
  const recentActivity = await getRecentActivity(10);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-hedvig text-[28px] sm:text-[32px] lg:text-[36px] leading-tight text-[#211F1C]">
          Admin dashboard
        </h1>
        <p className="font-[var(--font-inter)] text-sm sm:text-base text-[#4A4946]">
          Welcome back, {admin.username}. Here&apos;s what&apos;s happening across Fragview.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total users"
          value={stats.users.total}
          change={`+${stats.users.recent} this week`}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Total perfumes"
          value={stats.content.perfumes}
          icon={Package}
          color="green"
        />
        <StatsCard
          title="Total brands"
          value={stats.content.brands}
          icon={Building2}
          color="orange"
        />
        <StatsCard
          title="Total reviews"
          value={stats.content.reviews}
          icon={Star}
          color="purple"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Active users (30d)"
          value={stats.users.active}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Wardrobe items"
          value={stats.content.wardrobeItems}
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Notifications sent"
          value={stats.notifications}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Pending Items Alert */}
      {stats.pending.total > 0 && (
        <div className="rounded-2xl border border-[#F97316]/30 bg-[#FFF4E3] px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FED7AA] text-[#9A3412] mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </span>
            <div className="flex-1">
              <h3 className="font-hedvig text-lg text-[#211F1C]">
                {stats.pending.total} pending item
                {stats.pending.total !== 1 ? 's' : ''} to review
              </h3>
              <p className="mt-1 text-sm font-[var(--font-inter)] text-[#4A4946]">
                {stats.pending.submissions} community submission
                {stats.pending.submissions !== 1 ? 's' : ''} and{' '}
                {stats.pending.brandApplications} brand application
                {stats.pending.brandApplications !== 1 ? 's' : ''} awaiting review.
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <a
                  href="/admin/submissions"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#211F1C] px-3 py-2 text-xs font-medium text-white hover:bg-[#211F1C]/90 transition-colors"
                >
                  Review submissions
                  <span aria-hidden>→</span>
                </a>
                <a
                  href="/admin/brand-applications"
                  className="inline-flex items-center gap-1 rounded-lg border border-[#C4C4C3] bg-white px-3 py-2 text-xs font-medium text-[#211F1C] hover:bg-[#FFF4E3] transition-colors"
                >
                  Review applications
                  <span aria-hidden>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions pendingCount={stats.pending.total} />

      {/* Recent Activity */}
      <div className="rounded-2xl border border-[#E2E1E1] bg-white/80 backdrop-blur-sm p-6">
        <h2 className="text-xl font-hedvig text-[#211F1C] mb-4">
          Recent activity
        </h2>
        <ActivityFeed activities={recentActivity} />
      </div>
    </div>
  );
}