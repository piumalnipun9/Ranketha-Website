"use client"

import { ProductCard } from "@/components/products/ProductCard"

// Re-defining Product interface to match ProductCard and Prisma schema
interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  datasheetUrl?: string;
  imageUrls: string[];
  sku?: string;
  price: number;
  buyingPrice?: number;
  stockQuantity: number;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ProductsGridProps {
  products: Product[]
  viewMode: "grid" | "list"
}

export function ProductsGrid({ products, viewMode }: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found.</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters.</p>
      </div>
    )
  }

  return (
    <div className={`grid gap-16 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${products.length < 5 ? '' : 'min-h-[500px]'}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}