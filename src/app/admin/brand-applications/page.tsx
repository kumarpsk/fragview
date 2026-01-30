import { requireAdmin } from '@/lib/admin/permissions';
import { getBrandApplications } from '@/lib/admin/brand-applications';
import BrandApplicationsList from '@/components/admin/BrandApplicationsList';
import { Suspense } from 'react';
import { Building2 } from 'lucide-react';

export const metadata = {
  title: 'Brand Applications | Admin',
};

export default async function BrandApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center border border-amber-200/50">
            <Building2 className="w-7 h-7 text-amber-800" />
          </div>
          <div>
            <h1 className="font-hedvig text-[28px] sm:text-[32px] lg:text-[36px] leading-tight text-[#211F1C]">
              Brand Owner Applications
            </h1>
            <p className="font-[var(--font-inter)] text-sm sm:text-base text-[#4A4946] mt-1">
              Review and verify brand ownership claims
            </p>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <Suspense fallback={
        <div className="rounded-2xl border border-[#E2E1E1] bg-white/80 backdrop-blur-sm p-12 text-center">
          <p className="font-[var(--font-inter)] text-[#4A4946]">Loading applications...</p>
        </div>
      }>
        <BrandApplicationsListContent searchParams={await searchParams} />
      </Suspense>
    </div>
  );
}

async function BrandApplicationsListContent({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const applications = await getBrandApplications({
    status: searchParams.status || 'PENDING',
  });

  return <BrandApplicationsList applications={applications} />;
}