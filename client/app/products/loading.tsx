import { Navigation } from "@/components/home/Navigation"
import { Footer } from "@/components/home/Footer"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb skeleton */}
        <div className="my-4 md:my-4 bg-white rounded-lg p-2 md:p-3 shadow-sm border border-[#072C2B]/10 mb-6">
          <div className="h-4 bg-[#072C2B]/10 rounded w-48 animate-pulse"></div>
        </div>

        {/* Page Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-[#072C2B]/10 rounded w-40 mb-2 animate-pulse"></div>
          <div className="h-4 bg-[#072C2B]/10 rounded w-96 animate-pulse"></div>
        </div>

        {/* Search bar skeleton */}
        <div className="mb-6">
          <div className="h-12 bg-[#072C2B]/5 rounded-lg w-full animate-pulse"></div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-[#072C2B]/10 overflow-hidden">
              <div className="aspect-square bg-[#072C2B]/5"></div>
              <div className="p-4">
                <div className="h-4 bg-[#072C2B]/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[#072C2B]/10 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-[#072C2B]/10 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
