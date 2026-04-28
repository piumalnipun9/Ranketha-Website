"use client"

import { useState, useEffect } from 'react'
import { Navigation } from "@/components/home/Navigation"
import { Footer } from "@/components/home/Footer"
import Breadcrumb from "@/components/breadcrumb"
import { getHomeBreadcrumb, getProductsBreadcrumb, getCategoryBreadcrumb } from "@/lib/breadcrumbs"

export default function TestBreadcrumbPage() {
  const [breadcrumbItems, setBreadcrumbItems] = useState([
    getHomeBreadcrumb(),
    getProductsBreadcrumb(),
    getCategoryBreadcrumb("Power Management", "power-management"),
    { 
      name: "LM 2596 Buck converters", 
      href: "/products/product/lm-2596-buck-converters" 
    }
  ])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="my-4 md:my-4 bg-white/70 backdrop-blur-sm rounded-lg p-2 md:p-3 shadow-sm mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Breadcrumb Test Page</h1>
          <p className="mb-4">This page demonstrates the updated breadcrumb navigation.</p>
          <p className="mb-4">When you click on "Power Management" in the breadcrumb above, it should take you to the products page with the "Power Management" category filter applied.</p>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Breadcrumb Behavior:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Home</strong> - Takes you to the homepage</li>
              <li><strong>Products</strong> - Takes you to the main products listing</li>
              <li><strong>Power Management</strong> - Takes you to the products page with "Power Management" category filter</li>
              <li><strong>LM 2596 Buck converters</strong> - Current page (not clickable)</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
