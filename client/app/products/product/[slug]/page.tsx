import { notFound } from "next/navigation"
import { Metadata } from "next"
import { ProductDetailContent } from "@/components/product-detail-content"
import { getProductBySlug, getProducts } from "@/lib/api"
import { slugify } from "@/lib/utils"
import { ProductJsonLd } from "@/components/product-jsonld"
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld"
import Breadcrumb from "@/components/breadcrumb"
import { generateProductMeta } from "./generateProductMeta"
import { getProductPageBreadcrumbs, getBreadcrumbJsonLdItems } from "@/lib/breadcrumbs"

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
      description: "The requested product could not be found.",
      robots: "noindex", // tells Google not to index this page
    };
  }

  return generateProductMeta(product)
}

// Always serve fresh product page to reflect latest stock levels
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return notFound()
  }

  // Add mock data for compatibility with the detail page component
  const enhancedProduct = {
    ...product,
    inStock: product.stockQuantity > 0,
    // Prefer first non-SVG/non-placeholder image
    image: (
      (product.imageUrls && product.imageUrls.find((u) => u && !u.toLowerCase().endsWith('.svg') && !/placeholder\.(png|jpg)$/i.test(u) && !/logo/i.test(u)))
      || (product.imageUrl && !product.imageUrl.toLowerCase().endsWith('.svg') && !/placeholder\.(png|jpg)$/i.test(product.imageUrl) && !/logo/i.test(product.imageUrl) ? product.imageUrl : null)
      || "/placeholder.jpg"
    ),
    longDescription: product.description,
    category: product.category?.name || "Uncategorized",
    brand: product.brand?.name || "Generic",
    itemCode: (product as any).itemCode || undefined,
  }

  const productUrl = `/products/product/${params.slug}`

  // Build a list of candidate images for JSON-LD and UI, filter to valid types
  const candidateImages: string[] = Array.isArray(product.imageUrls) ? product.imageUrls : []
  const rawCandidates: string[] = [
    ...candidateImages,
    ...(product.imageUrl ? [product.imageUrl] : [])
  ]
  const validImages: string[] = rawCandidates
    .filter((u): u is string => typeof u === 'string' && u.length > 0)
    .map((u) => u.split('?')[0])
    .map((u) => u.split('#')[0])
    .filter((u) => !u.toLowerCase().endsWith('.svg'))
    .filter((u) => !/placeholder\.(png|jpg)$/i.test(u))
    .filter((u) => !/logo/i.test(u))
    .map((u) => (u.startsWith('http') ? u : `https://ranketha.lk${u}`))
    // Ensure enhancedProduct has imageUrls for UI gallery
    ; (enhancedProduct as any).imageUrls = validImages.length > 0 ? validImages : [enhancedProduct.image]
  const categoryName = product.category?.name || "Uncategorized"
  const breadcrumbItems = getProductPageBreadcrumbs(
    product.name,
    params.slug,
    categoryName,
    // pass undefined slug, we now build links using the category name
    undefined
  )

  return (
    <>
      <ProductJsonLd
        product={{
          ...enhancedProduct,
          image: (enhancedProduct as any).imageUrls
        }}
        url={`https://ranketha.lk${productUrl}`}
      />
      <BreadcrumbJsonLd
        items={getBreadcrumbJsonLdItems(breadcrumbItems)}
      />
      <ProductDetailContent
        product={enhancedProduct}
        breadcrumb={<Breadcrumb items={breadcrumbItems} />}
      />
    </>
  )
}
