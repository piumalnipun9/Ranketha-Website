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

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Ranketha'
  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-[#072C2B]/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <Link href="/">
            <div className="flex items-center space-x-3">
              <Image
                src="/companyLogo.svg"
                alt={`${companyName} Logo`}
                width={100}
                height={80}
                className="object-contain w-35 h-24"
              />
            </div>
          </Link>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70 ${isActive('/') ? 'underline underline-offset-4' : ''}`}>
              Home
            </Link>
            <Link href="/products" className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70 ${isActive('/products') ? 'underline underline-offset-4' : ''}`}>
              Products
            </Link>
            <Link href="/about-us" className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70 ${isActive('/about-us') ? 'underline underline-offset-4' : ''}`}>
              About Us
            </Link>
            <CartIcon className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70 ${isActive('/cart') ? 'underline underline-offset-4' : ''}`} />

            {isLoggedIn ? (
              <>
                <Link href="/my-account" className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70 ${isActive('/my-account') ? 'underline underline-offset-4' : ''}`}>
                  My Account
                </Link>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="border-[#072C2B] text-[#072C2B] hover:bg-[#072C2B] hover:text-[#EBEDF1]"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-[#FDCB00] hover:bg-[#FFD737] text-[#072C2B] font-semibold"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#072C2B] text-[#072C2B] hover:bg-[#072C2B] hover:text-[#EBEDF1]"
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70 ${isActive('/admin') ? 'underline underline-offset-4' : ''}`}>
                Admin
              </Link>
            )}
            {user?.role === 'SELLER' && (
              <Link href="/seller" className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70 ${isActive('/seller') ? 'underline underline-offset-4' : ''}`}>
                Seller Dashboard
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <CartIcon className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70`} showText={false} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#072C2B] hover:bg-[#072C2B]/10"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#072C2B]/10">
            <div className="flex flex-col space-y-4">
              <Link href="/" className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70 ${isActive('/') ? 'underline underline-offset-4' : ''}`}>
                Home
              </Link>
              <Link href="/products" className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70 ${isActive('/products') ? 'underline underline-offset-4' : ''}`}>
                Products
              </Link>
              <Link href="/about-us" className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70 ${isActive('/about-us') ? 'underline underline-offset-4' : ''}`}>
                About Us
              </Link>
              {isLoggedIn ? (
                <>
                  <Link href="/my-account" className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70 ${isActive('/my-account') ? 'underline underline-offset-4' : ''}`}>
                    My Account
                  </Link>
                  <Button
                    onClick={logout}
                    variant="outline"
                    size="sm"
                    className="w-fit border-[#072C2B] text-[#072C2B] hover:bg-[#072C2B] hover:text-[#EBEDF1]"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-fit bg-[#FDCB00] hover:bg-[#d4a800] text-[#072C2B] font-semibold"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit border-[#072C2B] text-[#072C2B] hover:bg-[#072C2B] hover:text-[#EBEDF1]"
                    >
                      Register
                    </Button>
                  </Link>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70 ${isActive('/admin') ? 'underline underline-offset-4' : ''}`}>
                  Admin
                </Link>
              )}
              {user?.role === 'SELLER' && (
                <Link href="/seller" className={`font-medium transition-colors text-[#072C2B] hover:text-[#072C2B]/70 ${isActive('/seller') ? 'underline underline-offset-4' : ''}`}>
                  Seller Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
