import { requireAdmin } from '@/lib/admin/permissions';
import { getSubmissions } from '@/lib/admin/submissions';
import SubmissionsList from '@/components/admin/SubmissionsList';
import { Suspense } from 'react';
import { ClipboardList } from 'lucide-react';

export const metadata = {
  title: 'Community Submissions | Admin',
};

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  await requireAdmin();
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center border border-amber-200/50">
            <ClipboardList className="w-7 h-7 text-amber-700" />
          </div>
          <div>
            <h1 className="font-hedvig text-[28px] sm:text-[32px] lg:text-[36px] leading-tight text-[#211F1C]">
              Community Submissions
            </h1>
            <p className="font-[var(--font-inter)] text-sm sm:text-base text-[#4A4946] mt-1">
              Review user suggestions for missing perfumes and brands
            </p>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <Suspense fallback={
        <div className="rounded-2xl border border-[#E2E1E1] bg-white/80 backdrop-blur-sm p-12 text-center">
          <p className="font-[var(--font-inter)] text-[#4A4946]">Loading submissions...</p>
        </div>
      }>
        <SubmissionsListContent searchParams={await searchParams} />
      </Suspense>
    </div>
  );
}

async function SubmissionsListContent({
  searchParams,
}: {
  searchParams: { status?: string; type?: string };
}) {
  const submissions = await getSubmissions({
    status: searchParams.status || 'PENDING',
    type: searchParams.type,
  });

  return <SubmissionsList submissions={submissions} />;
}