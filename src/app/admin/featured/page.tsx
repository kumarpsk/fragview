import { requireAdmin } from '@/lib/admin/permissions';
import { getFeaturedContent } from '@/lib/admin/featured';
import FeaturedContentManager from '@/components/admin/FeaturedContentManager';
import { Star } from 'lucide-react';

export const metadata = {
  title: 'Featured Content | Admin',
};

export default async function FeaturedContentPage() {
  await requireAdmin();
  const featuredContent = await getFeaturedContent();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center border border-rose-200/50">
            <Star className="w-7 h-7 text-rose-600" />
          </div>
          <div>
            <h1 className="font-hedvig text-[28px] sm:text-[32px] lg:text-[36px] leading-tight text-[#211F1C]">
              Featured Content
            </h1>
            <p className="font-[var(--font-inter)] text-sm sm:text-base text-[#4A4946] mt-1">
              Manage homepage featured perfumes and trending brands
            </p>
          </div>
        </div>
      </div>

      <FeaturedContentManager initialData={featuredContent} />
    </div>
  );
}