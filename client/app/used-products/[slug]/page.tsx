import { notFound } from "next/navigation"
import { Metadata } from "next"
import { ProductDetailContent } from "@/components/product-detail-content"
import { getProductBySlug, getProducts } from "@/lib/api"
import { slugify } from "@/lib/utils"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found."
    }
  }

  return {
    title: `${product.name} | RoboClub`,
    description: product.description,
    openGraph: {
      title: `${product.name} | RoboClub`,
      description: product.description,
      images: [
        {
          url: (product.imageUrls && product.imageUrls[0]) || product.imageUrl || "/placeholder.svg",
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return notFound()
  }

  // Add mock data for compatibility with the detail page component
  const enhancedProduct = {
    ...product,
    rating: product.rating || 4.8,
    reviews: product.reviews || 120,
    inStock: product.stockQuantity > 0,
    image: (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null) || product.imageUrl || "/placeholder.svg",
    longDescription: product.description,
    specifications: product.specifications || {
      "Type": "Electronic Component",
      "Brand": product.brand?.name || "Generic",
      "SKU": product.sku || "Unknown",
    },
  category: product.category?.name || "Uncategorized",
    brand: product.brand?.name || "Generic",
  }

  return <ProductDetailContent product={enhancedProduct} />
}
