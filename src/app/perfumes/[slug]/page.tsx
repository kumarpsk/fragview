import { loadPerfumeDetail } from './loaders';
import PerfumeDetailClient from './PerfumeDetailClient';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import { getPerfumeBySlug } from '@/lib/data/perfumes';
import { sanitizeSingleDoc } from '@/lib/sanitize';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const { connectMongoDB } = await import('@/lib/mongodb');
    const { db } = await connectMongoDB();
    
    const perfumes = await db
      .collection('perfumes')
      .find({}, { projection: { slug: 1 } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return perfumes.map((p) => ({
      slug: p.slug,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// 🚀 FIXED: params is now Promise
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  try {
    const { slug } = await params; // 🚀 AWAIT params
    
    const perfumeRaw = await getPerfumeBySlug(slug);
    if (! perfumeRaw) return {};
    
    const perfume = sanitizeSingleDoc(perfumeRaw);
    const rating = (perfume as any).rating || 0;
    const reviewCount = (perfume as any).votes || 0;
    
    const title = `${(perfume as any).variant_name} by ${(perfume as any).brand_name} | FragView`;
    const description =
      (perfume as any).description?.slice(0, 160) ||
      `${(perfume as any).variant_name} by ${(perfume as any).brand_name} – fragrance details, accords, notes, ratings, and reviews on FragView. `;
    const url = `https://fragviewvercel.vercel.app/perfumes/${slug}`;
    
    const jsonLd: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: (perfume as any).variant_name,
      brand: (perfume as any).brand_name,
      description,
      image: (perfume as any).image || (perfume as any).perfume_image || undefined,
      url,
    };
    
    if (reviewCount > 0) {
      jsonLd.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: rating.toFixed(2),
        ratingCount: reviewCount,
      };
    }
    
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: 'website',
        images: (perfume as any).image ?  [(perfume as any).image] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {};
  }
}

// 🚀 FIXED: params is now Promise
export default async function PerfumeDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params; // 🚀 AWAIT params
  
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('next-auth.session-token') || 
                        cookieStore.get('__Secure-next-auth.session-token');
  
  let session = null;
  let currentUserId: string | undefined;
  
  if (sessionToken) {
    session = await getServerSession(authOptions);
    currentUserId = session?.user?.id;
  }
  
  const data = await loadPerfumeDetail(slug, currentUserId);
  if (!data) return notFound();

  const isSignedIn = !!session?.user;
  const canRate = isSignedIn;

  const { perfume, rating, reviewCount, reviews, isFollowingThread } = data;
  const url = `https://fragviewvercel.vercel.app/perfumes/${slug}`;
  
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: perfume.variant_name,
    brand: perfume.brand_name,
    description:
      perfume.description ||
      `${perfume.variant_name} by ${perfume.brand_name} fragrance profile on FragView.`,
    image: perfume.image || perfume.perfume_image || undefined,
    url,
  };
  
  if (reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(2),
      ratingCount: reviewCount,
    };
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PerfumeDetailClient
        perfume={data.perfume}
        rating={data.rating}
        isSignedIn={isSignedIn}
        canRate={canRate}
        reviews={data.reviews}
        reviewCount={data.reviewCount}
        slug={slug}
        initialIsFollowing={isFollowingThread}
      />
    </div>
  );
}