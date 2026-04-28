// AboutUs.tsx
// Page for About Us information - healthy food, traditional rice, and company story

import React from "react";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { Navigation } from "@/components/home/Navigation";
import { Footer } from "@/components/home/Footer";
import { Leaf, Heart, Shield, Users, Target, Eye } from "lucide-react";

const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Ranketha';

const AboutUs = () => {
  return (
    <>
      <Navigation />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "About Us", url: "/about-us" },
        ]}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#072C2B] via-[#0a4a48] to-[#072C2B] py-20">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-2 h-20 bg-gradient-to-b from-[#FDCB00] to-transparent rounded-b-full opacity-60" />
        <div className="absolute top-0 right-1/3 w-3 h-32 bg-gradient-to-b from-[#FDCB00] to-transparent rounded-b-full opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              About
              <span className="block bg-gradient-to-r from-[#FDCB00] to-[#d4a800] bg-clip-text text-transparent">
                {companyName}
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Bringing the authentic taste of Sri Lankan heritage to your table through traditional rice varieties,
              pure organic honey, and handcrafted artisan products.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="p-8 bg-white rounded-2xl border border-[#072C2B]/10 shadow-sm">
              <div className="w-16 h-16 bg-[#FDCB00]/20 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-[#072C2B]" />
              </div>
              <h2 className="text-2xl font-bold text-[#072C2B] mb-4">Our Mission</h2>
              <p className="text-[#072C2B]/70 leading-relaxed">
                To revive and preserve Sri Lanka's rich agricultural heritage by providing authentic,
                high-quality traditional food products while supporting local farming communities.
                We are committed to making healthy, natural food accessible to every Sri Lankan household,
                promoting wellness through the wisdom of our ancestors.
              </p>
            </div>

            {/* Vision */}
            <div className="p-8 bg-white rounded-2xl border border-[#072C2B]/10 shadow-sm">
              <div className="w-16 h-16 bg-[#FDCB00]/20 rounded-full flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-[#072C2B]" />
              </div>
              <h2 className="text-2xl font-bold text-[#072C2B] mb-4">Our Vision</h2>
              <p className="text-[#072C2B]/70 leading-relaxed">
                To become Sri Lanka's most trusted source for traditional, organic food products,
                leading the movement towards healthier eating habits while preserving our cultural
                food heritage for future generations. We envision a nation where every family enjoys
                the nutritional benefits of traditional rice and natural products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#072C2B] mb-6">Our Story</h2>
              <p className="text-[#072C2B]/70 mb-4 leading-relaxed">
                {companyName} was founded with a simple mission: to revive and preserve Sri Lanka's rich agricultural
                heritage by bringing traditional, healthy food products directly from local farmers to your home.
              </p>
              <p className="text-[#072C2B]/70 mb-4 leading-relaxed">
                We believe in the wisdom of our ancestors who cultivated rice varieties that not only fed generations
                but also promoted health and wellbeing. Today, we continue this legacy by sourcing the finest
                traditional rice, pure organic honey, and handcrafted products from across the island.
              </p>
              <p className="text-[#072C2B]/70 leading-relaxed">
                Every product we offer tells a story of tradition, quality, and sustainable farming practices
                passed down through generations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Image placeholders */}
              <div className="aspect-square bg-[#072C2B]/5 rounded-2xl flex items-center justify-center border border-[#072C2B]/10">
                <span className="text-[#072C2B]/50 text-sm">Rice Fields</span>
              </div>
              <div className="aspect-square bg-[#072C2B]/5 rounded-2xl flex items-center justify-center border border-[#072C2B]/10">
                <span className="text-[#072C2B]/50 text-sm">Honey Collection</span>
              </div>
              <div className="aspect-square bg-[#072C2B]/5 rounded-2xl flex items-center justify-center border border-[#072C2B]/10">
                <span className="text-[#072C2B]/50 text-sm">Local Farmers</span>
              </div>
              <div className="aspect-square bg-[#072C2B]/5 rounded-2xl flex items-center justify-center border border-[#072C2B]/10">
                <span className="text-[#072C2B]/50 text-sm">Handcrafts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traditional Rice Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              {/* Image placeholder */}
              <div className="aspect-[4/3] bg-[#072C2B]/5 rounded-2xl flex items-center justify-center border border-[#072C2B]/10">
                <span className="text-[#072C2B]/50">Traditional Rice Varieties</span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-[#FDCB00]/20 border border-[#FDCB00]/30 rounded-full px-4 py-2 mb-4">
                <Leaf className="w-4 h-4 text-[#072C2B]" />
                <span className="text-[#072C2B] text-sm font-medium">Healthy Living</span>
              </div>
              <h2 className="text-3xl font-bold text-[#072C2B] mb-6">The Power of Traditional Rice</h2>
              <p className="text-[#072C2B]/70 mb-4 leading-relaxed">
                Sri Lanka has over 2,000 traditional rice varieties, each with unique nutritional profiles and
                health benefits. Unlike polished white rice, our traditional varieties retain their bran layer,
                which is rich in fiber, vitamins, and minerals.
              </p>
              <ul className="space-y-3 text-[#072C2B]/70">
                <li className="flex items-start gap-2">
                  <Heart className="w-5 h-5 text-[#FDCB00] mt-1 flex-shrink-0" />
                  <span><strong>Suwandel:</strong> Known for its aromatic fragrance and easy digestibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-5 h-5 text-[#FDCB00] mt-1 flex-shrink-0" />
                  <span><strong>Kalu Heenati:</strong> Rich in antioxidants and helps maintain healthy blood sugar</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-5 h-5 text-[#FDCB00] mt-1 flex-shrink-0" />
                  <span><strong>Rathu Heenati:</strong> High in iron and perfect for those with anemia</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#072C2B] mb-4">Why Choose {companyName}?</h2>
            <p className="text-[#072C2B]/70 max-w-2xl mx-auto">
              We are committed to quality, authenticity, and supporting local farming communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl border border-[#072C2B]/10 shadow-sm">
              <div className="w-16 h-16 bg-[#FDCB00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-[#072C2B]" />
              </div>
              <h3 className="font-bold text-[#072C2B] mb-2">100% Organic</h3>
              <p className="text-sm text-[#072C2B]/70">All our products are grown without pesticides or chemicals</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl border border-[#072C2B]/10 shadow-sm">
              <div className="w-16 h-16 bg-[#FDCB00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#072C2B]" />
              </div>
              <h3 className="font-bold text-[#072C2B] mb-2">Local Farmers</h3>
              <p className="text-sm text-[#072C2B]/70">We source directly from local farming communities</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl border border-[#072C2B]/10 shadow-sm">
              <div className="w-16 h-16 bg-[#FDCB00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#072C2B]" />
              </div>
              <h3 className="font-bold text-[#072C2B] mb-2">Quality Assured</h3>
              <p className="text-sm text-[#072C2B]/70">Every product undergoes strict quality checks</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl border border-[#072C2B]/10 shadow-sm">
              <div className="w-16 h-16 bg-[#FDCB00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-[#072C2B]" />
              </div>
              <h3 className="font-bold text-[#072C2B] mb-2">Health First</h3>
              <p className="text-sm text-[#072C2B]/70">Products chosen for their nutritional benefits</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default AboutUs;
