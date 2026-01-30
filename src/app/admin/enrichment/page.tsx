import { requireAdmin } from '@/lib/admin/permissions';
import { getNeedsEnrichment } from '@/lib/admin/enrichment';
import EnrichmentDashboard from '@/components/admin/EnrichmentDashboard';
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Needs Enrichment | Admin',
};

export default async function EnrichmentPage() {
  await requireAdmin();
  const data = await getNeedsEnrichment();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center border border-amber-200/50">
            <AlertCircle className="w-7 h-7 text-amber-700" />
          </div>
          <div>
            <h1 className="font-hedvig text-[28px] sm:text-[32px] lg:text-[36px] leading-tight text-[#211F1C]">
              Needs Enrichment
            </h1>
            <p className="font-[var(--font-inter)] text-sm sm:text-base text-[#4A4946] mt-1">
              {data.perfumes.length} perfumes and {data.brands.length} brands need additional data
            </p>
          </div>
        </div>
      </div>

      <EnrichmentDashboard perfumes={data.perfumes} brands={data.brands} />
    </div>
  );
}