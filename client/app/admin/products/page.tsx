"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { authenticatedFetch, API_BASE_URL } from "@/lib/api"
import { getCache, setCache } from '../hooks/useAdminCache'
import { ProductsTab } from '../components'
import type { UIProduct, UICategory } from '../types'
import { useRouter } from "next/navigation"

export default function ProductsPage() {
    const router = useRouter()
    const [products, setProducts] = useState<UIProduct[]>([])
    const [productPage, setProductPage] = useState(1)
    const [productHasMore, setProductHasMore] = useState(false)
    const [productTotal, setProductTotal] = useState(0)
    const PRODUCT_PAGE_SIZE = 50

    const [categories, setCategories] = useState<UICategory[]>([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const initialLoadDone = useRef(false)

    const [productSearch, setProductSearch] = useState("")

    const [editingProduct, setEditingProduct] = useState<UIProduct | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [productForm, setProductForm] = useState({
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
    const [isUploading, setIsUploading] = useState(false)

    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
    const [csvFile, setCsvFile] = useState<File | null>(null)

    const [selectedProducts, setSelectedProducts] = useState<string[]>([])

    // Helper: fetch products
    const fetchProducts = async (search?: string, page: number = 1, append = false) => {
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
    }

    // Helper: fetch categories for dropdown
    const fetchCategories = async () => {
        const res = await authenticatedFetch(`/admin/categories`)
        const uiCats: UICategory[] = (res ?? []).map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            productCount: c._count?.products ?? 0,
        }))
        setCategories(uiCats)
    }

    // Debounce product search
    useEffect(() => {
        if (!initialLoadDone.current) return
        const t = setTimeout(() => {
            const q = productSearch.trim()
            setProductPage(1)
            fetchProducts(q || undefined, 1, false)
        }, 300)
        return () => clearTimeout(t)
    }, [productSearch])

    // Initial load
    useEffect(() => {
        const loadAll = async () => {
            try {
                setError(null)
                const cached = getCache()
                if (cached && cached.products) {
                    setProducts(cached.products)
                    if (cached.productPagination) {
                        setProductTotal(cached.productPagination.total)
                        setProductHasMore(cached.productPagination.hasMore)
                        setProductPage(cached.productPagination.page)
                    }
                    if (cached.categories) {
                        setCategories(cached.categories)
                    }
                    setLoading(false)
                    initialLoadDone.current = true
                } else {
                    setLoading(true)
                }

                await Promise.all([
                    fetchProducts(undefined, 1, false),
                    fetchCategories(),
                ])

            } catch (e: any) {
                console.error(e)
                setError(e?.message || "Failed to load products")
            } finally {
                setLoading(false)
                initialLoadDone.current = true
            }
        }
        loadAll()
    }, [])

    // Cache update
    useEffect(() => {
        if (!initialLoadDone.current) return
        const currentCache = getCache() || {}
        setCache({
            ...currentCache,
            products,
            productPagination: { total: productTotal, page: productPage, hasMore: productHasMore },
            categories,
        })
    }, [products, productTotal, productPage, productHasMore, categories])


    const handleAddProduct = () => {
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
    }

    const handleEditProduct = (product: UIProduct) => {
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
        setIsDialogOpen(true);
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            const fd = new FormData();
            fd.append('image', file);
            const resp = await fetch(`${API_BASE_URL}/admin/upload-image`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                } as any,
                body: fd,
            });
            
            if (!resp.ok) throw new Error('Upload failed');
            const data = await resp.json();
            
            setProductForm((prev) => ({ ...prev, image: data.url }));
        } catch (err: any) {
            alert(err?.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!productForm.categoryId) {
            alert("Please select a category for the product")
            return
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
        } catch (err: any) {
            alert(err?.message || "Failed to save product")
        }
    }

    const handleDeleteProduct = async (id: string) => {
        try {
            await authenticatedFetch(`/admin/products/${id}`, { method: "DELETE" })
            setProducts((prev) => prev.filter((p) => p.id !== id))
        } catch (err: any) {
            alert(err?.message || "Failed to delete product")
        }
    }

    const handleBulkDeleteProducts = async () => {
        if (selectedProducts.length === 0) return
        if (!confirm(`Delete ${selectedProducts.length} selected product(s)?`)) return
        try {
            for (const id of selectedProducts) {
                await authenticatedFetch(`/admin/products/${id}`, { method: "DELETE" })
            }
            setSelectedProducts([])
            await fetchProducts(productSearch.trim() || undefined)
        } catch (err: any) {
            alert(err?.message || "Failed to delete selected products")
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Products</h1>
                    <p className="text-slate-600">Manage your product inventory</p>
                </div>
            </div>

            <ProductsTab
                products={products}
                productTotal={productTotal}
                productPage={productPage}
                productHasMore={productHasMore}
                PRODUCT_PAGE_SIZE={PRODUCT_PAGE_SIZE}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                productSearch={productSearch}
                setProductSearch={setProductSearch}
                fetchProducts={fetchProducts}
                handleAddProduct={handleAddProduct}
                handleEditProduct={handleEditProduct}
                handleDeleteProduct={handleDeleteProduct}
                handleBulkDeleteProducts={handleBulkDeleteProducts}
                setIsBulkDialogOpen={setIsBulkDialogOpen}
                onViewOrders={(product) => router.push(`/admin/products/${product.id}/orders`)}
            />

            {/* Product Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto z-[60]">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSaveProduct} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                value={productForm.name}
                                onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="isFeatured"
                                    checked={productForm.isFeatured}
                                    onCheckedChange={(val) => setProductForm((prev) => ({ ...prev, isFeatured: Boolean(val) }))}
                                />
                                <Label htmlFor="isFeatured">Featured</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="isUsed"
                                    checked={productForm.isUsed}
                                    onCheckedChange={(val) => setProductForm((prev) => ({ ...prev, isUsed: Boolean(val) }))}
                                />
                                <Label htmlFor="isUsed">Used product</Label>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={productForm.price}
                                onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={productForm.categoryId}
                                onValueChange={(val) => setProductForm((prev) => ({ ...prev, categoryId: val }))}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent side="bottom" sideOffset={6} position="popper" collisionPadding={12} className="z-[80] max-h-56">
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="stock">Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={productForm.stock}
                                onChange={(e) => setProductForm((prev) => ({ ...prev, stock: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={productForm.description}
                                onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="image">Image</Label>
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Input
                                        id="image"
                                        value={productForm.image}
                                        onChange={(e) => setProductForm((prev) => ({ ...prev, image: e.target.value }))}
                                        placeholder="/images/products/example.jpg"
                                        className="flex-1"
                                    />
                                    <div className="relative overflow-hidden inline-block shrink-0">
                                        <Button type="button" variant="outline" disabled={isUploading}>
                                            {isUploading ? "Uploading..." : "Upload File"}
                                        </Button>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={isUploading}
                                        />
                                    </div>
                                </div>
                                {productForm.image && (
                                    <div className="mt-2 h-32 w-32 relative border rounded-md overflow-hidden bg-slate-100 flex items-center justify-center">
                                        <img src={productForm.image} alt="Preview" className="object-cover max-w-full max-h-full" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="itemCode">Item Code</Label>
                            <Input
                                id="itemCode"
                                value={productForm.itemCode}
                                onChange={(e) => setProductForm((prev) => ({ ...prev, itemCode: e.target.value }))}
                                placeholder={editingProduct ? "Must be unique (leave unchanged to keep)" : "Required (auto-generated if left blank)"}
                            />
                        </div>

                        <div className="flex space-x-4">
                            <Button type="submit" className="flex-1">
                                {editingProduct ? "Update Product" : "Add Product"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Bulk Upload Dialog */}
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto z-[60]">
                    <DialogHeader>
                        <DialogTitle>Bulk Upload Products (CSV)</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault()
                            if (!csvFile) return
                            try {
                                const token = localStorage.getItem('token')
                                const fd = new FormData()
                                fd.append('file', csvFile)
                                const resp = await fetch(`${API_BASE_URL}/admin/products/bulk`, {
                                    method: 'POST',
                                    headers: {
                                        Authorization: token ? `Bearer ${token}` : ''
                                    } as any,
                                    body: fd,
                                })
                                if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`)
                                const data = await resp.json()
                                alert(`Imported: ${data.created}, Skipped: ${data.skipped}`)
                                setCsvFile(null)
                                setIsBulkDialogOpen(false)
                                await fetchProducts()
                            } catch (err: any) {
                                alert(err?.message || 'Bulk upload failed')
                            }
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="csv">CSV File</Label>
                            <input
                                id="csv"
                                type="file"
                                accept=".csv,text/csv"
                                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                            />
                            <p className="text-xs text-slate-600 mt-2">Columns: name, description, price, stockQuantity, itemCode, imageUrl (or imageUrls), isFeatured, isUsed, categories (comma/semicolon separated names or slugs)</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Button type="submit" disabled={!csvFile}>Upload</Button>
                            <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                            <a
                                href="/sample-products-template.csv"
                                className="text-sm text-blue-600 hover:underline ml-auto"
                                download
                            >
                                Download template
                            </a>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
