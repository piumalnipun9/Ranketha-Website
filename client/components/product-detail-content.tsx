"use client"

import { useState } from "react"
import { Heart, Share2, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { useCartStore } from "@/lib/cart-store"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/home/Navigation"
import { Footer } from "@/components/home/Footer"
import { ProductFAQ } from "@/components/product-faq"

export function ProductDetailContent({
  product,
  breadcrumb
}: {
  product: any;
  breadcrumb?: React.ReactNode;
}) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const router = useRouter()
  const { addItem } = useCartStore()

  // Normalize stock quantity (guard against null/undefined/negative)
  const stockQtyRaw: number = typeof product?.stockQuantity === 'number' ? product.stockQuantity : Number(product?.stockQuantity || 0)
  const stockQty: number = Number.isFinite(stockQtyRaw) ? Math.max(0, Math.floor(stockQtyRaw)) : 0
  const inStock = stockQty > 0
  const maxQty = inStock ? stockQty : 1

  const handleBuyNow = async () => {
    if (!inStock) return
    const clampedQty = Math.min(Math.max(1, quantity), maxQty)
    const cartProduct = {
      id: String(product.id || ""),
      name: product.name || "Product",
      price: typeof product.price === 'number' ? product.price : 0,
      image: product.image || "/placeholder.svg",
    }
    try {
      await addItem(cartProduct, clampedQty)
      router.push('/checkout')
    } catch (e) {
      console.error('Buy Now failed:', e)
    }
  }
  // Use provided imageUrls when available; fall back to single image or placeholder
  const images: string[] = Array.isArray(product?.imageUrls) && product.imageUrls.length > 0
    ? product.imageUrls
    : [product?.image || "/placeholder.svg"]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="my-4 md:my-6 bg-white rounded-lg p-2 md:p-3 shadow-sm border border-[#072C2B]/10">
          {breadcrumb}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl p-8 flex items-center justify-center">
              <Image
                src={images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                width={1000}
                height={1000}
                className="object-contain max-w-full max-h-full"
              />
            </div>
            {images.length > 1 && (
              <div className="flex space-x-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg border-2 overflow-hidden ${selectedImage === index ? "border-[#FDCB00]" : "border-[#072C2B]/10"
                      }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      width={1000}
                      height={1000}
                      className="object-contain w-full h-full p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#072C2B] mb-1">{product.name}</h1>
              {product.itemCode && (
                <p className="text-sm text-[#072C2B]/50 mb-3">Item Code: {product.itemCode}</p>
              )}
              <p className="text-[#072C2B]/70 mb-4">{product.description}</p>
              {/* Reviews removed */}
            </div>

            <div className="border-t border-[#072C2B]/10 pt-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-bold text-[#072C2B]">LKR {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</span>
                <Badge variant={inStock ? "default" : "destructive"}>
                  {inStock ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 mb-6">
                <label className="text-sm font-medium text-[#072C2B]">Quantity:</label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, Math.min(q - 1, maxQty)))}
                    disabled={!inStock || quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={quantity}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, "")
                      if (digits === "") {
                        // Keep empty edits clamped to min on next blur
                        setQuantity(1)
                        return
                      }
                      const value = parseInt(digits, 10)
                      const clamped = Math.max(1, Math.min(value, maxQty))
                      setQuantity(clamped)
                    }}
                    onBlur={() => setQuantity((q) => Math.max(1, Math.min(q, maxQty)))}
                    disabled={!inStock}
                    className="mx-2 w-16 text-center border border-[#072C2B]/20 rounded-lg h-10 disabled:bg-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.max(1, Math.min(q + 1, maxQty)))}
                    disabled={!inStock || quantity >= maxQty}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {inStock && stockQty > 0 && (
                  <span className="text-xs text-[#072C2B]/50">Only {stockQty} left</span>
                )}
              </div>
              <div className="space-y-3">
                <AddToCartButton
                  product={{
                    id: product.id || 0,
                    name: product.name || 'Product',
                    price: typeof product.price === 'number' ? product.price : 0,
                    image: product.image || '/placeholder.svg',
                    category: product.category || 'Uncategorized',
                    brand: product.brand || 'Generic',
                    inStock: Boolean(product.inStock),
                    stockQuantity: typeof product.stockQuantity === 'number' ? product.stockQuantity : undefined,
                  }}
                  quantity={quantity}
                  className="w-full"
                  size="lg"
                />
                <Button
                  variant="outline"
                  className="w-full border-[#072C2B] text-[#072C2B] hover:bg-[#072C2B] hover:text-white bg-transparent"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={!inStock}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <Card className="bg-white border border-[#072C2B]/10">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-[#072C2B]">Product Description</h3>
              <p className="text-[#072C2B]/70 leading-relaxed">{product.longDescription}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="bg-white border border-[#072C2B]/10">
            <CardContent className="p-6">
              <ProductFAQ
                productName={product.name}
                category={product.category}
                brand={typeof product.brand === 'string' ? product.brand : product.brand?.name}
              />
            </CardContent>
          </Card>
        </div>

        {/* Related products section would go here */}

        {/* SEO-rich content section */}
        <div className="mt-8 bg-white p-6 rounded-lg border border-[#072C2B]/10">
          <h2 className="text-2xl font-bold mb-4 text-[#072C2B]">About {product.name}</h2>
          <div className="prose max-w-none text-[#072C2B]/70">
            <p>
              Looking to buy {product.name} in Sri Lanka? Ranketha offers premium quality
              {product.category ? ` ${product.category}` : ''} products
              {product.brand ? ` from ${typeof product.brand === 'string' ? product.brand : product.brand.name}` : ''}.
              We provide island-wide delivery and quality assurance on all our products.
            </p>
            <p className="mt-4">
              {product.name} is ideal for health-conscious customers looking for authentic,
              natural products in Sri Lanka. Shop online with confidence - all products come
              with quality guarantee and excellent customer support.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
