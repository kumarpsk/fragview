export default function LoadingBrandDetail() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9EF' }}>
      {/* Hero Section Skeleton */}
      <div className="w-full" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[72px] py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Logo Skeleton */}
            <div 
              className="w-[120px] h-[120px] lg:w-[160px] lg:h-[160px] rounded-2xl animate-pulse" 
              style={{ backgroundColor: '#FEEBCE' }} 
            />
            
            {/* Info Skeleton */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="h-12 lg:h-14 w-64 rounded-xl animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
              <div className="flex gap-6">
                <div className="h-5 w-32 rounded-lg animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
                <div className="h-5 w-28 rounded-lg animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="h-5 w-full max-w-2xl rounded-lg animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
                <div className="h-5 w-3/4 max-w-xl rounded-lg animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fragrances Section Skeleton */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[72px] py-8 lg:py-12">
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="h-10 w-48 rounded-xl animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
          <div className="h-[50px] w-32 rounded-xl animate-pulse" style={{ backgroundColor: '#FFFFFF', border: '1px solid #C4C4C3' }} />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
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