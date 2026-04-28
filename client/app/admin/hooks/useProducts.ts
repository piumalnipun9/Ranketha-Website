'use client'

import { useState, useCallback } from 'react'
import { UIProduct, ProductForm, UICategory } from '../types'
import { authenticatedFetch } from '@/lib/api'

const PRODUCT_PAGE_SIZE = 50

export function useProducts() {
    const [products, setProducts] = useState<UIProduct[]>([])
    const [productPage, setProductPage] = useState(1)
    const [productHasMore, setProductHasMore] = useState(false)
    const [productTotal, setProductTotal] = useState(0)
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const [editingProduct, setEditingProduct] = useState<UIProduct | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [productForm, setProductForm] = useState<ProductForm>({
        name: "",
        price: "",
        categoryId: "",
        description: "",
        stock: "",
        image: "",
        itemCode: "",
        isFeatured: false,
        isUsed: false,
    })

    const fetchProducts = useCallback(async (search?: string, page: number = 1, append = false) => {
        const qsSearch = search && search.length > 0 ? `&search=${encodeURIComponent(search)}` : ""
        const prodRes = await authenticatedFetch(`/admin/products?page=${page}&limit=${PRODUCT_PAGE_SIZE}${qsSearch}`)
        const rawProducts = (prodRes?.products ?? prodRes ?? [])
        const uiProducts: UIProduct[] = rawProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: (Array.isArray(p.imageUrls) && p.imageUrls[0]) || "/placeholder.svg",
            category: p.categories?.[0]?.category?.name,
            description: p.description ?? "",
            stock: p.stockQuantity ?? 0,
            itemCode: p.itemCode || "",
            isFeatured: Boolean(p.isFeatured),
            isUsed: Boolean(p.isUsed),
        }))
        setProducts(prev => append ? [...prev, ...uiProducts] : uiProducts)
        const pagination = prodRes?.pagination
        if (pagination && typeof pagination.total === 'number') {
            setProductTotal(pagination.total)
            setProductHasMore(pagination.page < pagination.pages)
            setProductPage(pagination.page)
        } else {
            setProductHasMore(false)
            setProductTotal(uiProducts.length)
            setProductPage(1)
        }
        return uiProducts
    }, [])

    const handleAddProduct = useCallback(() => {
        setEditingProduct(null)
        setProductForm({
            name: "",
            price: "",
            categoryId: "",
            description: "",
            stock: "",
            image: "",
            itemCode: "",
            isFeatured: false,
            isUsed: false,
        })
        setIsDialogOpen(true)
    }, [])

    const handleEditProduct = useCallback((product: UIProduct, categories: UICategory[]) => {
        setEditingProduct(product)
        setProductForm({
            name: product.name,
            price: product.price.toString(),
            categoryId: (categories.find((c) => c.name === (product.category || ""))?.id) || "",
            description: product.description,
            stock: product.stock.toString(),
            image: product.image,
            itemCode: product.itemCode || "",
            isFeatured: Boolean(product.isFeatured),
            isUsed: Boolean(product.isUsed),
        })
        setIsDialogOpen(true)
    }, [])

    const handleSaveProduct = useCallback(async (productSearch: string) => {
        if (!productForm.categoryId) {
            alert("Please select a category for the product")
            return false
        }

        const payload: any = {
            name: productForm.name,
            description: productForm.description,
            price: Number.parseFloat(productForm.price),
            stockQuantity: Number.parseInt(productForm.stock),
            imageUrls: productForm.image ? [productForm.image] : [],
            ...(productForm.categoryId ? { categories: [productForm.categoryId] } : {}),
            isFeatured: Boolean(productForm.isFeatured),
            isUsed: Boolean(productForm.isUsed),
        }

        try {
            if (editingProduct) {
                const updatePayload = { ...payload } as any
                if (productForm.itemCode && productForm.itemCode.trim() !== "") {
                    updatePayload.itemCode = productForm.itemCode.trim()
                }
                await authenticatedFetch(`/admin/products/${editingProduct.id}`, {
                    method: "PUT",
                    body: JSON.stringify(updatePayload),
                })
            } else {
                await authenticatedFetch(`/admin/products`, {
                    method: "POST",
                    body: JSON.stringify({ ...payload, itemCode: productForm.itemCode || crypto.randomUUID().slice(0, 8) }),
                })
            }

            await fetchProducts(productSearch.trim() || undefined, 1, false)
            setIsDialogOpen(false)
            return true
        } catch (err: any) {
            alert(err?.message || "Failed to save product")
            return false
        }
    }, [productForm, editingProduct, fetchProducts])

    const handleDeleteProduct = useCallback(async (id: string) => {
        try {
            await authenticatedFetch(`/admin/products/${id}`, { method: "DELETE" })
            setProducts((prev) => prev.filter((p) => p.id !== id))
            return true
        } catch (err: any) {
            alert(err?.message || "Failed to delete product")
            return false
        }
    }, [])

    const handleBulkDeleteProducts = useCallback(async (productSearch: string) => {
        if (selectedProducts.length === 0) return false
        if (!confirm(`Delete ${selectedProducts.length} selected product(s)?`)) return false
        try {
            for (const id of selectedProducts) {
                await authenticatedFetch(`/admin/products/${id}`, { method: "DELETE" })
            }
            setSelectedProducts([])
            await fetchProducts(productSearch.trim() || undefined)
            return true
        } catch (err: any) {
            alert(err?.message || "Failed to delete selected products")
            return false
        }
    }, [selectedProducts, fetchProducts])

    return {
        // State
        products,
        setProducts,
        productPage,
        setProductPage,
        productHasMore,
        setProductHasMore,
        productTotal,
        setProductTotal,
        selectedProducts,
        setSelectedProducts,
        editingProduct,
        isDialogOpen,
        setIsDialogOpen,
        productForm,
        setProductForm,
        PRODUCT_PAGE_SIZE,
        // Actions
        fetchProducts,
        handleAddProduct,
        handleEditProduct,
        handleSaveProduct,
        handleDeleteProduct,
        handleBulkDeleteProducts,
    }
}
