"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { authenticatedFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UIOrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface UIShippingAddress {
  line1?: string
  line2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

interface UIOrder {
  id: string
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  date: string
  status: string
  total: number
  trackingNumber?: string | null
  items: UIOrderItem[]
  shipping?: UIShippingAddress
}

const STATUS_OPTIONS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const

type StatusType = typeof STATUS_OPTIONS[number]

export default function OrderDetails() {
  const searchParams = useSearchParams()
  const orderId = searchParams?.get("id") || ""

  const [order, setOrder] = useState<UIOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusType | "">("")
  const [tracking, setTracking] = useState<string>("")
  const [editedPrices, setEditedPrices] = useState<Record<string, string>>({})
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set())

  // Helper to normalize API order -> UI order
  const mapApiOrderToUI = (data: any): UIOrder => {
    const ui: UIOrder = {
      id: data.id,
      customerName: data.user?.name || "Customer",
      customerEmail: data.user?.email || "",
      customerPhone: data.user?.phone ?? data.shippingAddress?.phoneNumber ?? null,
      date: data.createdAt ? new Date(data.createdAt).toLocaleString() : "",
      status: data.status,
      total:
        data.totalAmount ??
        data.items?.reduce(
          (s: number, it: any) => s + (it.price ?? 0) * (it.quantity ?? 0),
          0
        ) ?? 0,
      trackingNumber: data.trackingNumber ?? null,
      items: (data.items || []).map((it: any) => ({
        id: it.id,
        name: it.product?.name || "Item",
        price: it.price ?? it.product?.price ?? 0,
        quantity: it.quantity ?? 1,
        image:
          (Array.isArray(it.product?.imageUrls) && it.product.imageUrls[0]) ||
          "/placeholder.svg",
      })),
      shipping: data.shippingAddress
        ? {
          line1:
            data.shippingAddress.line1 ||
            data.shippingAddress.addressLine1 ||
            data.shippingAddress.street ||
            undefined,
          line2:
            data.shippingAddress.line2 ||
            data.shippingAddress.addressLine2 ||
            undefined,
          city: data.shippingAddress.city || undefined,
          state: data.shippingAddress.state || undefined,
          postalCode:
            data.shippingAddress.postalCode ||
            data.shippingAddress.zip ||
            undefined,
          country: data.shippingAddress.country || undefined,
        }
        : undefined,
    }
    return ui
  }

  const loadOrder = async (id: string) => {
    const data = await authenticatedFetch(`/admin/orders/${id}`)
    const ui = mapApiOrderToUI(data)
    setOrder(ui)
    setStatus(ui.status as StatusType)
    setTracking(ui.trackingNumber || "")
    setEditedPrices(Object.fromEntries(ui.items.map((it) => [it.id, it.price.toString()])))
  }

  useEffect(() => {
    let ignore = false
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        if (!orderId) {
          setError("Missing order id")
          return
        }
        const data = await authenticatedFetch(`/admin/orders/${orderId}`)
        if (ignore) return
        const ui = mapApiOrderToUI(data)
        setOrder(ui)
        setStatus(ui.status as StatusType)
        setTracking(ui.trackingNumber || "")
        setEditedPrices(Object.fromEntries(ui.items.map((it) => [it.id, it.price.toString()])))
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load order")
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [orderId])

  const lineItemsTotal = useMemo(() => {
    return order?.items?.reduce((sum, it) => sum + it.price * it.quantity, 0) ?? 0
  }, [order?.items])

  const handleStatusSave = async () => {
    if (!order) return
    try {
      setSaving(true)
      await authenticatedFetch(`/admin/orders/${order.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      })
      setOrder({ ...order, status: status as string })

      // If status was changed to CANCELLED, show a success message about restocking
      if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
        alert("Order cancelled successfully. Items have been restocked.");
      }
    } catch (e: any) {
      alert(e?.message || "Failed to update status")
    } finally {
      setSaving(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return

    // Ask for confirmation before cancelling
    if (!confirm("Are you sure you want to cancel this order? The items will be returned to stock.")) {
      return;
    }

    try {
      setSaving(true)
      await authenticatedFetch(`/admin/orders/${order.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      setOrder({ ...order, status: 'CANCELLED' })
      setStatus('CANCELLED')
      alert("Order cancelled successfully. Items have been restocked.");
    } catch (e: any) {
      alert(e?.message || "Failed to cancel order")
    } finally {
      setSaving(false)
    }
  }

  const handleTrackingSave = async () => {
    if (!order) return
    try {
      setSaving(true)
      const updated = await authenticatedFetch(`/admin/orders/${order.id}/tracking`, {
        method: "PUT",
        body: JSON.stringify({ trackingNumber: tracking })
      })
      const ui = mapApiOrderToUI(updated)
      setOrder(ui)
      setStatus(ui.status as StatusType)
      setTracking(ui.trackingNumber || "")
    } catch (e: any) {
      alert(e?.message || "Failed to update tracking number")
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!order) return
    if (!confirm("Remove this item from the order? It will be restocked if the order isn't cancelled.")) return
    try {
      setSavingItems(prev => {
        const next = new Set(prev)
        next.add(itemId)
        return next
      })
      const updated = await authenticatedFetch(`/admin/orders/${order.id}/items/${itemId}`, {
        method: "DELETE",
      })
      const ui = mapApiOrderToUI(updated)
      setOrder(ui)
      setEditedPrices(Object.fromEntries(ui.items.map((it) => [it.id, it.price.toString()])))
    } catch (e: any) {
      alert(e?.message || "Failed to remove item")
    } finally {
      setSavingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handleSaveItemPrice = async (itemId: string) => {
    if (!order) return
    const raw = editedPrices[itemId]
    const newPrice = raw != null && raw !== "" ? parseFloat(raw) : NaN
    if (isNaN(newPrice) || newPrice < 0) {
      alert("Enter a valid non-negative price")
      return
    }
    try {
      setSavingItems(prev => {
        const next = new Set(prev)
        next.add(itemId)
        return next
      })
      const updated = await authenticatedFetch(`/admin/orders/${order.id}/items/${itemId}/price`, {
        method: "PUT",
        body: JSON.stringify({ price: newPrice })
      })
      const ui = mapApiOrderToUI(updated)
      setOrder(ui)
      setEditedPrices(Object.fromEntries(ui.items.map((it) => [it.id, it.price.toString()])))
    } catch (e: any) {
      alert(e?.message || "Failed to update price")
    } finally {
      setSavingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-slate-600">Loading order…</span>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Order not found"}</p>
          <Link href="/admin" className="text-blue-600 underline">Back to Admin</Link>
        </div>
      </div>
    )
  }

  return (
    <section className="relative min-h-screen bg-slate-50">
      <div className="relative max-w-4xl mx-auto px-4 py-16">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>
        </div>

        <div className="bg-white/95 rounded-2xl shadow-2xl p-6 md:p-10 backdrop-blur-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-slate-500">Placed on {order.date}</p>
              <p className="text-slate-500">Customer: {order.customerName}{order.customerEmail ? ` (${order.customerEmail})` : ""}</p>
              {order.customerPhone && (
                <p className="text-slate-500">Phone: {order.customerPhone}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusType)}
                className="border px-3 py-2 rounded"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Button onClick={handleStatusSave} disabled={saving || status === order.status}>
                {saving ? "Saving…" : "Save"}
              </Button>
              {order.status !== 'CANCELLED' && (
                <Button
                  variant="destructive"
                  onClick={handleCancelOrder}
                  disabled={saving}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Cancel Order & Restock
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
            <div>
              <p className="text-slate-500">Tracking Number</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Enter tracking number"
                className="border px-3 py-2 rounded w-64"
              />
              <Button onClick={handleTrackingSave} disabled={saving}>
                {saving ? "Saving…" : "Save Tracking"}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.status !== 'CANCELLED' && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-sm text-blue-800">
                    <strong>Note:</strong> Cancelling this order will automatically restock all items.
                  </div>
                )}
                {order.status === 'CANCELLED' && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3 text-sm text-gray-700">
                    This order has been cancelled and all items have been restocked.
                  </div>
                )}
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
                      <Image src={item.image} alt={item.name} width={56} height={56} className="object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <label className="text-slate-600">Unit Price (LKR):</label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={editedPrices[item.id] ?? item.price.toString()}
                          onChange={(e) => setEditedPrices({ ...editedPrices, [item.id]: e.target.value })}
                          className="border px-2 py-1 rounded w-32"
                          disabled={savingItems.has(item.id)}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveItemPrice(item.id)}
                          disabled={savingItems.has(item.id) || (parseFloat(editedPrices[item.id] ?? `${item.price}`) === item.price)}
                        >
                          {savingItems.has(item.id) ? "Saving…" : "Save Price"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={savingItems.has(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900 font-semibold">LKR {(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">(LKR {item.price.toFixed(2)} each)</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Items</span>
                  <span>{order.items.length}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total</span>
                  <span className="font-bold text-slate-900">LKR {lineItemsTotal.toFixed(2)}</span>
                </div>
                <div className="pt-2">
                  <span className="text-sm font-semibold">Status: </span>
                  <span className="text-sm">{order.status}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {order.shipping && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-700 text-sm space-y-1">
                    {order.shipping.line1 && <p>{order.shipping.line1}</p>}
                    {order.shipping.line2 && <p>{order.shipping.line2}</p>}
                    {(order.shipping.city || order.shipping.state || order.shipping.postalCode) && (
                      <p>{[order.shipping.city, order.shipping.state, order.shipping.postalCode].filter(Boolean).join(", ")}</p>
                    )}
                    {order.shipping.country && <p>{order.shipping.country}</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
