import { slugify } from "./utils";

export interface Product {
  id: string;
  name: string;
  slug?: string;  // Added slug field
  description: string;
  datasheetUrl?: string;
  imageUrls: string[];
  imageUrl?: string;
  sku: string;
  itemCode: string;
  price: number;
  buyingPrice: number;
  stockQuantity: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  // Single category per product
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  // Mock product fields for compatibility
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  longDescription?: string;
  specifications?: Record<string, string>;
}

// Base URL for your backend API (defaults to same-origin /api)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Utility function for authenticated fetch requests
export async function authenticatedFetch(url: string, options?: RequestInit) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle token expiration or invalid token
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optionally redirect to login page
      window.location.href = "/login";
    }
    throw new Error(response.statusText);
  }

  return response.json();
}

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      console.error('Failed to fetch products:', response.statusText);
      return [];
    }

    const raw = await response.json();

    // Normalize to a single category field while keeping other fields safe
    const normalized: Product[] = Array.isArray(raw)
      ? raw.map((p: any) => {
        const firstCat = p.category || p.categories?.[0]?.category || p.categories?.[0] || null;
        const imageUrls = Array.isArray(p.imageUrls) && p.imageUrls.length > 0
          ? p.imageUrls
          : [p.imageUrl || p.image || "/placeholder.svg"];
        return {
          id: p.id?.toString(),
          name: p.name || "",
          slug: p.slug || undefined,
          description: p.description || "",
          datasheetUrl: p.datasheetUrl || undefined,
          imageUrls,
          imageUrl: p.imageUrl || p.image || undefined,
          sku: p.sku || "",
          itemCode: p.itemCode || "",
          price: typeof p.price === "number" ? p.price : parseFloat(p.price?.toString().replace(/[^0-9.]/g, '')) || 0,
          buyingPrice: typeof p.buyingPrice === "number" ? p.buyingPrice : parseFloat(p.buyingPrice?.toString().replace(/[^0-9.]/g, '')) || 0,
          stockQuantity: p.stockQuantity ?? p.stock ?? 0,
          isFeatured: Boolean(p.isFeatured),
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
          brand: p.brand ? {
            id: p.brand.id?.toString(),
            name: p.brand.name,
            slug: p.brand.slug || (p.brand.name || "").toLowerCase().replace(/\s+/g, "-")
          } : undefined,
          category: firstCat ? {
            id: firstCat.id?.toString(),
            name: firstCat.name,
            slug: firstCat.slug || (firstCat.name || "").toLowerCase().replace(/\s+/g, "-")
          } : undefined,
        } as Product;
      })
      : [];

    return normalized;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);

    if (!response.ok) {
      console.error('Failed to fetch product:', response.statusText);
      return null;
    }

    const p = await response.json();
    const firstCat = p.category || p.categories?.[0]?.category || p.categories?.[0] || null;
    const imageUrls = Array.isArray(p.imageUrls) && p.imageUrls.length > 0
      ? p.imageUrls
      : [p.imageUrl || p.image || "/placeholder.svg"];

    const normalized: Product = {
      id: p.id?.toString(),
      name: p.name || "",
      slug: p.slug || undefined,
      description: p.description || "",
      datasheetUrl: p.datasheetUrl || undefined,
      imageUrls,
      imageUrl: p.imageUrl || p.image || undefined,
      sku: p.sku || "",
      itemCode: p.itemCode || "",
      price: typeof p.price === "number" ? p.price : parseFloat(p.price?.toString().replace(/[^0-9.]/g, '')) || 0,
      buyingPrice: typeof p.buyingPrice === "number" ? p.buyingPrice : parseFloat(p.buyingPrice?.toString().replace(/[^0-9.]/g, '')) || 0,
      stockQuantity: p.stockQuantity ?? p.stock ?? 0,
      isFeatured: Boolean(p.isFeatured),
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
      brand: p.brand ? {
        id: p.brand.id?.toString(),
        name: p.brand.name,
        slug: p.brand.slug || (p.brand.name || "").toLowerCase().replace(/\s+/g, "-")
      } : undefined,
      category: firstCat ? {
        id: firstCat.id?.toString(),
        name: firstCat.name,
        slug: firstCat.slug || (firstCat.name || "").toLowerCase().replace(/\s+/g, "-")
      } : undefined,
    };

    return normalized;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // Always fetch fresh product data to reflect latest stock
    const response = await fetch(`${API_BASE_URL}/products/product/${slug}`, { cache: 'no-store' });
    if (!response.ok) return null;

    const p = await response.json();
    // Guard against APIs that return 200 with an empty object or not-found message
    if (!p || typeof p !== 'object') return null;
    const msg = (p.message || p.error || '').toString().toLowerCase();
    if (msg.includes('not found') || msg.includes('no product')) return null;
    if (!p.id && !p.slug && !p.name) return null;
    const firstCat = p.category || p.categories?.[0]?.category || p.categories?.[0] || null;
    const imageUrls = Array.isArray(p.imageUrls) && p.imageUrls.length > 0
      ? p.imageUrls
      : [p.imageUrl || p.image || "/placeholder.svg"];

    const normalized: Product = {
      id: p.id?.toString(),
      name: p.name || "",
      slug: p.slug || undefined,
      description: p.description || "",
      datasheetUrl: p.datasheetUrl || undefined,
      imageUrls,
      imageUrl: p.imageUrl || p.image || undefined,
      sku: p.sku || "",
      itemCode: p.itemCode || "",
      price: typeof p.price === "number" ? p.price : parseFloat(p.price?.toString().replace(/[^0-9.]/g, '')) || 0,
      buyingPrice: typeof p.buyingPrice === "number" ? p.buyingPrice : parseFloat(p.buyingPrice?.toString().replace(/[^0-9.]/g, '')) || 0,
      stockQuantity: p.stockQuantity ?? p.stock ?? 0,
      isFeatured: Boolean(p.isFeatured),
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
      brand: p.brand ? {
        id: p.brand.id?.toString(),
        name: p.brand.name,
        slug: p.brand.slug || (p.brand.name || "").toLowerCase().replace(/\s+/g, "-")
      } : undefined,
      category: firstCat ? {
        id: firstCat.id?.toString(),
        name: firstCat.name,
        slug: firstCat.slug || (firstCat.name || "").toLowerCase().replace(/\s+/g, "-")
      } : undefined,
    };

    return normalized;
  }
  catch (error) {
    console.error('Failed to fetch product by slug:', error);
    return null;
  }
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/categories`, { cache: 'force-cache' });

    if (!response.ok) {
      console.error('Failed to fetch categories:', response.statusText);
      return [];
    }

    const data = await response.json();

    return Array.isArray(data) ? data.map((cat: any) => ({
      id: cat.id?.toString() || '',
      name: cat.name || '',
      slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || '',
      description: cat.description || '',
      imageUrl: cat.imageUrl || cat.image || undefined
    })) : [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export interface Brand {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
}

export async function getBrands(): Promise<Brand[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/brands`, { cache: 'force-cache' });

    if (!response.ok) {
      console.error('Failed to fetch brands:', response.statusText);
      return [];
    }

    const data = await response.json();

    return Array.isArray(data) ? data.map((brand: any) => ({
      id: brand.id?.toString() || '',
      name: brand.name || '',
      slug: brand.slug || brand.name?.toLowerCase().replace(/\s+/g, '-') || '',
      description: brand.description || '',
      logoUrl: brand.logoUrl || brand.logo || undefined
    })) : [];
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return [];
  }
}

