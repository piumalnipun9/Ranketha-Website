import Script from 'next/script'

interface ProductJsonLdProps {
  product: {
    id: string
    name: string
    description?: string
    image?: string | string[]
    price: number
    sku?: string
    brand?: { name: string } | string
    category?: { name: string } | string
    stockQuantity?: number
    rating?: number
    reviews?: number
  }
  url: string
}

export function ProductJsonLd({ product, url }: ProductJsonLdProps) {
  const images = Array.isArray(product.image)
    ? product.image
    : product.image
      ? [product.image]
      : []

  // Normalize and clean image URLs: make absolute, strip query/hash, and drop placeholders
  const processedImages = Array.from(
    new Set(
      images
        .map((img) => (img?.startsWith('http') ? img : img ? `https://roboclub.lk${img}` : ''))
        .filter(Boolean)
        .map((img) => img.split('?')[0])
        .map((img) => img.split('#')[0])
        // Exclude SVGs (not ideal for Google Shopping), placeholders, and logos
        .filter((img) => !img.toLowerCase().endsWith('.svg'))
        .filter((img) => !/placeholder\.(jpg|png)$/i.test(img))
        .filter((img) => !/logo/i.test(img))
    )
  ) as string[]

  // Handle brand which could be a string or object
  const brandName = typeof product.brand === 'string'
    ? product.brand
    : product.brand?.name

  // Handle category which could be a string or object
  const categoryName = typeof product.category === 'string'
    ? product.category
    : product.category?.name

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Buy ${product.name} online at RoboClub`,
    image: processedImages.length > 0 ? processedImages : undefined,
    sku: product.sku,
    mpn: product.id,
    brand: brandName
      ? {
        '@type': 'Brand',
        name: brandName
      }
      : undefined,
    category: categoryName,
    offers: {
      '@type': 'Offer',
      url: url,
      priceCurrency: 'LKR',
      price: Number(product.price).toFixed(2),
      availability:
        product.stockQuantity === 0
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'RoboClub'
      }
    },
    ...(product.rating && product.rating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews || 1
      }
    })
  }

  return (
    <Script
      id={`product-jsonld-${product.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
