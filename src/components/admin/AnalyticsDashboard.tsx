'use client';

import { TrendingUp, Users, Star, Package, Eye } from 'lucide-react';

interface AnalyticsData {
  userGrowth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  topReviewers: Array<{
    username: string;
    reviewCount: number;
    xp: number;
  }>;
  topPerfumes: Array<{
    name: string;
    brandName: string;
    reviewCount: number;
    avgRating: number;
  }>;
  systemHealth: {
    dbSize: string;
    totalStorage: string;
    avgResponseTime: string;
  };
}

interface Props {
  data: AnalyticsData;
}

export default function AnalyticsDashboard({ data }: Props) {
  return (
    <div className="space-y-6">
      {/* User Growth */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] p-6 shadow-sm">
        <h2 className="text-xl font-hedvig text-[#211F1C] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-lime-700" />
          User Growth
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-[var(--font-inter)] text-[#4A4946] mb-1">Daily new users</p>
            <p className="text-3xl font-hedvig text-[#211F1C]">{data.userGrowth.daily}</p>
          </div>
          <div>
            <p className="text-sm font-[var(--font-inter)] text-[#4A4946] mb-1">Weekly new users</p>
            <p className="text-3xl font-hedvig text-[#211F1C]">{data. userGrowth.weekly}</p>
          </div>
          <div>
            <p className="text-sm font-[var(--font-inter)] text-[#4A4946] mb-1">Monthly new users</p>
            <p className="text-3xl font-hedvig text-[#211F1C]">{data.userGrowth.monthly}</p>
          </div>
        </div>
      </div>

      {/* Top Reviewers */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] p-6 shadow-sm">
        <h2 className="text-xl font-hedvig text-[#211F1C] mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-800" />
          Top Reviewers
        </h2>
        <div className="space-y-3">
          {data.topReviewers.map((reviewer, index) => (
            <div
              key={reviewer.username}
              className="flex items-center justify-between p-3 bg-[#F9F7F5] rounded-xl border border-[#E2E1E1]"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-hedvig text-[#737270]">#{index + 1}</span>
                <div>
                  <p className="font-[var(--font-inter)] font-semibold text-[#211F1C]">
                    {reviewer.username}
                  </p>
                  <p className="text-sm font-[var(--font-inter)] text-[#4A4946]">
                    {reviewer.xp} XP
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="font-[var(--font-inter)] font-medium text-[#211F1C]">
                  {reviewer.reviewCount} reviews
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Perfumes */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] p-6 shadow-sm">
        <h2 className="text-xl font-hedvig text-[#211F1C] mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-rose-600" />
          Most Reviewed Perfumes
        </h2>
        <div className="space-y-3">
          {data.topPerfumes.map((perfume, index) => (
            <div
              key={perfume.name}
              className="flex items-center justify-between p-3 bg-[#F9F7F5] rounded-xl border border-[#E2E1E1]"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-hedvig text-[#737270]">#{index + 1}</span>
                <div>
                  <p className="font-[var(--font-inter)] font-semibold text-[#211F1C]">
                    {perfume.name}
                  </p>
                  <p className="text-sm font-[var(--font-inter)] text-[#4A4946]">
                    {perfume.brandName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-[var(--font-inter)] font-medium text-[#211F1C]">
                    {perfume.reviewCount} reviews
                  </p>
                  <p className="text-xs font-[var(--font-inter)] text-[#4A4946]">
                    ★ {perfume.avgRating. toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E2E1E1] p-6 shadow-sm">
        <h2 className="text-xl font-hedvig text-[#211F1C] mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-lime-700" />
          System Health
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-[var(--font-inter)] text-[#4A4946] mb-1">Database size</p>
            <p className="text-2xl font-hedvig text-[#211F1C]">{data.systemHealth. dbSize}</p>
          </div>
          <div>
            <p className="text-sm font-[var(--font-inter)] text-[#4A4946] mb-1">Total storage</p>
            <p className="text-2xl font-hedvig text-[#211F1C]">{data.systemHealth. totalStorage}</p>
          </div>
          <div>
            <p className="text-sm font-[var(--font-inter)] text-[#4A4946] mb-1">Avg response time</p>
            <p className="text-2xl font-hedvig text-[#211F1C]">{data.systemHealth.avgResponseTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}