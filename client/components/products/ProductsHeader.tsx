"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function ProductsHeader() {
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-4">
          <Link href="/" className="flex items-center text-slate-600 hover:text-blue-600 transition-colors mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">All Products</h1>
        <p className="text-slate-600 text-lg">
          Discover our complete collection of electronics and robotics components
        </p>
      </div>
    </div>
  )
}