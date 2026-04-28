"use client"

import { useEffect, useState, useRef } from "react"
import { authenticatedFetch } from "@/lib/api"
import { getCache, setCache } from '../hooks/useAdminCache'
import { OrdersTab } from '../components'
import { generateInvoicePDF } from '../utils/generateInvoicePDF'
import type { UIOrder, OrderFilters } from '../types'
import { useSearchParams } from "next/navigation"

export default function OrdersPage() {
    const [orders, setOrders] = useState<UIOrder[]>([])
    const [orderPage, setOrderPage] = useState(1)
    const [orderHasMore, setOrderHasMore] = useState(false)
    const [orderTotal, setOrderTotal] = useState(0)
    const ORDER_PAGE_SIZE = 20

    const searchParams = useSearchParams()

    // Initialize search with URL param if exists
    // Also support productId filtering
    const [orderSearch, setOrderSearch] = useState(searchParams.get("search") || "")
    const [orderFilters, setOrderFilters] = useState<OrderFilters>({ startDate: "", endDate: "", productId: searchParams.get("productId") || undefined })
    const [selectedOrders, setSelectedOrders] = useState<string[]>([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const initialLoadDone = useRef(false)

    // Helper: fetch orders
    const fetchOrders = async (opts?: { search?: string; startDate?: string; endDate?: string; productId?: string }, page: number = 1, append = false) => {
        const params = new URLSearchParams()
        params.set('page', page.toString())
        params.set('limit', ORDER_PAGE_SIZE.toString())
        const search = opts?.search
        const startDate = opts?.startDate ?? (orderFilters.startDate || undefined)
        const endDate = opts?.endDate ?? (orderFilters.endDate || undefined)
        const productId = opts?.productId ?? (orderFilters.productId || undefined)

        if (search && search.length > 0) params.set('search', search)
        if (startDate) params.set('startDate', startDate)
        if (endDate) params.set('endDate', endDate)
        if (productId) params.set('productId', productId)
        const ordRes = await authenticatedFetch(`/admin/orders?${params.toString()}`)
        const uiOrders: UIOrder[] = (ordRes?.orders ?? ordRes ?? []).map((o: any) => ({
            id: o.id,
            customer: o.user?.name || o.user?.email || "Customer",
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
            status: o.status,
            total: o.totalAmount ?? 0,
            trackingNumber: o.trackingNumber ?? null,
            notes: o.notes ?? null,
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
    }

    // Debounce order search
    useEffect(() => {
        if (!initialLoadDone.current) return
        const t = setTimeout(() => {
            const q = orderSearch.trim()
            setOrderPage(1)
            fetchOrders({
                search: q || undefined,
                startDate: orderFilters.startDate || undefined,
                endDate: orderFilters.endDate || undefined,
            }, 1, false)
        }, 300)
        return () => clearTimeout(t)
    }, [orderSearch, orderFilters])

    // Initial load
    useEffect(() => {
        const loadAll = async () => {
            try {
                setError(null)
                const cached = getCache()
                if (cached && cached.orders) {
                    setOrders(cached.orders)
                    if (cached.orderPagination) {
                        setOrderTotal(cached.orderPagination.total)
                        setOrderHasMore(cached.orderPagination.hasMore)
                        setOrderPage(cached.orderPagination.page)
                    }
                    setLoading(false)
                    initialLoadDone.current = true
                } else {
                    setLoading(true)
                }

                await fetchOrders({
                    startDate: orderFilters.startDate || undefined,
                    endDate: orderFilters.endDate || undefined,
                }, 1, false)

            } catch (e: any) {
                console.error(e)
                setError(e?.message || "Failed to load orders")
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
            orders,
            orderPagination: { total: orderTotal, page: orderPage, hasMore: orderHasMore },
        })
    }, [orders, orderTotal, orderPage, orderHasMore])

    const handleDeleteOrder = async (id: string) => {
        try {
            if (!confirm("Delete this order? Only CANCELLED orders can be deleted.")) return
            await authenticatedFetch(`/admin/orders/${id}`, { method: "DELETE" })
            await fetchOrders({
                search: orderSearch.trim() || undefined,
                startDate: orderFilters.startDate || undefined,
                endDate: orderFilters.endDate || undefined,
            })
        } catch (err: any) {
            alert(err?.message || "Failed to delete order")
        }
    }

    const handleBulkDeleteOrders = async () => {
        if (selectedOrders.length === 0) return
        const cancellable = orders.filter(o => selectedOrders.includes(o.id) && o.status === "CANCELLED").map(o => o.id)
        const skipped = selectedOrders.length - cancellable.length
        if (cancellable.length === 0) {
            alert("No selected orders are cancellable (only CANCELLED orders can be deleted).")
            return
        }
        if (!confirm(`Delete ${cancellable.length} selected CANCELLED order(s)?${skipped > 0 ? ` (Skipping ${skipped} non-cancelled)` : ""}`)) return
        try {
            for (const id of cancellable) {
                await authenticatedFetch(`/admin/orders/${id}`, { method: "DELETE" })
            }
            setSelectedOrders([])
            await fetchOrders({
                search: orderSearch.trim() || undefined,
                startDate: orderFilters.startDate || undefined,
                endDate: orderFilters.endDate || undefined,
            })
        } catch (err: any) {
            alert(err?.message || "Failed to delete selected orders")
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
                    <p className="text-slate-600">Track and manage customer orders</p>
                </div>
            </div>

            <OrdersTab
                orders={orders}
                orderTotal={orderTotal}
                orderPage={orderPage}
                orderHasMore={orderHasMore}
                ORDER_PAGE_SIZE={ORDER_PAGE_SIZE}
                selectedOrders={selectedOrders}
                setSelectedOrders={setSelectedOrders}
                orderSearch={orderSearch}
                setOrderSearch={setOrderSearch}
                orderFilters={orderFilters}
                setOrderFilters={setOrderFilters}
                fetchOrders={fetchOrders}
                handleDeleteOrder={handleDeleteOrder}
                handleBulkDeleteOrders={handleBulkDeleteOrders}
                onDownloadInvoice={async (orderId) => {
                    try {
                        const orderDetails = await authenticatedFetch(`/admin/orders/${orderId}`)
                        if (!orderDetails) {
                            alert('Failed to fetch order details')
                            return
                        }

                        const order = orders.find(o => o.id === orderId)
                        if (!order) {
                            alert('Order not found')
                            return
                        }

                        const items = (orderDetails.items || []).map((item: any) => ({
                            name: item.product?.name || 'Unknown Product',
                            quantity: item.quantity || 1,
                            price: item.price || 0
                        }))

                        generateInvoicePDF({
                            order,
                            items,
                            shippingAddress: orderDetails.shippingAddress || null,
                            customerEmail: orderDetails.user?.email || undefined
                        })
                    } catch (error) {
                        console.error('Failed to generate invoice:', error)
                        alert('Failed to generate invoice')
                    }
                }}
            />
        </div>
    )
}
