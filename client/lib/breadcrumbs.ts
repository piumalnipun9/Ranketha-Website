/**
 * Server-compatible utility functions for generating breadcrumbs
 * This file contains functions that can be used in both client and server components
 */

export interface BreadcrumbItem {
  name: string;
  href: string;
}

/**
 * Create a standard home breadcrumb
 */
export function getHomeBreadcrumb(): BreadcrumbItem {
  return {
    name: 'Home',
    href: '/'
  };
}

/**
 * Create a product page breadcrumb
 */
export function getProductsBreadcrumb(): BreadcrumbItem {
  return {
    name: 'Products',
    href: '/products'
  };
}

/**
 * Create a category breadcrumb
 */
export function getCategoryBreadcrumb(categoryName: string, _categorySlug?: string): BreadcrumbItem {
  // Direct users to products page with category filter using the exact category name
  const encodedName = encodeURIComponent(categoryName);
  return {
    name: categoryName,
    href: `/products?category=${encodedName}`
  };
}

/**
 * Create a product breadcrumb
 */
export function getProductBreadcrumb(productName: string, productSlug: string): BreadcrumbItem {
  return {
    name: productName,
    href: `/products/product/${productSlug}`
  };
}

/**
 * Build breadcrumb trail for product pages
 */
export function getProductPageBreadcrumbs(
  productName: string, 
  productSlug: string, 
  categoryName?: string, 
  categorySlug?: string
): BreadcrumbItem[] {
  const breadcrumbs = [getHomeBreadcrumb(), getProductsBreadcrumb()];
  
  if (categoryName) {
    breadcrumbs.push(getCategoryBreadcrumb(categoryName, categorySlug));
  }
  
  breadcrumbs.push(getProductBreadcrumb(productName, productSlug));
  
  return breadcrumbs;
}

/**
 * Build breadcrumb trail for category pages
 */
export function getCategoryPageBreadcrumbs(categoryName: string, categorySlug?: string): BreadcrumbItem[] {
  return [
    getHomeBreadcrumb(),
    getProductsBreadcrumb(),
    getCategoryBreadcrumb(categoryName, categorySlug)
  ];
}

/**
 * Get breadcrumb JSON-LD items for Google rich results
 */
export function getBreadcrumbJsonLdItems(items: BreadcrumbItem[]): Array<{name: string, url: string}> {
  return items.map(item => ({
    name: item.name,
    url: `https://roboclub.lk${item.href}`
  }));
}
