import { useState, useMemo } from 'react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  buyingPrice?: number;
  stockQuantity: number;
  imageUrl?: string;
  sku?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  // New single category shape
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  // Legacy categories array
  categories?: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface SearchFilters {
  query: string;
  category: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'name' | 'newest';
}

interface PaginationOptions {
  page: number;
  itemsPerPage: number;
}

export function useProductSearch(products: Product[], itemsPerPage = 30) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    brand: 'all',
    minPrice: 0,
    maxPrice: Infinity,
    sortBy: 'relevance'
  });

  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    itemsPerPage
  });

  // Calculate relevance score for search
  const calculateRelevance = (product: Product, query: string): number => {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    // Exact match in name (highest priority)
    if (product.name.toLowerCase().includes(lowerQuery)) {
      const exactMatch = product.name.toLowerCase() === lowerQuery;
      const startsWithMatch = product.name.toLowerCase().startsWith(lowerQuery);
      score += exactMatch ? 1000 : startsWithMatch ? 500 : 100;
    }
    
    // Match in brand name
    if (product.brand?.name.toLowerCase().includes(lowerQuery)) {
      score += 50;
    }
    
    // Match in description
    if (product.description?.toLowerCase().includes(lowerQuery)) {
      score += 30;
    }
    
    // Match in category names
    if (
      product.category?.name.toLowerCase().includes(lowerQuery) ||
      product.categories?.some(cat => cat.category.name.toLowerCase().includes(lowerQuery))
    ) {
      score += 40;
    }
    
    // Match in SKU
  if (product.sku && product.sku.toLowerCase().includes(lowerQuery)) {
      score += 20;
    }
    
    return score;
  };

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let results = products.filter(product => {
      // Stock filter - only show products in stock
      if (product.stockQuantity <= 0) return false;
      
      // Price filter
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }
      
      // Brand filter
      if (filters.brand !== 'all' && product.brand?.name !== filters.brand) {
        return false;
      }
      
      // Category filter (supports name or slug; case-insensitive)
      if (filters.category !== 'all') {
        const wanted = String(filters.category).trim().toLowerCase();
        const matchBy = (name?: string, slug?: string) => {
          const n = name?.trim().toLowerCase();
          const s = slug?.trim().toLowerCase() || n?.replace(/\s+/g, '-');
          return n === wanted || s === wanted;
        };

        const hasCategory = (
          matchBy(product.category?.name, product.category?.slug) ||
          product.categories?.some(cat => matchBy(cat.category.name, cat.category.slug))
        );
        if (!hasCategory) return false;
      }
      
      // Search query filter
      if (filters.query.trim()) {
        const query = filters.query.toLowerCase().trim();
        return (
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.brand?.name.toLowerCase().includes(query) ||
          (product.sku ? product.sku.toLowerCase().includes(query) : false) ||
          product.category?.name.toLowerCase().includes(query) ||
          product.categories?.some(cat => cat.category.name.toLowerCase().includes(query))
        );
      }
      
      return true;
    });

    // Sort results
    switch (filters.sortBy) {
      case 'relevance':
        if (filters.query.trim()) {
          results.sort((a, b) => {
            const scoreA = calculateRelevance(a, filters.query);
            const scoreB = calculateRelevance(b, filters.query);
            return scoreB - scoreA;
          });
        } else {
          // Default sort by name when no search query
          results.sort((a, b) => a.name.localeCompare(b.name));
        }
        break;
      case 'price_asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return results;
  }, [products, filters]);

  // Paginated results
  const paginatedResults = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, pagination]);

  // Pagination info
  const paginationInfo = useMemo(() => {
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
    const startItem = (pagination.page - 1) * pagination.itemsPerPage + 1;
    const endItem = Math.min(pagination.page * pagination.itemsPerPage, totalItems);

    return {
      totalItems,
      totalPages,
      currentPage: pagination.page,
      itemsPerPage: pagination.itemsPerPage,
      startItem,
      endItem,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1
    };
  }, [filteredProducts.length, pagination]);

  // Get unique categories and brands
  const availableFilters = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach(p => {
      if (p.category?.name) categorySet.add(p.category.name);
      p.categories?.forEach(c => {
        if (c.category.name) {
          categorySet.add(c.category.name);
        }
      });
    });
    const categories = Array.from(categorySet).sort();

    const brandSet = new Set<string>();
    products.forEach(p => {
      if (p.brand?.name) {
        brandSet.add(p.brand.name);
      }
    });
    const brands = Array.from(brandSet).sort();

    return { categories, brands };
  }, [products]);

  // Search suggestions
  const suggestions = useMemo(() => {
    if (!filters.query.trim() || filters.query.length < 2) return [];
    
    const query = filters.query.toLowerCase();
    const productSuggestions = products
      .filter(p => p.name.toLowerCase().includes(query))
      .slice(0, 5)
      .map(p => ({ type: 'product', text: p.name }));
    
    const categorySuggestions = availableFilters.categories
      .filter(cat => cat.toLowerCase().includes(query))
      .slice(0, 3)
      .map(cat => ({ type: 'category', text: cat }));

    const brandSuggestions = availableFilters.brands
      .filter(brand => brand.toLowerCase().includes(query))
      .slice(0, 3)
      .map(brand => ({ type: 'brand', text: brand }));
    
    return [...productSuggestions, ...categorySuggestions, ...brandSuggestions];
  }, [products, filters.query, availableFilters]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      brand: 'all',
      minPrice: 0,
      maxPrice: Infinity,
      sortBy: 'relevance'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return {
    // Results
    filteredProducts,
    paginatedResults,
    suggestions,
    
    // State
    filters,
    pagination: paginationInfo,
    availableFilters,
    
    // Actions
    updateFilter,
    goToPage,
    resetFilters,
    setFilters
  };
}
