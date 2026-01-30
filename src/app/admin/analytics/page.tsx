import { requireAdmin } from '@/lib/admin/permissions';
import { getAnalytics } from '@/lib/admin/analytics';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { BarChart3 } from 'lucide-react';

export const metadata = {
  title: 'Analytics | Admin',
};

export default async function AnalyticsPage() {
  await requireAdmin();
  const analytics = await getAnalytics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center border border-amber-200/50">
            <BarChart3 className="w-7 h-7 text-amber-800" />
          </div>
          <div>
            <h1 className="font-hedvig text-[28px] sm:text-[32px] lg:text-[36px] leading-tight text-[#211F1C]">
              Analytics dashboard
            </h1>
            <p className="font-[var(--font-inter)] text-sm sm:text-base text-[#4A4946] mt-1">
              Site performance and user metrics
            </p>
          </div>
        </div>
      </div>

      <AnalyticsDashboard data={analytics} />
    </div>
  );
}