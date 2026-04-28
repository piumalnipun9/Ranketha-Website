"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CartIcon } from "@/components/cart-icon"
import { X, Menu } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isLoggedIn, user, logout } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Image src="/companyLogo.png" alt="RoboClub Logo" width={32} height={32} className="object-contain w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">
              RoboClub
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`font-medium transition-colors ${isActive('/') ? 'text-blue-600' : 'text-slate-700 hover:text-slate-900'}`}>
              Home
            </Link>
            <Link href="/products" className={`font-medium transition-colors ${isActive('/products') ? 'text-blue-600' : 'text-slate-700 hover:text-slate-900'}`}>
              Products
            </Link>
            <Link href="/projects" className={`font-medium transition-colors ${isActive('/projects') ? 'text-blue-600' : 'text-slate-700 hover:text-slate-900'}`}>
              Projects
            </Link>
            <CartIcon className={`font-medium transition-colors ${isActive('/cart') ? 'text-blue-600' : 'text-slate-700 hover:text-slate-900'}`} />
            
            {isLoggedIn ? (
              <>
                <Link href="/my-account" className={`font-medium transition-colors ${isActive('/my-account') ? 'text-blue-600' : 'text-slate-700 hover:text-slate-900'}`}>
                  My Account
                </Link>
                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className={`font-medium transition-colors ${isActive('/admin') ? 'text-blue-600' : 'text-slate-700 hover:text-slate-900'}`}>
                Admin
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col space-y-4">
              <Link href="/" className={`font-medium transition-colors ${isActive('/') ? 'text-blue-600' : 'text-slate-700 hover:text-slate-900'}`}>
                Home
              </Link>
              <Link href="/products" className={`font-medium transition-colors ${isActive('/products') ? 'text-blue-600' : 'text-slate-700 hover:text-slate-900'}`}>
                Products
              </Link>
              <Link href="/projects" className={`font-medium transition-colors ${isActive('/projects') ? 'text-blue-600' : 'text-slate-700 hover:text-slate-900'}`}>
                Projects
              </Link>
              <CartIcon className={`font-medium transition-colors ${isActive('/cart') ? 'text-blue-600' : 'text-slate-700 hover:text-slate-900'}`} showText={false} />
              
              {isLoggedIn ? (
                <>
                  <Link href="/my-account" className={`font-medium transition-colors ${isActive('/my-account') ? 'text-blue-600' : 'text-slate-700 hover:text-slate-900'}`}>
                    My Account
                  </Link>
                  <Button onClick={logout} variant="outline" size="sm" className="w-fit bg-transparent">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="default" size="sm" className="w-fit bg-blue-600 hover:bg-blue-700 text-white">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" size="sm" className="w-fit bg-transparent">
                      Register
                    </Button>
                  </Link>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className={`font-medium transition-colors ${isActive('/admin') ? 'text-blue-600' : 'text-slate-700 hover:text-slate-900'}`}>
                  Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}