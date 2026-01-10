export default function LoadingPerfumeDetail() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9EF' }}>
      {/* Hero Section Skeleton */}
      <div className="w-full" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[72px] py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Image Skeleton */}
            <div className="w-full lg:w-[500px] flex-shrink-0">
              <div 
                className="aspect-square rounded-2xl animate-pulse" 
                style={{ backgroundColor: '#EFEFEF' }} 
              />
            </div>
            
            {/* Info Skeleton */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Brand & Name */}
              <div className="flex flex-col gap-3">
                <div className="h-6 w-32 rounded-lg animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
                <div className="h-12 w-3/4 rounded-xl animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: '#FBC061' }} />
                <div className="h-6 w-20 rounded-lg animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
              </div>
              
              {/* Accords */}
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 w-20 rounded-full" style={{ backgroundColor: '#ECE0CF' }} />
                ))}
              </div>
              
              {/* Description */}
              <div className="flex flex-col gap-2">
                <div className="h-5 w-full rounded-lg animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
                <div className="h-5 w-full rounded-lg animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
                <div className="h-5 w-2/3 rounded-lg animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
              </div>
              
              {/* Buttons */}
              <div className="flex gap-4 mt-4">
                <div className="h-[50px] w-40 rounded-xl animate-pulse" style={{ backgroundColor: '#211F1C' }} />
                <div className="h-[50px] w-40 rounded-xl animate-pulse" style={{ backgroundColor: '#FFFFFF', border: '1px solid #C4C4C3' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section Skeleton */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[72px] py-8 lg:py-12">
        <div className="flex flex-col gap-6">
          <div className="h-10 w-48 rounded-xl animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl animate-pulse"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFEF' }}
              >
                <div className="h-6 w-24 rounded-lg mb-4" style={{ backgroundColor: '#ECE0CF' }} />
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-10 w-20 rounded-full" style={{ backgroundColor: '#EFEFEF' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section Skeleton */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[72px] py-8 lg:py-12">
        <div className="flex flex-col gap-6">
          <div className="h-10 w-32 rounded-xl animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl animate-pulse"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFEF' }}
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full" style={{ backgroundColor: '#EFEFEF' }} />
                  <div className="flex flex-col gap-2">
                    <div className="h-5 w-32 rounded-lg" style={{ backgroundColor: '#EFEFEF' }} />
                    <div className="h-4 w-24 rounded-lg" style={{ backgroundColor: '#EFEFEF' }} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-full rounded-lg" style={{ backgroundColor: '#EFEFEF' }} />
                  <div className="h-4 w-3/4 rounded-lg" style={{ backgroundColor: '#EFEFEF' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}