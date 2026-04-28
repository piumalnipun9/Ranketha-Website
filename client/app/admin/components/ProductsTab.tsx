'use client'

import { Plus, Edit, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import type { UIProduct } from '../types'

interface ProductsTabProps {
    products: UIProduct[]
    productTotal: number
    productPage: number
    productHasMore: boolean
    PRODUCT_PAGE_SIZE: number
    selectedProducts: string[]
    setSelectedProducts: (value: string[] | ((prev: string[]) => string[])) => void
    productSearch: string
    setProductSearch: (value: string) => void
    fetchProducts: (search?: string, page?: number, append?: boolean) => Promise<UIProduct[] | void>
    handleAddProduct: () => void
    handleEditProduct: (product: UIProduct) => void
    handleDeleteProduct: (id: string) => void
    handleBulkDeleteProducts: () => void
    setIsBulkDialogOpen: (open: boolean) => void
    onViewOrders: (product: UIProduct) => void
}

export function ProductsTab({
    products,
    productTotal,
    productPage,
    productHasMore,
    PRODUCT_PAGE_SIZE,
    selectedProducts,
    setSelectedProducts,
    productSearch,
    setProductSearch,
    fetchProducts,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleBulkDeleteProducts,
    setIsBulkDialogOpen,
    onViewOrders,
}: ProductsTabProps) {
    return (
        <div className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Product Management</CardTitle>
                        <div className="flex items-center gap-2">
                            <Input
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-48 md:w-72"
                            />
                            {productSearch && (
                                <Button variant="outline" size="sm" onClick={() => setProductSearch("")}>Clear</Button>
                            )}
                            <Button onClick={handleAddProduct}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </Button>
                            <Button variant="outline" onClick={() => setIsBulkDialogOpen(true)}>Upload CSV</Button>
                        </div>

                        <div className="flex items-center gap-2">
                            {selectedProducts.length > 0 && (
                                <Button variant="destructive" onClick={handleBulkDeleteProducts}>Delete Selected</Button>
                            )}
                            <input
                                type="checkbox"
                                className="w-4 h-4 mt-1"
                                checked={selectedProducts.length === products.length && products.length > 0}
                                onChange={(e) => {
                                    if (e.target.checked) setSelectedProducts(products.map(p => p.id))
                                    else setSelectedProducts([])
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg"
                            >
                                <input
                                    type="checkbox"
                                    className="w-4 h-4"
                                    checked={selectedProducts.includes(product.id)}
                                    onChange={(e) => {
                                        setSelectedProducts((prev) => {
                                            if (e.target.checked) {
                                                return prev.includes(product.id) ? prev : [...prev, product.id]
                                            }
                                            return prev.filter(id => id !== product.id)
                                        })
                                    }}
                                />
                                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <Image
                                        src={product.image || "/placeholder.svg"}
                                        alt={product.name}
                                        width={64}
                                        height={64}
                                        className="object-contain"
                                    />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900">{product.name}</h3>
                                    <p className="text-sm text-slate-600">{product.category || "Uncategorized"}</p>
                                    <p className="text-sm text-slate-500">Stock: {product.stock}</p>
                                </div>

                                <div className="text-right">
                                    <p className="font-semibold text-slate-900">LKR {product.price.toFixed(2)}</p>
                                </div>

                                <div className="flex space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => onViewOrders(product)} title="View Orders">
                                        <ShoppingBag className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-slate-600">Showing {products.length} of {productTotal || products.length} products</p>
                        <div className="flex gap-2">
                            {productHasMore && (
                                <Button
                                    variant="outline"
                                    onClick={async () => {
                                        const next = productPage + 1
                                        await fetchProducts(productSearch.trim() || undefined, next, true)
                                    }}
                                >
                                    Load more
                                </Button>
                            )}
                            {productHasMore && (
                                <Button
                                    onClick={async () => {
                                        let nextPage = productPage + 1
                                        while (true) {
                                            const prevCount = products.length
                                            await fetchProducts(productSearch.trim() || undefined, nextPage, true)
                                            nextPage++
                                            if (prevCount === products.length || nextPage > Math.ceil((productTotal || products.length) / PRODUCT_PAGE_SIZE)) {
                                                break
                                            }
                                        }
                                    }}
                                >
                                    Show all
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
