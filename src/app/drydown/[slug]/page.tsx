import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { getArticleBySlug } from '@/app/actions/drydown';
import { getArticleComments } from '@/app/actions/drydown-comments';
import ArticleComments from '@/components/drydown/ArticleComments';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getArticleBySlug(slug);
  if (!data) return { title: 'Article Not Found • The Drydown' };
  
  return {
    title: `${data.article.title} • The Drydown`,
    description: data.article.excerpt,
    openGraph: {
      images: [data.article.coverImage || ''],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getArticleBySlug(slug);
  
  if (!data) {
    return notFound();
  }

  const { article, mentionedPerfumes } = data;

  // Fetch comments
  const comments = await getArticleComments(article.id);

  // Format date
  const publishedDate = new Date(article.publishedAt || article.createdAt);
  const formattedDate = publishedDate.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9EF' }}>
      {/* Hero Section */}
      <section 
        className="relative w-full py-9"
      >
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          {article.coverImage && (
            <img 
              src={article.coverImage} 
              alt={article.title} 
              className="w-full h-full object-cover" 
            />
          )}
          {/* Gradient overlay */}
          <div 
            className="absolute inset-0"
            style={{ 
              background: 'linear-gradient(90deg, rgba(33, 31, 28, 0.4) 20.81%, rgba(33, 31, 28, 0.3) 88.57%)' 
            }}
          />
        </div>
        
        {/* Content Container */}
        <div className="relative z-10 h-full flex items-center px-4 sm:px-6 lg:px-[72px]">
          <div className="flex flex-col gap-3 max-w-[807px]">
            {/* Badges Row */}
            <div className="flex items-center gap-4 lg:gap-6">
              {/* Category Badge */}
              <div 
                className="inline-flex items-center justify-center px-2.5 py-1 rounded-3xl"
                style={{ backgroundColor: '#ECE0CF' }}
              >
                <span 
                  className="text-[12px] leading-[18px] lg:text-[14px] lg:leading-[20px]"
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontWeight: 500, 
                    color: '#695129' 
                  }}
                >
                  {article.category}
                </span>
              </div>
              
              {/* Date Badge */}
              <div 
                className="inline-flex items-center justify-center px-2.5 py-1 rounded-3xl"
                style={{ backgroundColor: '#ECE0CF' }}
              >
                <span 
                  className="text-[12px] leading-[18px] lg:text-[14px] lg:leading-[20px]"
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontWeight: 500, 
                    color: '#695129' 
                  }}
                >
                  {formattedDate}
                </span>
              </div>
            </div>
            
            {/* Title and Author */}
            <div className="flex flex-col gap-3">
              {/* Title */}
              <h1 
                className="text-[28px] leading-[36px] sm:text-[40px] sm:leading-[48px] lg:text-[56px] lg:leading-[64px]"
                style={{ 
                  fontFamily: "'Hedvig Letters Serif', serif", 
                  fontWeight: 400, 
                  color: '#FFFFFF' 
                }}
              >
                {article.title}
              </h1>
              
              {/* Author and Read Time */}
              <p 
                className="text-[14px] leading-[20px] sm:text-[16px] sm:leading-[24px] lg:text-[20px] lg:leading-[28px]"
                style={{ 
                  fontFamily: "'Inter', sans-serif", 
                  fontWeight: 400, 
                  color: '#FFFFFF' 
                }}
              >
                {article.author.name} • {article.readTime}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-4 sm:px-6 lg:px-[72px] py-4" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-[1296px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Left Column - Article Content */}
            <div className="flex-1 lg:max-w-[856px] flex flex-col gap-4">
              {/* Excerpt with Yellow Bar */}
              <div className="flex items-stretch gap-3">
                <div 
                  className="w-1 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: '#FBC061' }}
                />
                <p 
                  className="text-[18px] leading-[28px] lg:text-[20px] lg:leading-[30px]"
                  style={{ 
                    fontFamily: "'Hedvig Letters Serif', serif", 
                    fontWeight: 400, 
                    color: '#211F1C' 
                  }}
                >
                  {article.excerpt}
                </p>
              </div>

              {/* Main Content */}
              <div 
                className="prose prose-lg max-w-none [&_p]:text-[18px] [&_p]:leading-[28px] lg:[&_p]:text-[20px] lg:[&_p]:leading-[30px] [&_p]:mb-6 [&_strong]:font-semibold"
                style={{ 
                  fontFamily: "'Inter', sans-serif", 
                  fontWeight: 400, 
                  color: '#211F1C'
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>

              {/* Divider */}
              <div className="w-full h-px" style={{ backgroundColor: '#E2E1E1' }} />

              {/* Tagged in + Share Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:gap-12">
                {/* Tagged In */}
                <div className="flex items-center gap-3">
                  <span 
                    className="text-[18px] leading-[28px] lg:text-[20px] lg:leading-[30px]"
                    style={{ 
                      fontFamily: "'Inter', sans-serif", 
                      fontWeight: 400, 
                      color: '#211F1C' 
                    }}
                  >
                    Tagged in
                  </span>
                  <div 
                    className="inline-flex items-center justify-center px-2.5 py-1 rounded-3xl"
                    style={{ backgroundColor: '#ECE0CF' }}
                  >
                    <span 
                      className="text-[14px] leading-[20px]"
                      style={{ 
                        fontFamily: "'Inter', sans-serif", 
                        fontWeight: 500, 
                        color: '#695129' 
                      }}
                    >
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex items-center gap-3 lg:gap-4">
                  <span 
                    className="text-[18px] leading-[28px] lg:text-[20px] lg:leading-[30px]"
                    style={{ 
                      fontFamily: "'Inter', sans-serif", 
                      fontWeight: 400, 
                      color: '#211F1C' 
                    }}
                  >
                    Share
                  </span>
                  <div className="flex items-center gap-4">
                    {/* Facebook */}
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50 transition-colors"
                      style={{ borderColor: '#211F1C' }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="#211F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                    {/* Instagram */}
                    <a 
                      href="https://www.instagram.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50 transition-colors"
                      style={{ borderColor: '#211F1C' }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="20" height="20" rx="5" stroke="#211F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="4" stroke="#211F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="18" cy="6" r="1" fill="#211F1C"/>
                      </svg>
                    </a>
                    {/* X/Twitter */}
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50 transition-colors"
                      style={{ borderColor: '#211F1C' }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4L10.5 12.5M20 20L13.5 11.5M10.5 12.5L4 20H8L13.5 11.5M10.5 12.5L16 4H20L13.5 11.5" stroke="#211F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                    {/* LinkedIn */}
                    <a 
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(article.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50 transition-colors"
                      style={{ borderColor: '#211F1C' }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="#211F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="2" y="9" width="4" height="12" stroke="#211F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="4" cy="4" r="2" stroke="#211F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="w-full lg:w-[392px] flex-shrink-0">
              <div className="flex flex-col gap-8 lg:gap-12 lg:sticky lg:top-24">
                
                {/* About the Author Card */}
                <div 
                  className="p-6 rounded-xl"
                  style={{ border: '1px solid #E2E1E1' }}
                >
                  <div className="flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex flex-col gap-1">
                      <span 
                        className="text-[18px] leading-[26px] lg:text-[20px] lg:leading-[28px]"
                        style={{ 
                          fontFamily: "'Hedvig Letters Serif', serif", 
                          fontWeight: 400, 
                          color: '#737270' 
                        }}
                      >
                        About the author
                      </span>
                      <h3 
                        className="text-[28px] leading-[36px] lg:text-[40px] lg:leading-[48px]"
                        style={{ 
                          fontFamily: "'Hedvig Letters Serif', serif", 
                          fontWeight: 400, 
                          color: '#211F1C' 
                        }}
                      >
                        {article.author.name}
                      </h3>
                    </div>
                    {/* Bio */}
                    <p 
                      className="text-[16px] leading-[24px] lg:text-[18px] lg:leading-[26px]"
                      style={{ 
                        fontFamily: "'Inter', sans-serif", 
                        fontWeight: 400, 
                        color: '#737270' 
                      }}
                    >
                      {article.author.bio || "A fragrance enthusiast contributing to The Drydown. Exploring the intersection of art, chemistry, and emotion in perfumery."}
                    </p>
                  </div>
                </div>

                {/* Featured Perfume Card */}
                {mentionedPerfumes.length > 0 && (
                  <div 
                    className="flex flex-col rounded-2xl overflow-hidden"
                    style={{ backgroundColor: '#FFF9EF' }}
                  >
                    {/* Image Area */}
                    <div 
                      className="relative h-[250px] lg:h-[292px] p-4"
                      style={{ 
                        borderWidth: '1px 1px 0px 1px',
                        borderStyle: 'solid',
                        borderColor: '#EFEFEF',
                        borderRadius: '16px 16px 0px 0px',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      {/* Gender Badge */}
                      {mentionedPerfumes[0].gender && (
                        <div 
                          className="absolute top-4 left-4 inline-flex items-center justify-center px-2.5 py-1 rounded-3xl z-10"
                          style={{ backgroundColor: '#ECE0CF' }}
                        >
                          <span 
                            className="text-[14px] leading-[20px] capitalize"
                            style={{ 
                              fontFamily: "'Inter', sans-serif", 
                              fontWeight: 500, 
                              color: '#695129' 
                            }}
                          >
                            {mentionedPerfumes[0].gender}
                          </span>
                        </div>
                      )}
                      {/* Perfume Image */}
                      {mentionedPerfumes[0].image ? (
                        <img 
                          src={mentionedPerfumes[0].image} 
                          alt={mentionedPerfumes[0].variant_name} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="w-12 h-12" style={{ color: '#C4C4C3' }} />
                        </div>
                      )}
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-6 flex flex-col gap-6">
                      {/* Info */}
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                          <h4 
                            className="text-[20px] leading-[28px] lg:text-[24px] lg:leading-[32px]"
                            style={{ 
                              fontFamily: "'Averia Serif Libre', serif", 
                              fontWeight: 400, 
                              color: '#211F1C' 
                            }}
                          >
                            {mentionedPerfumes[0].variant_name}
                          </h4>
                          <p 
                            className="text-[14px] leading-[20px] lg:text-[16px] lg:leading-[24px]"
                            style={{ 
                              fontFamily: "'Inter', sans-serif", 
                              fontWeight: 400, 
                              color: '#4A4946' 
                            }}
                          >
                            {mentionedPerfumes[0].brand_name}
                          </p>
                        </div>
                        {/* Accords */}
                        {mentionedPerfumes[0].accords && mentionedPerfumes[0].accords.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {mentionedPerfumes[0].accords.slice(0, 3).map((accord: string, idx: number) => (
                              <div 
                                key={idx}
                                className="inline-flex items-center justify-center px-2.5 py-1 rounded-3xl"
                                style={{ backgroundColor: '#ECE0CF' }}
                              >
                                <span 
                                  className="text-[14px] leading-[20px]"
                                  style={{ 
                                    fontFamily: "'Inter', sans-serif", 
                                    fontWeight: 500, 
                                    color: '#695129' 
                                  }}
                                >
                                  {accord}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* View Details Button */}
                      <Link
                        href={`/perfumes/${mentionedPerfumes[0].slug}`}
                        className="flex items-center justify-center gap-2 h-[50px] rounded-lg transition-colors hover:bg-gray-50"
                        style={{ border: '1px solid #C4C4C3' }}
                      >
                        <span 
                          className="text-[18px] leading-[26px]"
                          style={{ 
                            fontFamily: "'Inter', sans-serif", 
                            fontWeight: 500, 
                            color: '#211F1C' 
                          }}
                        >
                          View Details
                        </span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#211F1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Our Rating Card */}
                {mentionedPerfumes.length > 0 && mentionedPerfumes[0].rating && (
                  <div 
                    className="p-6 rounded-xl"
                    style={{ border: '1px solid #E2E1E1' }}
                  >
                    <div className="flex flex-col gap-3">
                      {/* Header */}
                      <div className="flex flex-col gap-1">
                        <span 
                          className="text-[18px] leading-[26px] lg:text-[20px] lg:leading-[28px]"
                          style={{ 
                            fontFamily: "'Hedvig Letters Serif', serif", 
                            fontWeight: 400, 
                            color: '#737270' 
                          }}
                        >
                          Our Rating
                        </span>
                        <h3 
                          className="text-[28px] leading-[36px] lg:text-[40px] lg:leading-[48px]"
                          style={{ 
                            fontFamily: "'Hedvig Letters Serif', serif", 
                            fontWeight: 400, 
                            color: '#211F1C' 
                          }}
                        >
                          {mentionedPerfumes[0].rating.toFixed(1)}<span className="text-[20px] lg:text-[24px]">/10</span>
                        </h3>
                      </div>
                      {/* Stats */}
                      <div className="flex flex-col gap-3">
                        {/* Longevity */}
                        <div className="flex justify-between items-center">
                          <span 
                            className="text-[14px] leading-[20px] lg:text-[16px] lg:leading-[24px]"
                            style={{ 
                              fontFamily: "'Inter', sans-serif", 
                              fontWeight: 400, 
                              color: '#4A4946' 
                            }}
                          >
                            Longevity
                          </span>
                          <span 
                            className="text-[14px] leading-[20px] lg:text-[16px] lg:leading-[24px]"
                            style={{ 
                              fontFamily: "'Inter', sans-serif", 
                              fontWeight: 500, 
                              color: '#211F1C' 
                            }}
                          >
                            8-10 hours
                          </span>
                        </div>
                        {/* Sillage */}
                        <div className="flex justify-between items-center">
                          <span 
                            className="text-[14px] leading-[20px] lg:text-[16px] lg:leading-[24px]"
                            style={{ 
                              fontFamily: "'Inter', sans-serif", 
                              fontWeight: 400, 
                              color: '#4A4946' 
                            }}
                          >
                            Sillage
                          </span>
                          <span 
                            className="text-[14px] leading-[20px] lg:text-[16px] lg:leading-[24px]"
                            style={{ 
                              fontFamily: "'Inter', sans-serif", 
                              fontWeight: 500, 
                              color: '#211F1C' 
                            }}
                          >
                            Moderate
                          </span>
                        </div>
                        {/* Best Season */}
                        <div className="flex justify-between items-center">
                          <span 
                            className="text-[14px] leading-[20px] lg:text-[16px] lg:leading-[24px]"
                            style={{ 
                              fontFamily: "'Inter', sans-serif", 
                              fontWeight: 400, 
                              color: '#4A4946' 
                            }}
                          >
                            Best Season
                          </span>
                          <span 
                            className="text-[14px] leading-[20px] lg:text-[16px] lg:leading-[24px]"
                            style={{ 
                              fontFamily: "'Inter', sans-serif", 
                              fontWeight: 500, 
                              color: '#211F1C' 
                            }}
                          >
                            Fall/Winter
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* Comments Section - Full Width Below */}
          <div className="mt-4">
            <ArticleComments articleId={article.id} initialComments={comments} />
          </div>
        </div>
      </section>
    </div>
  );
}