"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronLeft, ChevronRight, Play, Pause, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { useState, useEffect } from "react"
import { Product } from "@/lib/constants"

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const totalSlides = Math.ceil(products.length / 8)

  // Auto-play slideshow
  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlay, totalSlides])

  const nextSlide = () => {
    setCurrentSlide(currentSlide === totalSlides - 1 ? 0 : currentSlide + 1)
  }

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? totalSlides - 1 : currentSlide - 1)
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#FDCB00]/20 border border-[#FDCB00]/30 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#072C2B]" />
            <span className="text-[#072C2B] text-sm font-medium">Handpicked for You</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#072C2B] mb-4">Featured Products</h2>
          <p className="text-lg text-[#072C2B]/70 max-w-2xl mx-auto">
            Discover our bestselling traditional rice, pure honey, and handcrafted treasures
          </p>
        </div>

        {/* Slideshow Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-[#FDCB00] shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110 group"
            aria-label="Previous products"
          >
            <ChevronLeft className="h-6 w-6 text-[#072C2B] group-hover:text-[#072C2B]" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-[#FDCB00] shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110 group"
            aria-label="Next products"
          >
            <ChevronRight className="h-6 w-6 text-[#072C2B] group-hover:text-[#072C2B]" />
          </button>

          {/* Slideshow Content */}
          <div className="overflow-hidden rounded-2xl mx-8">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
                    {products.slice(slideIndex * 8, (slideIndex + 1) * 8).map((product) => (
                      <Card
                        key={product.id}
                        className="group hover:shadow-xl transition-all duration-300 border border-[#072C2B]/5 bg-white overflow-hidden card-hover"
                      >
                        <CardContent className="p-0">
                          <Link href={`/products/product/${(product as any).slug || product.id}`}>
                            <div className="aspect-square bg-[#EFEFCC] flex items-center justify-center overflow-hidden cursor-pointer relative" style={{ minHeight: 120, maxHeight: 300 }}>
                              {product.discount && (
                                <div className="absolute top-2 left-2 z-10">
                                  <Badge className="bg-[#FDCB00] text-[#072C2B] font-bold">
                                    -{product.discount}%
                                  </Badge>
                                </div>
                              )}
                              <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                width={300}
                                height={300}
                                unoptimized
                                className="object-contain group-hover:scale-110 transition-transform duration-300 p-4"
                              />
                            </div>
                          </Link>

                          <div className="p-4">
                            <Badge
                              variant="secondary"
                              className="mb-2 text-xs bg-[#072C2B]/5 text-[#072C2B] hover:bg-[#072C2B]/10"
                            >
                              {product.category}
                            </Badge>

                            <Link href={`/products/product/${(product as any).slug || product.id}`}>
                              <h3 className="text-sm font-bold text-[#072C2B] mb-2 transition-colors cursor-pointer line-clamp-2">
                                {product.name}
                              </h3>
                            </Link>

                            <p className="text-[#072C2B]/60 mb-3 line-clamp-2 text-xs leading-relaxed">{product.description}</p>

                            {Boolean((product as any).itemCode) && (
                              <p className="text-[11px] text-[#072C2B]/50 mb-2">Item Code: {(product as any).itemCode}</p>
                            )}

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-3">
                              <Star className="w-4 h-4 fill-[#FDCB00] text-[#FDCB00]" />
                              <span className="text-sm font-medium text-[#072C2B]">{product.rating}</span>
                              <span className="text-xs text-[#072C2B]/50">({product.reviews})</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-lg font-bold text-[#072C2B]">
                                  Rs. {product.price.toLocaleString()}
                                </span>
                                {product.discount && (
                                  <span className="text-xs text-[#072C2B]/50 line-through">
                                    Rs. {Math.round(product.price / (1 - product.discount / 100)).toLocaleString()}
                                  </span>
                                )}
                              </div>
                              {product.inStock ? (
                                <span className="text-xs text-green-600 font-medium">In Stock</span>
                              ) : (
                                <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${currentSlide === index ? "bg-[#FDCB00] scale-125" : "bg-[#072C2B]/20 hover:bg-[#072C2B]/40"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="flex justify-center mt-3">
            <span className="text-sm text-[#072C2B]/60">
              {currentSlide + 1} of {totalSlides}
            </span>
          </div>

          {/* Auto-play indicator */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${isAutoPlay
                ? "bg-[#FDCB00]/20 text-[#072C2B] hover:bg-[#FDCB00]/30"
                : "bg-[#072C2B]/10 text-[#072C2B] hover:bg-[#072C2B]/20"
                }`}
            >
              {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isAutoPlay ? "Pause" : "Play"} Slideshow</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/products">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 border-2 border-[#072C2B] text-[#072C2B] hover:bg-[#072C2B] hover:text-[#EFEFCC] font-semibold"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}