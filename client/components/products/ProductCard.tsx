"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { slugify } from "@/lib/utils"
// import { Product } from "@/lib/constants" // Removed old import

// Re-defining Product interface to match the one in page.tsx
interface Product {
  id: string;
  name: string;
  slug?: string;  // Added slug field
  description?: string;
  datasheetUrl?: string;
  imageUrls: string[];
  imageUrl?: string;  // Add imageUrl field to support backend data
  sku?: string;
  itemCode?: string;
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
  // Legacy fallback
  categories?: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [qty, setQty] = useState(1)
  const maxQty = typeof product.stockQuantity === 'number' ? Math.max(0, product.stockQuantity) : undefined
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-[#072C2B]/10 bg-white flex flex-col" style={{ maxHeight: '400px' }}>
      <CardContent className="p-2 flex flex-col h-full">
        <Link href={`/products/product/${product.slug || slugify(product.name)}`}>
          <div className="aspect-square bg-[#EFEFCC] rounded-lg mb-2 flex items-center justify-center overflow-hidden relative cursor-pointer">
            <Image
              src={product.imageUrls?.[0] || product.imageUrl || "/placeholder.svg"} // Handle both imageUrls and imageUrl
              alt={product.name}
              width={200}
              height={200}
              className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
            {product.stockQuantity <= 0 && ( // Use stockQuantity
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive" className="text-xs">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>
        </Link>

        <Link href={`/products/product/${product.slug || slugify(product.name)}`}>
          <h3 className="text-sm font-semibold text-[#072C2B] mb-1 transition-colors line-clamp-2 cursor-pointer leading-tight">
            {product.name}
          </h3>
        </Link>

        <p className="text-[#072C2B]/60 mb-2 line-clamp-1 text-xs leading-tight">{product.description}</p>
        {product.itemCode && (
          <p className="text-[11px] text-[#072C2B]/50 -mt-1 mb-2">Item Code: {product.itemCode}</p>
        )}

        <div className="mt-auto pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#072C2B]">LKR {product.price.toFixed(2)}</span>
            <Input
              type="number"
              value={qty}
              min={1}
              {...(typeof maxQty === 'number' ? { max: Math.max(1, maxQty) } : {})}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                const base = isNaN(v) ? 1 : Math.max(1, v)
                setQty(typeof maxQty === 'number' ? Math.min(base, Math.max(1, maxQty)) : base)
              }}
              className="w-16 h-8 text-xs text-center"
            />
          </div>
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: (product.imageUrls && product.imageUrls[0]) || product.imageUrl || '/placeholder.svg',
              category: product.category?.name || product.categories?.[0]?.category?.name || '',
              brand: product.brand?.name || '',
              inStock: product.stockQuantity > 0,
              stockQuantity: product.stockQuantity
            }}
            quantity={qty}
            className="w-full h-8 text-xs"
            size="sm"
            showIcon
          />
        </div>
      </CardContent>
    </Card>
  )
}