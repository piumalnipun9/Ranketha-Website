"use client"

import { Search, ArrowRight, Leaf, Droplets, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"


export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?query=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#072C2B] via-[#0a4a48] to-[#072C2B]" />

        {/* Honey drip decorations */}
        <div className="absolute top-0 left-1/4 w-2 h-20 bg-gradient-to-b from-[#FDCB00] to-transparent rounded-b-full opacity-60" />
        <div className="absolute top-0 left-1/3 w-3 h-32 bg-gradient-to-b from-[#FDCB00] to-transparent rounded-b-full opacity-40" />
        <div className="absolute top-0 right-1/4 w-2 h-24 bg-gradient-to-b from-[#FDCB00] to-transparent rounded-b-full opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#FDCB00]/20 border border-[#FDCB00]/30 rounded-full px-4 py-2 mb-6">
              <Leaf className="w-4 h-4 text-[#FDCB00]" />
              <span className="text-[#FDCB00] text-sm font-medium">100% Natural & Authentic</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#EBEDF1] mb-6 leading-tight">
              Taste the Tradition of
              <span className="block bg-gradient-to-r from-[#FDCB00] to-[#d4a800] bg-clip-text text-transparent">
                Sri Lankan Heritage
              </span>
            </h1>
            <p className="text-xl text-[#EBEDF1]/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover our premium collection of traditional rice varieties, pure organic honey,
              and handcrafted artisan products — sourced directly from local farmers and craftsmen.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#072C2B]/50 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for red rice, wild honey, handmade crafts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-28 py-6 text-lg rounded-full border-2 border-[#FDCB00]/30 bg-[#EFEFCC] text-[#072C2B] placeholder:text-[#072C2B]/50 focus:border-[#FDCB00] focus:ring-[#FDCB00]"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-6 py-2 h-10 bg-[#FDCB00] hover:bg-[#d4a800] text-[#072C2B] font-semibold"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-[#FDCB00] text-[#072C2B] hover:bg-[#d4a800] rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-[#FDCB00]/25 transition-all hover:shadow-xl hover:shadow-[#FDCB00]/30"
                >
                  Explore Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Highlights Section */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 pattern-grain" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#072C2B] mb-4">
              Our Premium Categories
            </h2>
            <p className="text-lg text-[#072C2B]/70 max-w-2xl mx-auto">
              Handpicked products that celebrate Sri Lanka's rich agricultural heritage and artisan traditions.
            </p>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Rice Card */}
            <Link href="/products?category=rice" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 card-hover border border-[#072C2B]/5">
                <div className="w-16 h-16 bg-[#FDCB00]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FDCB00]/30 transition-colors">
                  <Leaf className="w-8 h-8 text-[#072C2B]" />
                </div>
                <h3 className="text-xl font-bold text-[#072C2B] mb-3">Traditional Rice</h3>
                <p className="text-[#072C2B]/70 mb-4">
                  Authentic Sri Lankan rice varieties including red rice, samba, and heritage grains grown using traditional methods.
                </p>
                <span className="inline-flex items-center text-[#072C2B] font-semibold group-hover:gap-2 transition-all">
                  Shop Rice <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </Link>

            {/* Honey Card */}
            <Link href="/products?category=honey" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 card-hover border border-[#072C2B]/5">
                <div className="w-16 h-16 bg-[#FDCB00]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FDCB00]/30 transition-colors">
                  <Droplets className="w-8 h-8 text-[#072C2B]" />
                </div>
                <h3 className="text-xl font-bold text-[#072C2B] mb-3">Pure Honey</h3>
                <p className="text-[#072C2B]/70 mb-4">
                  100% pure, raw honey sourced from local beekeepers. Unprocessed and packed with natural goodness.
                </p>
                <span className="inline-flex items-center text-[#072C2B] font-semibold group-hover:gap-2 transition-all">
                  Shop Honey <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </Link>

            {/* Arts & Crafts Card */}
            <Link href="/products?category=art-crafts" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 card-hover border border-[#072C2B]/5">
                <div className="w-16 h-16 bg-[#FDCB00]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FDCB00]/30 transition-colors">
                  <Palette className="w-8 h-8 text-[#072C2B]" />
                </div>
                <h3 className="text-xl font-bold text-[#072C2B] mb-3">Art & Crafts</h3>
                <p className="text-[#072C2B]/70 mb-4">
                  Beautifully handcrafted items by skilled local artisans. Each piece tells a story of tradition.
                </p>
                <span className="inline-flex items-center text-[#072C2B] font-semibold group-hover:gap-2 transition-all">
                  Shop Crafts <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="bg-[#072C2B] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-[#FDCB00] mb-2">100%</div>
              <div className="text-[#EBEDF1]/70 text-sm">Organic Products</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-[#FDCB00] mb-2">500+</div>
              <div className="text-[#EBEDF1]/70 text-sm">Happy Customers</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-[#FDCB00] mb-2">50+</div>
              <div className="text-[#EBEDF1]/70 text-sm">Local Farmers</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-[#FDCB00] mb-2">24/7</div>
              <div className="text-[#EBEDF1]/70 text-sm">Customer Support</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
