export default function LoadingBrands() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9EF' }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[72px] py-8 lg:py-12">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-6 mb-8 lg:mb-12">
          <div className="h-[48px] lg:h-[64px] w-48 rounded-xl animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
          <div className="h-[24px] w-80 rounded-lg animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
        </div>

        {/* Alphabet Filter Skeleton */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-[44px] w-[44px] rounded-full animate-pulse" style={{ backgroundColor: '#EFEFEF' }} />
          ))}
        </div>

        {/* Search & Sort Skeleton */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="h-[50px] flex-1 max-w-md rounded-xl animate-pulse" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFEF' }} />
          <div className="h-[50px] w-32 rounded-xl animate-pulse" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFEF' }} />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl animate-pulse"
              style={{ backgroundColor: '#FFF9EF', border: '1px solid #EFEFEF' }}
            >
              <div className="flex flex-col gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: '#FEEBCE' }} />
                {/* Name */}
                <div className="h-6 w-3/4 rounded-lg" style={{ backgroundColor: '#EFEFEF' }} />
                {/* Meta */}
                <div className="flex gap-4">
                  <div className="h-4 w-24 rounded-lg" style={{ backgroundColor: '#EFEFEF' }} />
                  <div className="h-4 w-20 rounded-lg" style={{ backgroundColor: '#EFEFEF' }} />
                </div>
                {/* Button */}
                <div className="h-[40px] w-full rounded-lg mt-2" style={{ backgroundColor: '#FFFFFF', border: '1px solid #C4C4C3' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}