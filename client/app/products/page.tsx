"use client"
import { useEffect, useState } from 'react'
import { Navigation } from "@/components/home/Navigation"
import { Footer } from "@/components/home/Footer"
import { ProductsGrid } from "@/components/products/ProductsGrid"
import { ProductsEmptyState } from "@/components/products/ProductsEmptyState"
import SearchFiltersBar from "@/components/SearchFiltersBar"
import { useProductSearch } from "@/hooks/useProductSearch"
import Pagination from "@/components/Pagination"
import Breadcrumb from "@/components/breadcrumb"
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld"
import { getHomeBreadcrumb, getProductsBreadcrumb, getBreadcrumbJsonLdItems } from "@/lib/breadcrumbs"
import Script from "next/script"

interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  imageUrls?: string[];
  isFeatured?: boolean;
  isUsed?: boolean;
  createdAt: string;
  updatedAt: string;
  itemCode?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    paginatedResults,
    suggestions,
    filters,
    pagination,
    updateFilter,
    goToPage,
    resetFilters,
    setFilters
  } = useProductSearch(allProducts, 30)

  // Initialize filters and page from URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlFilters: Record<string, any> = {};

      // Get query parameter (could be 'query' or 'search')
      const searchQuery = params.get('query') || params.get('search');
      if (searchQuery) {
        urlFilters.query = searchQuery;
      }

      // Get category parameter
      const category = params.get('category');
      if (category) {
        urlFilters.category = category;
      }

      // Get price range parameters
      const minPrice = params.get('minPrice');
      if (minPrice) {
        urlFilters.minPrice = Number(minPrice);
      }

      const maxPrice = params.get('maxPrice');
      if (maxPrice) {
        urlFilters.maxPrice = Number(maxPrice);
      }

      // Get sort parameter
      const sortBy = params.get('sortBy');
      if (sortBy) {
        urlFilters.sortBy = sortBy;
      }

      // Update filters if any URL parameters were found
      if (Object.keys(urlFilters).length > 0) {
        setFilters(prev => ({ ...prev, ...urlFilters }));
      }

      // Restore page if provided
      const pageParam = params.get('page');
      const pageNum = pageParam ? Number(pageParam) : 1;
      if (!Number.isNaN(pageNum) && pageNum > 1) {
        goToPage(pageNum);
      }
    }
  }, [setFilters]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

        const productsRes = await fetch(`${apiBaseUrl}/products`);
        if (!productsRes.ok) throw new Error(`Products API error: ${productsRes.status}`);
        const rawProductsData = await productsRes.json();

        const productsData: Product[] = Array.isArray(rawProductsData)
          ? rawProductsData.map((p) => ({
            id: p.id?.toString() || '',
            name: p.name || '',
            slug: p.slug || undefined,
            description: p.description || '',
            price: typeof p.price === 'number' ? p.price : parseFloat(p.price?.toString().replace(/[^0-9.]/g, '')) || 0,
            stockQuantity: p.stockQuantity || p.stock || 0,
            imageUrl: p.imageUrl || p.image || '/placeholder.svg',
            imageUrls: p.imageUrls || [p.imageUrl || p.image || '/placeholder.svg'],
            isFeatured: Boolean(p.isFeatured),
            isUsed: Boolean(p.isUsed), // ✅ map isUsed from backend
            createdAt: p.createdAt || new Date().toISOString(),
            updatedAt: p.updatedAt || new Date().toISOString(),
            itemCode: p.itemCode || '',
            category:
              (p.category || p.categories?.[0]?.category || p.categories?.[0])
                ? {
                  id:
                    (
                      p.category?.id ||
                      p.categories?.[0]?.category?.id ||
                      p.categories?.[0]?.id ||
                      ''
                    ).toString(),
                  name:
                    p.category?.name ||
                    p.categories?.[0]?.category?.name ||
                    p.categories?.[0]?.name ||
                    '',
                  slug:
                    p.category?.slug ||
                    p.categories?.[0]?.category?.slug ||
                    p.categories?.[0]?.slug ||
                    (
                      p.category?.name ||
                      p.categories?.[0]?.category?.name ||
                      p.categories?.[0]?.name ||
                      ''
                    )
                      .toLowerCase()
                      .replace(/\s+/g, '-'),
                }
                : undefined,
          }))
          : [];

        // Exclude used products from the main products listing
        setAllProducts(productsData.filter((p) => !p.isUsed));

        const categoriesRes = await fetch(`${apiBaseUrl}/products/categories`);
        if (categoriesRes.ok) {
          const rawCategoriesData = await categoriesRes.json();
          const categoriesData: Category[] = Array.isArray(rawCategoriesData)
            ? rawCategoriesData.map((c) => ({
              id: c.id?.toString() || '',
              name: c.name || '',
              slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, '-') || '',
            }))
            : [];
          setCategories(categoriesData);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    updateFilter(key as keyof typeof filters, value);

    // Update URL parameters when filters change
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);

      if (value === 'all' || value === '' ||
        (key === 'minPrice' && value === 0) ||
        (key === 'maxPrice' && value === Infinity)) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value.toString());
      }

      // Update URL without reloading the page
      window.history.pushState({}, '', url.toString());
    }
  };

  // Keep page in URL when user paginates (so Back returns to same page)
  const handlePageChange = (page: number) => {
    goToPage(page);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (page > 1) url.searchParams.set('page', String(page));
      else url.searchParams.delete('page');
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Save/restore scroll position between navigations
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const keyFor = () => `products-scroll:${window.location.search}`;
    const save = () => {
      try { sessionStorage.setItem(keyFor(), String(window.scrollY)); } catch { }
    };
    const onVis = () => { if (document.visibilityState === 'hidden') save(); };
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      save();
      window.removeEventListener('pagehide', save);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // After data loads, restore last scroll position for current query params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (loading) return;
    try {
      const key = `products-scroll:${window.location.search}`;
      const y = sessionStorage.getItem(key);
      if (y) {
        // Defer to next tick so DOM is ready
        setTimeout(() => window.scrollTo(0, parseInt(y, 10) || 0), 0);
      }
    } catch { }
  }, [loading]);

  const handleResetFilters = () => {
    resetFilters();

    // Clear URL parameters when filters are reset
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.pushState({}, '', url.toString());
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2 text-red-600">Error Loading Products</p>
          <p className="text-sm text-[#072C2B]/70">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#FDCB00] text-[#072C2B] font-semibold rounded hover:bg-[#d4a800]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbJsonLd
        items={getBreadcrumbJsonLdItems([
          getHomeBreadcrumb(),
          getProductsBreadcrumb()
        ])}
      />
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="my-4 md:my-4 bg-white/70 backdrop-blur-sm rounded-lg p-2 md:p-3 shadow-sm mb-6">
          <Breadcrumb
            items={[
              getHomeBreadcrumb(),
              getProductsBreadcrumb()
            ]}
          />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#072C2B] mb-2">Products</h1>
          <p className="text-[#072C2B]/70">
            Discover our complete collection of traditional rice, organic honey, and handcrafted products
          </p>
        </div>

        {/* Search and Filters */}
        <SearchFiltersBar
          filters={filters}
          availableFilters={{
            categories: categories.map(cat => cat.name),
            // brands: brands.map(brand => brand.name)
          }}
          suggestions={suggestions.map(s => ({ type: s.type, text: s.text }))}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalResults={pagination.totalItems}
        />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
            {/* Skeleton Loading */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-[#072C2B]/10 overflow-hidden">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : paginatedResults.length > 0 ? (
          <>
            {/* ItemList JSON-LD for product listing page */}
            <Script id="products-itemlist-jsonld" type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'ItemList',
                  itemListElement: paginatedResults.map((p, idx) => ({
                    '@type': 'ListItem',
                    position: idx + 1,
                    url: `https://ranketha.lk/products/product/${(p as any).slug || p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
                  }))
                })
              }}
            />
            <ProductsGrid
              products={paginatedResults
                .filter(p => !(p as any).isUsed) // safety filter
                .map(product => ({
                  ...product,
                  description: product.description || "",
                  imageUrls: Array.isArray((product as any).imageUrls) && (product as any).imageUrls.length > 0
                    ? (product as any).imageUrls
                    : [product.imageUrl || '/placeholder.svg']
                }))}
              viewMode="grid"
            />

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              startItem={pagination.startItem}
              endItem={pagination.endItem}
              totalItems={pagination.totalItems}
            />
          </>
        ) : (
          <ProductsEmptyState
            setSearchQuery={(value) => handleFilterChange('query', value)}
            setSelectedCategory={(value) => handleFilterChange('category', value)}
            setSelectedBrand={(value) => handleFilterChange('brand', value)}
            setPriceRange={(value) => {
              handleFilterChange('minPrice', value[0]);
              handleFilterChange('maxPrice', value[1]);
            }}
          />
        )}
        {/* SEO-friendly content */}
        <section className="mt-12 text-[#072C2B]/70">
          <h2 className="text-xl font-semibold mb-2 text-[#072C2B]">Buy Traditional Rice and Organic Products in Sri Lanka</h2>
          <p className="max-w-3xl">Find the finest traditional Sri Lankan rice varieties, pure organic honey, and handcrafted artisan products. Ranketha offers island-wide delivery, quality assurance, and competitive pricing on all natural products for health-conscious customers.</p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
