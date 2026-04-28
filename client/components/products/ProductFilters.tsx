"use client"

import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductFiltersProps {
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
  showFilters: boolean
  setShowFilters: (value: boolean) => void
}

export function ProductFilters({
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
  showFilters,
  setShowFilters,
}: ProductFiltersProps) {
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="bg-white/80 backdrop-blur-sm"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>

      {showFilters && (
        <Card className="p-6 bg-white/80 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Brand</label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Price Range: LKR {priceRange[0]} - LKR {priceRange[1]}
              </label>
              <Slider value={priceRange} onValueChange={setPriceRange} max={100} step={1} className="mt-2" />
            </div>
          </div>
        </Card>
      )}
    </>
  )
}