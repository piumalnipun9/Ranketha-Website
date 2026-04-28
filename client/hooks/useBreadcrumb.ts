import { useCallback } from "react";
import {
  BreadcrumbItem,
  getHomeBreadcrumb as getHomeBreadcrumbFn,
  getProductsBreadcrumb as getProductsBreadcrumbFn,
  getCategoryBreadcrumb as getCategoryBreadcrumbFn,
  getProductBreadcrumb as getProductBreadcrumbFn,
  getProductPageBreadcrumbs as getProductPageBreadcrumbsFn,
  getCategoryPageBreadcrumbs as getCategoryPageBreadcrumbsFn,
  getBreadcrumbJsonLdItems as getBreadcrumbJsonLdItemsFn
} from "@/lib/breadcrumbs";

/**
 * Hook for generating consistent breadcrumbs throughout the application
 * This is a client-side wrapper around the server-compatible breadcrumb functions
 */
export function useBreadcrumb() {
  const getHomeBreadcrumb = useCallback((): BreadcrumbItem => {
    return getHomeBreadcrumbFn();
  }, []);

  const getProductsBreadcrumb = useCallback((): BreadcrumbItem => {
    return getProductsBreadcrumbFn();
  }, []);

  const getCategoryBreadcrumb = useCallback((categoryName: string, categorySlug?: string): BreadcrumbItem => {
    return getCategoryBreadcrumbFn(categoryName, categorySlug);
  }, []);

  const getProductBreadcrumb = useCallback((productName: string, productSlug: string): BreadcrumbItem => {
    return getProductBreadcrumbFn(productName, productSlug);
  }, []);

  const getProductPageBreadcrumbs = useCallback((productName: string, productSlug: string, categoryName?: string, categorySlug?: string): BreadcrumbItem[] => {
    return getProductPageBreadcrumbsFn(productName, productSlug, categoryName, categorySlug);
  }, []);

  const getCategoryPageBreadcrumbs = useCallback((categoryName: string, categorySlug?: string): BreadcrumbItem[] => {
    return getCategoryPageBreadcrumbsFn(categoryName, categorySlug);
  }, []);

  const getBreadcrumbJsonLdItems = useCallback((items: BreadcrumbItem[]): Array<{name: string, url: string}> => {
    return getBreadcrumbJsonLdItemsFn(items);
  }, []);

  return {
    getHomeBreadcrumb,
    getProductsBreadcrumb,
    getCategoryBreadcrumb,
    getProductBreadcrumb,
    getProductPageBreadcrumbs,
    getCategoryPageBreadcrumbs,
    getBreadcrumbJsonLdItems
  };
}

export type { BreadcrumbItem } from "@/lib/breadcrumbs";
