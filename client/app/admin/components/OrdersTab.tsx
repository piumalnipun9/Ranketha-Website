'use client'

import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import type { UIOrder, OrderFilters } from '../types'

interface OrdersTabProps {
    orders: UIOrder[]
    orderTotal: number
    orderPage: number
    orderHasMore: boolean
    ORDER_PAGE_SIZE: number
    selectedOrders: string[]
    setSelectedOrders: (value: string[] | ((prev: string[]) => string[])) => void
    orderSearch: string
    setOrderSearch: (value: string) => void
    orderFilters: OrderFilters
    setOrderFilters: (value: OrderFilters | ((prev: OrderFilters) => OrderFilters)) => void
    fetchOrders: (opts?: { search?: string; startDate?: string; endDate?: string }, page?: number, append?: boolean) => Promise<UIOrder[] | void>
    handleDeleteOrder: (id: string) => void
    handleBulkDeleteOrders: () => void
    onDownloadInvoice: (orderId: string) => void
}

export function OrdersTab({
    orders,
    orderTotal,
    orderPage,
    orderHasMore,
    ORDER_PAGE_SIZE,
    selectedOrders,
    setSelectedOrders,
    orderSearch,
    setOrderSearch,
    orderFilters,
    setOrderFilters,
    fetchOrders,
    handleDeleteOrder,
    handleBulkDeleteOrders,
    onDownloadInvoice,
}: OrdersTabProps) {
    return (
        <div className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Order Management</CardTitle>
                        <div className="flex items-center gap-2">
                            <Input
                                value={orderSearch}
                                onChange={(e) => setOrderSearch(e.target.value)}
                                placeholder="Search orders (ID, customer, email)..."
                                className="w-48 md:w-72"
                            />
                            {orderSearch && (
                                <Button variant="outline" size="sm" onClick={() => setOrderSearch("")}>Clear</Button>
                            )}
                            <Input type="date" value={orderFilters.startDate} onChange={(e) => setOrderFilters(s => ({ ...s, startDate: e.target.value }))} />
                            <Input type="date" value={orderFilters.endDate} onChange={(e) => setOrderFilters(s => ({ ...s, endDate: e.target.value }))} />
                            {(orderFilters.startDate || orderFilters.endDate) && (
                                <Button variant="outline" size="sm" onClick={() => setOrderFilters({ startDate: "", endDate: "" })}>Reset Dates</Button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedOrders.length > 0 && (
                                <Button variant="destructive" onClick={handleBulkDeleteOrders}>Delete Selected</Button>
                            )}
                            <input
                                type="checkbox"
                                className="w-4 h-4 mt-1"
                                checked={selectedOrders.length === orders.length && orders.length > 0}
                                onChange={(e) => {
                                    if (e.target.checked) setSelectedOrders(orders.map(o => o.id))
                                    else setSelectedOrders([])
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="border border-slate-200 rounded-lg p-6">
                                <div className="mb-2">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4"
                                        checked={selectedOrders.includes(order.id)}
                                        onChange={(e) => {
                                            setSelectedOrders((prev) => {
                                                if (e.target.checked) {
                                                    return prev.includes(order.id) ? prev : [...prev, order.id]
                                                }
                                                return prev.filter(id => id !== order.id)
                                            })
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">Order {order.id.slice(0, 8)}</h3>
                                        <p className="text-sm text-slate-600">Customer: {order.customer}</p>
                                        <p className="text-sm text-slate-600">Date: {order.date}</p>
                                        {order.trackingNumber && (
                                            <p className="text-sm text-slate-600">Tracking: {order.trackingNumber}</p>
                                        )}
                                        {order.notes && (
                                            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                                                <span className="font-medium">Notes:</span> {order.notes}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${order.status === "DELIVERED" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                                            {order.status}
                                        </span>
                                        <span className="font-semibold text-lg">LKR {order.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-2">
                                    <Link href={`/admin/order-details?id=${order.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">View Details</Link>
                                    {order.status === "CANCELLED" && (
                                        <Button
                                            variant="outline"
                                            className="text-red-600 border-red-300 hover:bg-red-50"
                                            onClick={() => handleDeleteOrder(order.id)}
                                        >
                                            Delete Order
                                        </Button>
                                    )}
                                    {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                                        <Button
                                            variant="outline"
                                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                            onClick={() => {
                                                window.location.href = `/admin/order-details?id=${order.id}`;
                                            }}
                                        >
                                            Cancel & Restock
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="text-green-600 border-green-300 hover:bg-green-50"
                                        onClick={() => onDownloadInvoice(order.id)}
                                    >
                                        <FileDown className="h-4 w-4 mr-2" />
                                        Invoice
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-slate-600">Showing {orders.length} of {orderTotal || orders.length} orders</p>
                        <div className="flex gap-2">
                            {orderHasMore && (
                                <Button
                                    variant="outline"
                                    onClick={async () => {
                                        const next = orderPage + 1
                                        await fetchOrders({
                                            search: orderSearch.trim() || undefined,
                                            startDate: orderFilters.startDate || undefined,
                                            endDate: orderFilters.endDate || undefined,
                                        }, next, true)
                                    }}
                                >
                                    Load more
                                </Button>
                            )}
                            {orderHasMore && (
                                <Button
                                    onClick={async () => {
                                        let nextPage = orderPage + 1
                                        while (true) {
                                            const prevCount = orders.length
                                            await fetchOrders({
                                                search: orderSearch.trim() || undefined,
                                                startDate: orderFilters.startDate || undefined,
                                                endDate: orderFilters.endDate || undefined,
                                            }, nextPage, true)
                                            nextPage++
                                            if (prevCount === orders.length || nextPage > Math.ceil((orderTotal || orders.length) / ORDER_PAGE_SIZE)) {
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
