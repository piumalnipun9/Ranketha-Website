import type { Metadata } from "next";
import { Product } from "@/lib/api";
import { getRelevantKeywords } from "@/lib/product-keywords";

export function generateProductMeta(product: Product): Metadata {
  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
      robots: "noindex"
    };
  }

  // Build candidate images and pick a valid one for social previews
  const candidateImages: string[] = Array.isArray((product as any).imageUrls)
    ? (product as any).imageUrls
    : (product.imageUrls as any) || []
  const allCandidates = candidateImages
    .concat(product.imageUrl ? [product.imageUrl] : [])
    .filter(Boolean) as string[]
  const cleanedCandidates = Array.from(new Set(
    allCandidates
      .map((u) => u.split('?')[0])
      .map((u) => u.split('#')[0])
      .filter((u) => !u.toLowerCase().endsWith('.svg'))
      .filter((u) => !/placeholder\.(png|jpg)$/i.test(u))
      .filter((u) => !/logo/i.test(u))
      .map((u) => (u.startsWith('http') ? u : `https://roboclub.lk${u}`))
  ))
  const absoluteImageUrl = cleanedCandidates[0] || 'https://roboclub.lk/og-image.jpg'
  // Create a product-specific structured data
  const slug = product.slug || product.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || product.id;
  const productUrl = `https://roboclub.lk/products/product/${slug}`;

  // Create a meaningful description including product details
  const brandInfo = product.brand?.name ? `by ${product.brand.name}` : '';
  const categoryInfo = product.category?.name ? `in ${product.category.name}` : '';
  const stockInfo = product.stockQuantity > 0 ? 'In stock' : 'Limited stock';
  const priceInfo = `LKR ${product.price.toLocaleString()}`;

  const shortDescription = product.description
    ? product.description.substring(0, 150) + (product.description.length > 150 ? '...' : '')
    : '';

  const metaDescription = `${product.name} ${brandInfo} ${categoryInfo}. ${shortDescription} ${stockInfo}, ${priceInfo}. Buy online in Sri Lanka from RoboClub.`.trim();

  // Get relevant keywords for this product
  const seoKeywords = getRelevantKeywords(
    product.name,
    product.category?.name || undefined
  ).join(', ');

  // Title optimized for queries like "<Product> price in Sri Lanka"
  const titlePrice = product.price ? ` | ${priceInfo}` : '';

  return {
    title: `${product.name} Price in Sri Lanka${titlePrice} | Buy Online | RoboClub`,
    description: metaDescription,
    keywords: seoKeywords,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.name} Price in Sri Lanka${titlePrice} | RoboClub`,
      description: metaDescription,
      url: productUrl,
      images: [
        {
          url: absoluteImageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'website', // Next.js metadata doesn't support 'product' type directly
      siteName: 'RoboClub',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} Price in Sri Lanka${titlePrice} | RoboClub`,
      description: metaDescription.substring(0, 200),
      images: [absoluteImageUrl],
    },
    other: {
      'product:price:amount': product.price ? Number(product.price).toFixed(2) : '0.00',
      'product:price:currency': 'LKR',
      'product:availability': product.stockQuantity > 0 ? 'in stock' : 'out of stock',
      'product:brand': product.brand?.name || '',
      'product:condition': 'new',
      'product:retailer_item_id': product.itemCode || product.sku || '',
    }
  };
}
