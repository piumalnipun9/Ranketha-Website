"use client"

import { Search, Grid, List, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductFilters } from "@/components/products/ProductFilters"

interface ProductsNavigationProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  viewMode: "grid" | "list"
  setViewMode: (mode: "grid" | "list") => void
  showFilters: boolean
  setShowFilters: (value: boolean) => void
  categories: string[]
  brands: string[]
  selectedCategory: string
  setSelectedCategory: (value: string) => void
  selectedBrand: string
  setSelectedBrand: (value: string) => void
  sortBy: string
  setSortBy: (value: string) => void
  priceRange: number[]
  setPriceRange: (value: number[]) => void
}

export function ProductsNavigation({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  categories,
  brands,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
}: ProductsNavigationProps) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <ProductFilters
            categories={categories}
            brands={brands}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            sortBy={sortBy}
            setSortBy={setSortBy}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />

          {/* View Toggle */}
          <div className="flex border rounded-lg bg-white/80 backdrop-blur-sm">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}