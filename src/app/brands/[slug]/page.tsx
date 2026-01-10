import { loadBrandDetail } from './loaders';
import BrandDetailClient from './BrandDetailClient';
import { notFound } from 'next/navigation';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = `https://fragviewvercel.vercel.app/brands/${slug}`;
  return {
    title: `Brand: ${slug} | FragView`,
    description: `Explore perfumes by ${slug} on FragView: fragrance listings, filters and more.`,
    alternates: { canonical: url },
  };
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const data = await loadBrandDetail(slug, resolvedSearchParams);
  if (!data) return notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9EF' }}>
      <BrandDetailClient
        brand={data.brand}
        perfumes={data.perfumes}
        meta={data.meta}
        filters={data.filters}
        pageSize={data.pageSize}
      />
    </div>
  );
}