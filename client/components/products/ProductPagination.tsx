"use client"

import { Button } from "@/components/ui/button"

interface ProductPaginationProps {
  currentPage: number
  totalPages: number
  filteredProducts: any[]
  startIndex: number
  endIndex: number
  setCurrentPage: (page: number) => void
}

export function ProductPagination({
  currentPage,
  totalPages,
  filteredProducts,
  startIndex,
  endIndex,
  setCurrentPage,
}: ProductPaginationProps) {
  return (
    <div className="mt-12 flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="bg-white/80"
        >
          Previous
        </Button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 p-0 ${currentPage === pageNum ? "" : "bg-white/80"}`}
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="bg-white/80"
        >
          Next
        </Button>
      </div>

      <p className="text-sm text-slate-500">
        Page {currentPage} of {totalPages} • Showing {startIndex + 1}-
        {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
      </p>
    </div>
  )
}