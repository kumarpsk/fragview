export default function LoadingPerfumes() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9EF' }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[72px] py-8 lg:py-12">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-6 mb-8 lg:mb-12">
          <div className="h-[48px] lg:h-[64px] w-64 rounded-xl animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
          <div className="h-[24px] w-96 rounded-lg animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="h-[50px] w-32 rounded-xl animate-pulse" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFEF' }} />
          <div className="h-[50px] w-40 rounded-xl animate-pulse" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFEF' }} />
          <div className="h-[50px] flex-1 max-w-md rounded-xl animate-pulse" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFEF' }} />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden animate-pulse"
              style={{ backgroundColor: '#FFF9EF', border: '1px solid #EFEFEF' }}
            >
              {/* Image Area */}
              <div className="h-[200px] lg:h-[280px]" style={{ backgroundColor: '#FFFFFF' }} />
              {/* Content Area */}
              <div className="p-4 lg:p-6 flex flex-col gap-3">
                <div className="h-5 w-3/4 rounded-lg" style={{ backgroundColor: '#EFEFEF' }} />
                <div className="h-4 w-1/2 rounded-lg" style={{ backgroundColor: '#EFEFEF' }} />
                <div className="flex gap-2 mt-2">
                  <div className="h-7 w-16 rounded-full" style={{ backgroundColor: '#ECE0CF' }} />
                  <div className="h-7 w-14 rounded-full" style={{ backgroundColor: '#ECE0CF' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}