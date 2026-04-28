"use client"

import { useState, useEffect } from 'react'
import { Navigation } from "@/components/home/Navigation"
import { Footer } from "@/components/home/Footer"
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProducts } from '@/lib/api'

export default function ElectronicsGuideHub() {
  const [popularProducts, setPopularProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const products = await getProducts()
        // Get featured or top products
        const featured = products
          .filter(p => p.isFeatured)
          .slice(0, 10)
        setPopularProducts(featured)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">
          Ultimate Guide to Electronics Components in Sri Lanka
        </h1>
        
        <div className="prose max-w-4xl mx-auto mb-12">
          <p className="lead text-xl text-gray-700 mb-6">
            Looking for the best electronics components in Sri Lanka? This comprehensive guide covers 
            everything you need to know about buying Arduino boards, Raspberry Pi, sensors, development boards,
            and other electronic components in Sri Lanka.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Finding Quality Electronics in Sri Lanka</h2>
          <p>
            Whether you're a student, hobbyist, or professional engineer, finding reliable electronic
            components in Sri Lanka has traditionally been challenging. RoboClub aims to solve this 
            problem by offering a wide selection of premium quality components with island-wide delivery.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Popular Electronics Categories</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Arduino Boards</strong> - Perfect for beginners and experienced makers alike,
              Arduino boards are the foundation of many electronics projects.
            </li>
            <li>
              <strong>Raspberry Pi</strong> - These powerful single-board computers can run full
              operating systems and are ideal for advanced projects.
            </li>
            <li>
              <strong>Sensors</strong> - From temperature and humidity to motion and distance, sensors
              allow your projects to interact with the physical world.
            </li>
            <li>
              <strong>Development Boards</strong> - ESP32, ESP8266, STM32, and other development boards
              offer various capabilities for IoT and embedded projects.
            </li>
            <li>
              <strong>Passive Components</strong> - Resistors, capacitors, diodes, and other basic
              components are essential for any electronics work.
            </li>
          </ul>
        </div>
        
        <h2 className="text-2xl font-semibold text-center mb-6">
          Popular Electronics Products in Sri Lanka
        </h2>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {popularProducts.map((product: any) => {
              const slug = product.slug || product.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || product.id;
              return (
                <Link 
                  href={`/products/product/${slug}`}
                  key={product.id}
                  className="transition-transform hover:-translate-y-1"
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-2">
                        {product.category?.name || 'Electronics'}
                      </p>
                      <p className="font-medium text-blue-600">
                        LKR {product.price?.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
        
        <div className="prose max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mt-8 mb-4">Electronics Shopping Tips for Sri Lanka</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Check for authenticity</strong> - Always buy from trusted retailers to ensure
              you're getting genuine components.
            </li>
            <li>
              <strong>Verify compatibility</strong> - Make sure the components you buy will work
              together in your project.
            </li>
            <li>
              <strong>Consider shipping costs</strong> - Some retailers offer free shipping on orders
              over a certain amount (RoboClub offers free shipping on orders over LKR 10,000).
            </li>
            <li>
              <strong>Check stock availability</strong> - Electronics can go out of stock quickly,
              so check if the product is available before planning your project.
            </li>
            <li>
              <strong>Look for warranty</strong> - Quality electronics should come with a warranty
              for peace of mind.
            </li>
          </ol>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Getting Started with Electronics in Sri Lanka</h2>
          <p>
            If you're new to electronics, we recommend starting with an Arduino starter kit or
            basic components like LEDs, resistors, and breadboards. These will allow you to build
            simple circuits and gain confidence before moving on to more complex projects.
          </p>
          
          <div className="bg-blue-50 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-semibold mb-2">Ready to start your electronics journey?</h3>
            <p className="mb-4">
              Browse our complete selection of electronics components, development boards, and
              maker supplies with island-wide delivery in Sri Lanka.
            </p>
            <Link 
              href="/products"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              Shop Electronics Now
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