// Example of using authenticatedFetch for a protected route
export async function getProtectedData() {
  try {
    const data = await authenticatedFetch("/protected");
    console.log("Protected data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching protected data:", error);
    throw error;
  }
}

// Projects API
export interface ProjectDto {
  id: string;
  name: string;
  description?: string;
  imageUrls: string[];
  projectUrl?: string;
  technologiesUsed: string[];
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export async function getProjects(): Promise<ProjectDto[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map((p: any) => ({
      id: String(p.id),
      name: p.name,
      description: p.description || '',
      imageUrls: Array.isArray(p.imageUrls) && p.imageUrls.length > 0 ? p.imageUrls : ['/placeholder.jpg'],
      projectUrl: p.projectUrl || undefined,
      technologiesUsed: Array.isArray(p.technologiesUsed) ? p.technologiesUsed : [],
      displayOrder: typeof p.displayOrder === 'number' ? p.displayOrder : 0,
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    })) : [];
  } catch (_) {
    return [];
  }
}

export async function getProject(id: string): Promise<ProjectDto | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const p = await res.json();
    return {
      id: String(p.id),
      name: p.name,
      description: p.description || '',
      imageUrls: Array.isArray(p.imageUrls) && p.imageUrls.length > 0 ? p.imageUrls : ['/placeholder.jpg'],
      projectUrl: p.projectUrl || undefined,
      technologiesUsed: Array.isArray(p.technologiesUsed) ? p.technologiesUsed : [],
      displayOrder: typeof p.displayOrder === 'number' ? p.displayOrder : 0,
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    };
  } catch (_) {
    return null;
  }
}
