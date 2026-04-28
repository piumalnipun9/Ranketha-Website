import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Ranketha'

  return (
    <footer className="bg-[#072C2B] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">

            <Image
              src="/companyLogoLight.svg"
              alt={`${companyName} Logo`}
              width={400}
              height={200}
              className="object-contain w-40 h-24"
            />


            <p className="text-[#EBEDF1]/70 mb-6 leading-relaxed">
              Your trusted source for authentic Sri Lankan traditional rice, pure organic honey,
              and handcrafted artisan products. We bring nature's best directly to your doorstep.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#EBEDF1]/10 rounded-full flex items-center justify-center hover:bg-[#FDCB00] hover:text-[#072C2B] transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#EBEDF1]/10 rounded-full flex items-center justify-center hover:bg-[#FDCB00] hover:text-[#072C2B] transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#EBEDF1]/10 rounded-full flex items-center justify-center hover:bg-[#FDCB00] hover:text-[#072C2B] transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#FDCB00]">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-[#EBEDF1]/70 hover:text-[#FDCB00] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FDCB00] rounded-full" />
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=rice" className="text-[#EBEDF1]/70 hover:text-[#FDCB00] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FDCB00] rounded-full" />
                  Traditional Rice
                </Link>
              </li>
              <li>
                <Link href="/products?category=honey" className="text-[#EBEDF1]/70 hover:text-[#FDCB00] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FDCB00] rounded-full" />
                  Pure Honey
                </Link>
              </li>
              <li>
                <Link href="/products?category=art-crafts" className="text-[#EBEDF1]/70 hover:text-[#FDCB00] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FDCB00] rounded-full" />
                  Art & Crafts
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-[#EBEDF1]/70 hover:text-[#FDCB00] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FDCB00] rounded-full" />
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#FDCB00]">Customer Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help-center" className="text-[#EBEDF1]/70 hover:text-[#FDCB00] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FDCB00] rounded-full" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/shipping-info" className="text-[#EBEDF1]/70 hover:text-[#FDCB00] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FDCB00] rounded-full" />
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-[#EBEDF1]/70 hover:text-[#FDCB00] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FDCB00] rounded-full" />
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="text-[#EBEDF1]/70 hover:text-[#FDCB00] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FDCB00] rounded-full" />
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#FDCB00]">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#FDCB00] mt-0.5 flex-shrink-0" />
                <a href="mailto:info@ranketha.lk" className="text-[#EBEDF1]/70 hover:text-[#FDCB00] transition-colors">
                  info@ranketha.lk
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#FDCB00] mt-0.5 flex-shrink-0" />
                <a href="tel:+94713430510" className="text-[#EBEDF1]/70 hover:text-[#FDCB00] transition-colors">
                  +94 71 343 0510
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#FDCB00] mt-0.5 flex-shrink-0" />
                <span className="text-[#EBEDF1]/70">
                  Mon - Sat: 9AM - 6PM
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FDCB00] mt-0.5 flex-shrink-0" />
                <span className="text-[#EBEDF1]/70">
                  Sri Lanka
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#EBEDF1]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy-policy" className="text-[#EBEDF1]/50 hover:text-[#FDCB00] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[#EBEDF1]/50 hover:text-[#FDCB00] transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}