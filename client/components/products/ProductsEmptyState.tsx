"use client"

import { Button } from "@/components/ui/button"

interface ProductsEmptyStateProps {
  setSearchQuery: (value: string) => void
  setSelectedCategory: (value: string) => void
  setSelectedBrand: (value: string) => void
  setPriceRange: (value: number[]) => void
}

export function ProductsEmptyState({
  setSearchQuery,
  setSelectedCategory,
  setSelectedBrand,
  setPriceRange,
}: ProductsEmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
      <p className="text-slate-600 mb-6">Try adjusting your search or filter criteria</p>
      <Button
        onClick={() => {
          setSearchQuery("")
          setSelectedCategory("All")
          setSelectedBrand("All")
          setPriceRange([0, 100])
        }}
      >
        Clear All Filters
      </Button>
    </div>
  )
}