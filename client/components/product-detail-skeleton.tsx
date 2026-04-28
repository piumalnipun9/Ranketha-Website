"use client"

import { Navigation } from "@/components/home/Navigation"
import { Footer } from "@/components/home/Footer"

export function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
                {/* Breadcrumb skeleton */}
                <div className="my-4 md:my-6 bg-white rounded-lg p-2 md:p-3 shadow-sm border border-[#072C2B]/10">
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image skeleton */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-[#072C2B]/5 rounded-2xl animate-pulse"></div>
                        <div className="flex space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    </div>

                    {/* Product info skeleton */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                                <div className="flex space-x-2">
                                    <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                            </div>
                        </div>

                        <div className="border-t border-[#072C2B]/10 pt-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                            </div>
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                                <div className="flex items-center">
                                    <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-10 w-16 bg-gray-200 rounded mx-2 animate-pulse"></div>
                                    <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-12 bg-[#072C2B]/10 rounded animate-pulse"></div>
                                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description skeleton */}
                <div className="mt-16 bg-white rounded-lg border border-[#072C2B]/10 p-6">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
