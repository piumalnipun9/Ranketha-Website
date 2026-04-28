import { Navigation } from "@/components/home/Navigation"
import { HeroSection } from "@/components/home/HeroSection"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { NewsletterSection } from "@/components/home/NewsletterSection"
import { Footer } from "@/components/home/Footer"
import { mockProducts } from "@/lib/constants"

import type { Product as FeaturedCardProduct } from "@/lib/constants"

const FEATURED_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL || '/api'}/products/featured`

const FALLBACK_PRODUCTS = mockProducts.slice(0, 8)

async function getFeaturedProducts(): Promise<FeaturedCardProduct[]> {
  if (!FEATURED_ENDPOINT) {
    return FALLBACK_PRODUCTS
  }

  try {
    const response = await fetch(FEATURED_ENDPOINT, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch featured products: ${response.status}`)
    }

    const data = await response.json()
    const mapped: FeaturedCardProduct[] = (Array.isArray(data) ? data : []).map((p: any, index: number) => {
      const parsedId = typeof p.id === 'number' ? p.id : Number.parseInt(p.id, 10)
      return {
        id: Number.isFinite(parsedId) ? parsedId : index + 1,
        name: p.name || '',
        price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
        image: (Array.isArray(p.imageUrls) && p.imageUrls[0]) || p.imageUrl || '/placeholder.svg',
        category: p.category?.name || p.categories?.[0]?.category?.name || p.categories?.[0]?.name || 'Uncategorized',
        description: p.description || '',
        rating: p.rating || 4.8,
        reviews: p.reviews || 120,
        brand: p.brand?.name || 'Local Farm',
        inStock: (p.stockQuantity ?? 0) > 0,
        sku: p.sku || undefined,
        ...(p.itemCode ? { itemCode: p.itemCode } : {}),
        ...(p.slug ? { slug: p.slug } : {}),
      }
    })

    return mapped.length ? mapped : FALLBACK_PRODUCTS
  } catch (error) {
    console.error('Failed to load featured products', error)
    return FALLBACK_PRODUCTS
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFEFCC] to-[#EBEDF1]">
      <Navigation />
      <HeroSection />
      <FeaturedProducts products={featuredProducts} />
      <NewsletterSection />
      <Footer />
    </div>
  )
}