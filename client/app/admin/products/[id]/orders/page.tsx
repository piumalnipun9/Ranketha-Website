"use client"

import { useEffect, useState } from "react"
import { authenticatedFetch } from "@/lib/api"
import type { OrderFilters, UIProduct } from '../../../types'
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProductOrdersPage() {
    const params = useParams()
    const productId = params.id as string
    const router = useRouter()

    const [product, setProduct] = useState<UIProduct | null>(null)
    // We need a local type or extended type to hold items
    const [orders, setOrders] = useState<any[]>([])
    const [orderPage, setOrderPage] = useState(1)
    const [orderHasMore, setOrderHasMore] = useState(false)
    const [orderTotal, setOrderTotal] = useState(0)
    const ORDER_PAGE_SIZE = 10

    const [orderSearch, setOrderSearch] = useState("")
    const [orderFilters, setOrderFilters] = useState<OrderFilters>({ startDate: "", endDate: "", productId })

    // Not using bulk actions for this view as per image implying a read-only/history view
    const [loading, setLoading] = useState(true)
    const [appending, setAppending] = useState(false)

    // Fetch product name
    useEffect(() => {
        if (!productId) return
        const fetchProduct = async () => {
            try {
                const res = await authenticatedFetch(`/admin/products/${productId}`)
                if (res) setProduct(res)
            } catch (error) {
                console.error("Failed to fetch product details", error)
            }
        }
        fetchProduct()
    }, [productId])

    // Fetch orders
    const fetchOrders = async (opts?: { search?: string; startDate?: string; endDate?: string }, page: number = 1, append = false) => {
        if (append) setAppending(true)
        else setLoading(true)

        const urlParams = new URLSearchParams()
        urlParams.set('page', page.toString())
        urlParams.set('limit', ORDER_PAGE_SIZE.toString())
        urlParams.set('productId', productId)

        const search = opts?.search
        const startDate = opts?.startDate ?? (orderFilters.startDate || undefined)
        const endDate = opts?.endDate ?? (orderFilters.endDate || undefined)

        if (search && search.length > 0) urlParams.set('search', search)
        if (startDate) urlParams.set('startDate', startDate)
        if (endDate) urlParams.set('endDate', endDate)

        try {
            const ordRes = await authenticatedFetch(`/admin/orders?${urlParams.toString()}`)
            // Map orders including items
            const uiOrders = (ordRes?.orders ?? ordRes ?? []).map((o: any) => ({
                id: o.id,
                customer: o.user?.name || o.user?.email || "Customer",
                date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : "",
                status: o.status,
                total: o.totalAmount ?? 0,
                trackingNumber: o.trackingNumber ?? null,
                items: o.items?.map((item: any) => ({
                    id: item.id,
                    name: item.product?.name || "Unknown Product",
                    quantity: item.quantity,
                    price: item.price
                })) || []
            }))

            setOrders(prev => append ? [...prev, ...uiOrders] : uiOrders)

            const pagination = ordRes?.pagination
            if (pagination && typeof pagination.total === 'number') {
                setOrderTotal(pagination.total)
                setOrderHasMore(pagination.page < pagination.pages)
                setOrderPage(pagination.page)
            } else {
                setOrderHasMore(false)
                setOrderTotal(uiOrders.length)
                setOrderPage(1)
            }
        } catch (error) {
            console.error("Error fetching orders:", error)
        } finally {
            setLoading(false)
            setAppending(false)
        }
    }

    const handleLoadMore = () => {
        if (!orderHasMore || appending) return
        fetchOrders({}, orderPage + 1, true)
    }

    // Initial load
    useEffect(() => {
        fetchOrders()
    }, [])

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Orders for {product ? product.name : "Product"}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {orderTotal} orders found
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white border rounded-lg p-6 shadow-sm">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Order {order.id}</h3>
                                <div className="text-sm text-slate-500 mt-1">{order.date}</div>
                                {order.trackingNumber && (
                                    <div className="text-sm text-slate-500 mt-1">
                                        Tracking: {order.trackingNumber}
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700`}>
                                    {order.status}
                                </span>
                                <div className="text-lg font-bold text-slate-900">
                                    LKR {order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-4 mb-6">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex items-start gap-4 p-3 bg-slate-50 rounded-md">
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900 text-sm">{item.name}</div>
                                        <div className="text-sm text-slate-500 mt-1">
                                            Qty: {item.quantity} × LKR {item.price.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex gap-3">
                            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/order-details?id=${order.id}`)}>
                                View Details
                            </Button>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-500">
                        No orders found for this product.
                    </div>
                )}

                {orderHasMore && (
                    <div className="flex justify-center pt-6">
                        <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            disabled={appending}
                        >
                            {appending ? "Loading..." : "Load More Orders"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
