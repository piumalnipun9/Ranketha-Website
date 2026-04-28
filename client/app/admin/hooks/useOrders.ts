'use client'

import { useState, useCallback } from 'react'
import { UIOrder, OrderFilters } from '../types'
import { authenticatedFetch } from '@/lib/api'

const ORDER_PAGE_SIZE = 20

export function useOrders() {
    const [orders, setOrders] = useState<UIOrder[]>([])
    const [orderPage, setOrderPage] = useState(1)
    const [orderHasMore, setOrderHasMore] = useState(false)
    const [orderTotal, setOrderTotal] = useState(0)
    const [selectedOrders, setSelectedOrders] = useState<string[]>([])
    const [orderSearch, setOrderSearch] = useState("")
    const [orderFilters, setOrderFilters] = useState<OrderFilters>({ startDate: "", endDate: "" })

    const fetchOrders = useCallback(async (
        opts?: { search?: string; startDate?: string; endDate?: string },
        page: number = 1,
        append = false
    ) => {
        const params = new URLSearchParams()
        params.set('page', page.toString())
        params.set('limit', ORDER_PAGE_SIZE.toString())
        const search = opts?.search
        const startDate = opts?.startDate
        const endDate = opts?.endDate
        if (search && search.length > 0) params.set('search', search)
        if (startDate) params.set('startDate', startDate)
        if (endDate) params.set('endDate', endDate)
        const ordRes = await authenticatedFetch(`/admin/orders?${params.toString()}`)
        const uiOrders: UIOrder[] = (ordRes?.orders ?? ordRes ?? []).map((o: any) => ({
            id: o.id,
            customer: o.user?.name || o.user?.email || "Customer",
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
            status: o.status,
            total: o.totalAmount ?? 0,
            trackingNumber: o.trackingNumber ?? null,
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
        return uiOrders
    }, [])

    const handleDeleteOrder = useCallback(async (id: string) => {
        try {
            if (!confirm("Delete this order? Only CANCELLED orders can be deleted.")) return false
            await authenticatedFetch(`/admin/orders/${id}`, { method: "DELETE" })
            await fetchOrders({
                search: orderSearch.trim() || undefined,
                startDate: orderFilters.startDate || undefined,
                endDate: orderFilters.endDate || undefined,
            }, 1, false)
            return true
        } catch (err: any) {
            alert(err?.message || "Failed to delete order")
            return false
        }
    }, [orderSearch, orderFilters, fetchOrders])

    const handleBulkDeleteOrders = useCallback(async () => {
        if (selectedOrders.length === 0) return false
        const cancellable = orders.filter(o => selectedOrders.includes(o.id) && o.status === "CANCELLED").map(o => o.id)
        const skipped = selectedOrders.length - cancellable.length
        if (cancellable.length === 0) {
            alert("No selected orders are cancellable (only CANCELLED orders can be deleted).")
            return false
        }
        if (!confirm(`Delete ${cancellable.length} selected CANCELLED order(s)?${skipped > 0 ? ` (Skipping ${skipped} non-cancelled)` : ""}`)) return false
        try {
            for (const id of cancellable) {
                await authenticatedFetch(`/admin/orders/${id}`, { method: "DELETE" })
            }
            setSelectedOrders([])
            await fetchOrders({
                search: orderSearch.trim() || undefined,
                startDate: orderFilters.startDate || undefined,
                endDate: orderFilters.endDate || undefined,
            }, 1, false)
            return true
        } catch (err: any) {
            alert(err?.message || "Failed to delete selected orders")
            return false
        }
    }, [selectedOrders, orders, orderSearch, orderFilters, fetchOrders])

    return {
        // State
        orders,
        setOrders,
        orderPage,
        setOrderPage,
        orderHasMore,
        setOrderHasMore,
        orderTotal,
        setOrderTotal,
        selectedOrders,
        setSelectedOrders,
        orderSearch,
        setOrderSearch,
        orderFilters,
        setOrderFilters,
        ORDER_PAGE_SIZE,
        // Actions
        fetchOrders,
        handleDeleteOrder,
        handleBulkDeleteOrders,
    }
}
