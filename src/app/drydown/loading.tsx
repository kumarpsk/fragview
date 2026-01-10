export default function DrydownLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9EF' }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[72px] py-8 lg:py-12">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 mb-8 lg:mb-12">
          <div 
            className="h-[24px] w-32 rounded-lg animate-pulse" 
            style={{ backgroundColor: '#ECE0CF' }} 
          />
          <div 
            className="h-[48px] lg:h-[64px] w-64 rounded-xl animate-pulse" 
            style={{ backgroundColor: '#EFEFEF' }} 
          />
          <div 
            className="h-[24px] w-[500px] max-w-full rounded-lg animate-pulse" 
            style={{ backgroundColor: '#EFEFEF' }} 
          />
        </div>

        {/* Category Filter Skeleton */}
        <div className="flex flex-wrap gap-3 mb-8 lg:mb-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className="h-[48px] w-28 rounded-full animate-pulse" 
              style={{ backgroundColor: i === 0 ? '#211F1C' : '#EFEFEF' }} 
            />
          ))}
        </div>

        {/* Featured Article Skeleton */}
        <div className="mb-12 lg:mb-16">
          <div 
            className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full rounded-2xl overflow-hidden animate-pulse" 
            style={{ backgroundColor: '#E2E1E1' }} 
          >
            {/* Overlay Content Skeleton */}
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
              <div className="flex gap-3 mb-4">
                <div className="h-7 w-20 rounded-full" style={{ backgroundColor: '#ECE0CF' }} />
                <div className="h-7 w-24 rounded-full" style={{ backgroundColor: '#ECE0CF' }} />
              </div>
              <div className="h-8 lg:h-12 w-3/4 rounded-lg mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
              <div className="h-5 w-1/2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            </div>
          </div>
        </div>

        {/* Section Title Skeleton */}
        <div className="flex flex-col gap-2 mb-8">
          <div className="h-6 w-32 rounded-lg animate-pulse" style={{ backgroundColor: '#ECE0CF' }} />
          <div className="h-10 w-48 rounded-xl animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
        </div>

        {/* Articles Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className="rounded-2xl overflow-hidden animate-pulse"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFEF' }}
            >
              {/* Image */}
              <div className="h-[200px] lg:h-[240px]" style={{ backgroundColor: '#E2E1E1' }} />
              {/* Content */}
              <div className="p-5 lg:p-6 flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="h-6 w-20 rounded-full" style={{ backgroundColor: '#ECE0CF' }} />
                  <div className="h-6 w-24 rounded-full" style={{ backgroundColor: '#ECE0CF' }} />
                </div>
                <div className="h-7 w-full rounded-lg" style={{ backgroundColor: '#EFEFEF' }} />
                <div className="h-5 w-3/4 rounded-lg" style={{ backgroundColor: '#EFEFEF' }} />
                <div className="h-5 w-1/3 rounded-lg" style={{ backgroundColor: '#EFEFEF' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}