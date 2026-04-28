import { Navigation } from "@/components/home/Navigation"
import { Footer } from "@/components/home/Footer"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header - Skeleton */}
        <div className="mb-8">
          <div className="w-1/2 h-10 bg-gray-200 rounded-md animate-pulse mb-2"></div>
          <div className="w-3/4 h-6 bg-gray-200 rounded-md animate-pulse"></div>
        </div>

        {/* Search and Filters - Skeleton */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-1/3 h-10 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="w-full md:w-1/4 h-10 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="w-full md:w-1/4 h-10 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Products Grid - Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-2/3 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded-md animate-pulse w-1/3 mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
