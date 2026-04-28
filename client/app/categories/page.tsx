import Link from "next/link";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Breadcrumb from "@/components/breadcrumb";
import { getHomeBreadcrumb, getBreadcrumbJsonLdItems } from "@/lib/breadcrumbs";
import { Navigation } from "@/components/home/Navigation";
import { Footer } from "@/components/home/Footer";
import { Leaf, Droplets, Palette } from "lucide-react";

const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Ranketha';

export const metadata: Metadata = {
  title: `Product Categories | ${companyName}`,
  description: `Explore our wide range of product categories including traditional rice, organic honey, and handcrafted items at ${companyName}.`,
  keywords: "traditional rice, organic honey, handcrafted items, Sri Lanka, natural products, Ranketha",
  alternates: {
    canonical: '/categories',
  },
  openGraph: {
    title: `Product Categories | ${companyName}`,
    description: "Explore our wide range of product categories including traditional rice, organic honey, and handcrafted items.",
    url: 'https://ranketha.lk/categories',
    siteName: companyName,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Product Categories | ${companyName}`,
    description: `Explore our wide range of product categories at ${companyName} Sri Lanka.`,
  }
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'rice': <Leaf className="w-8 h-8 text-[#072C2B]" />,
  'honey': <Droplets className="w-8 h-8 text-[#072C2B]" />,
  'art-crafts': <Palette className="w-8 h-8 text-[#072C2B]" />,
};

async function getCategories(): Promise<Category[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || '/api';
    const res = await fetch(`${base}/products/categories`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return await res.json();
  } catch (e) {
    console.error("Categories load error:", e);
    return [];
  }
}

export default async function Categories() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbJsonLd
        items={getBreadcrumbJsonLdItems([
          getHomeBreadcrumb(),
          { name: 'Categories', href: '/categories' }
        ])}
      />
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="my-4 md:my-4 bg-white/70 backdrop-blur-sm rounded-lg p-2 md:p-3 shadow-sm mb-6">
          <Breadcrumb
            items={[
              getHomeBreadcrumb(),
              { name: 'Categories', href: '/categories' }
            ]}
          />
        </div>
      </div>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#072C2B] via-[#0a4a48] to-[#072C2B]" />

        {/* Honey drip decorations */}
        <div className="absolute top-0 left-1/4 w-2 h-20 bg-gradient-to-b from-[#FDCB00] to-transparent rounded-b-full opacity-60" />
        <div className="absolute top-0 left-1/3 w-3 h-32 bg-gradient-to-b from-[#FDCB00] to-transparent rounded-b-full opacity-40" />
        <div className="absolute top-0 right-1/4 w-2 h-24 bg-gradient-to-b from-[#FDCB00] to-transparent rounded-b-full opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Product
              <span className="block bg-gradient-to-r from-[#FDCB00] to-[#d4a800] bg-clip-text text-transparent">Categories</span>
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto">
              Explore our curated collection of traditional Sri Lankan rice, pure honey, and handcrafted artisan products.
            </p>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
              {categories.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {/* Skeleton loading */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse rounded-xl border border-[#072C2B]/10 bg-gray-100 p-8">
                      <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-6 mx-auto"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${encodeURIComponent(cat.name)}`}
                      className="group block rounded-xl border border-[#072C2B]/10 bg-white hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-8">
                        <div className="w-16 h-16 bg-[#FDCB00]/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-[#FDCB00]/30 transition-colors">
                          {categoryIcons[cat.slug] || <Leaf className="w-8 h-8 text-[#072C2B]" />}
                        </div>
                        <h3 className="font-bold text-xl text-[#072C2B] group-hover:text-[#072C2B]/80 mb-2">{cat.name}</h3>
                        <p className="text-sm text-[#072C2B]/60">/{cat.slug}</p>
                      </div>
                      <div className="h-1 w-full bg-gradient-to-r from-[#FDCB00] to-[#d4a800] opacity-0 group-hover:opacity-100 transition" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
