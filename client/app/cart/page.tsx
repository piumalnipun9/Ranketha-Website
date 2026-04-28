"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowLeft, Trash2, ShoppingCart, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { Navigation } from "@/components/home/Navigation"
import { useCartStore } from "@/lib/cart-store"
import { CartIcon } from "@/components/cart-icon"

export default function CartPage() {
  const {
    items: cartItems,
    isLoading,
    updateQuantity,
    removeItem,
  removeItems,
    getTotalPrice,
    syncWithServer,
    shippingMethod,
    setShippingMethod
  } = useCartStore()

  // Local editable quantities to avoid server race conditions while typing
  const [editingQty, setEditingQty] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({})

  // Initialize / sync local quantities when cart items change length or ids
  useEffect(() => {
    setEditingQty(prev => {
      const next: Record<string, number> = { ...prev }
      cartItems.forEach(i => { if (next[i.id] == null) next[i.id] = i.quantity })
      // Remove orphaned ids
      Object.keys(next).forEach(id => { if (!cartItems.find(ci => ci.id === id)) delete next[id] })
      return next
    })
    setSelected(prev => {
      const next: Record<string, boolean> = {}
      cartItems.forEach(i => { next[i.id] = prev[i.id] ?? false })
      return next
    })
  }, [cartItems.map(i => i.id).join('|')])

  const scheduleUpdate = (id: string, value: number) => {
    // Clamp to stock if available
    const item = cartItems.find(ci => ci.id === id)
    const maxQty = item?.stockQuantity && item.stockQuantity > 0 ? item.stockQuantity : undefined
    const clamped = maxQty ? Math.min(Math.max(1, value), maxQty) : Math.max(1, value)
    // Clear existing timer
    const timers = debounceTimers.current
    if (timers[id]) clearTimeout(timers[id])
    timers[id] = setTimeout(() => {
      const itemNow = cartItems.find(ci => ci.id === id)
      if (itemNow && itemNow.quantity !== clamped) {
        updateQuantity(id, clamped)
      }
      delete timers[id]
    }, 400)
  }

  // Fetch cart when component mounts
  useEffect(() => {
    syncWithServer()
  }, [syncWithServer])

  const subtotal = getTotalPrice();
  
  // Calculate shipping cost based on method
  const getShippingCost = () => {
    if (shippingMethod === "pickup") return 0 // Free for pickup
    if (shippingMethod === "pickmeflash") return 0 // Customer pays directly to Pick Me Flash
    // Standard delivery
    return subtotal >= 10000 ? 0 : 500 // Free standard shipping over 10000 LKR
  }
  
  const shipping = getShippingCost()
  const tax = subtotal * 0.00 // 0% tax
  const total = subtotal + shipping + tax

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="text-2xl font-bold text-slate-900">
                RoboClub
              </Link>
              <CartIcon />
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            href="/products"
            className="flex items-center text-slate-600 hover:text-blue-600 transition-colors mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-blue-600"
                  checked={cartItems.length > 0 && cartItems.every(i => selected[i.id])}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setSelected(Object.fromEntries(cartItems.map(i => [i.id, checked])))
                  }}
                />
                <span>Select all</span>
              </label>
              <Button
                variant="outline"
                size="sm"
                disabled={cartItems.every(i => !selected[i.id])}
                onClick={async () => {
                  const ids = cartItems.filter(i => selected[i.id]).map(i => i.id)
                  if (ids.length === 0) return
                  await removeItems(ids)
                  setSelected(prev => {
                    const next = { ...prev }
                    ids.forEach(id => delete next[id])
                    return next
                  })
                }}
              >
                Remove selected
              </Button>
            </div>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h3>
            <p className="text-slate-600 mb-6">Add some products to get started!</p>
            <Link href="/products">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-blue-600"
                        checked={!!selected[item.id]}
                        onChange={(e) => setSelected(prev => ({ ...prev, [item.id]: e.target.checked }))}
                        aria-label={`Select ${item.name}`}
                      />
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{item.name}</h3>
                        <p className="text-slate-600">LKR {item.price.toFixed(2)} each</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() => {
                            const current = editingQty[item.id] ?? item.quantity
                            const next = Math.max(1, current - 1)
                            setEditingQty(prev => ({ ...prev, [item.id]: next }))
                            scheduleUpdate(item.id, next)
                          }}
                          disabled={(editingQty[item.id] ?? item.quantity) <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={editingQty[item.id] ?? item.quantity}
                          onChange={(e) => {
                            const raw = Number.parseInt(e.target.value)
                            const base = isNaN(raw) ? 1 : raw
                            const max = item.stockQuantity && item.stockQuantity > 0 ? item.stockQuantity : undefined
                            const q = max ? Math.min(Math.max(1, base), max) : Math.max(1, base)
                            setEditingQty(prev => ({ ...prev, [item.id]: q }))
                            scheduleUpdate(item.id, q)
                          }}
                          onBlur={() => {
                            const current = editingQty[item.id]
                            const max = item.stockQuantity && item.stockQuantity > 0 ? item.stockQuantity : undefined
                            const clamped = current ? (max ? Math.min(Math.max(1, current), max) : Math.max(1, current)) : 1
                            if (clamped !== (editingQty[item.id] ?? item.quantity)) {
                              setEditingQty(prev => ({ ...prev, [item.id]: clamped }))
                            }
                            if (clamped !== item.quantity) updateQuantity(item.id, clamped)
                          }}
                          className="w-16 sm:w-20 text-center appearance-none"
                          min="1"
                          max={item.stockQuantity && item.stockQuantity > 0 ? item.stockQuantity : undefined}
                          inputMode="numeric"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() => {
                            const current = editingQty[item.id] ?? item.quantity
                            const max = item.stockQuantity && item.stockQuantity > 0 ? item.stockQuantity : undefined
                            const next = max ? Math.min(current + 1, max) : current + 1
                            setEditingQty(prev => ({ ...prev, [item.id]: next }))
                            scheduleUpdate(item.id, next)
                          }}
                          disabled={Boolean(item.stockQuantity && (editingQty[item.id] ?? item.quantity) >= item.stockQuantity)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {item.stockQuantity != null && (
                          <span className="text-xs text-slate-500 ml-1">Max {item.stockQuantity}</span>
                        )}
                      </div>

                      <div className="w-full sm:w-auto sm:text-right flex items-center justify-between sm:block">
                        <p className="font-semibold text-slate-900">LKR {(item.price * item.quantity).toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 backdrop-blur-sm lg:sticky lg:top-24">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Order Summary</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium">LKR {subtotal.toFixed(2)}</span>
                    </div>
                    
                    {/* Shipping method selection */}
                    <div className="mt-4 mb-2">
                      <p className="text-slate-700 font-medium mb-2">Shipping Method:</p>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="shipping" 
                            value="standard" 
                            checked={shippingMethod === "standard"}
                            onChange={() => setShippingMethod("standard")}
                            className="text-blue-600" 
                          />
                          <span>Standard Delivery {subtotal >= 10000 ? "(Free)" : "(LKR 500)"}</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="shipping" 
                            value="pickup" 
                            checked={shippingMethod === "pickup"}
                            onChange={() => setShippingMethod("pickup")}
                            className="text-blue-600" 
                          />
                          <span>Store Pickup (Free)</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="shipping" 
                            value="pickmeflash" 
                            checked={shippingMethod === "pickmeflash"}
                            onChange={() => setShippingMethod("pickmeflash")}
                            className="text-blue-600" 
                          />
                          <span>Pick Me Flash (Paid by customer)</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Shipping</span>
                      <span className="font-medium">
                        {shippingMethod === "pickmeflash" ? "Paid by customer" : 
                         shipping === 0 ? "Free" : `LKR ${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tax</span>
                      <span className="font-medium">LKR {tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-slate-900">Total</span>
                        <span className="text-lg font-bold text-blue-600">LKR {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {subtotal < 10000 && shippingMethod === "standard" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                      <p className="text-sm text-blue-700">Add LKR {(10000 - subtotal).toFixed(2)} more for free shipping!</p>
                    </div>
                  )}
                  
                  {shippingMethod === "pickmeflash" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                      <p className="text-sm text-amber-700">Pick Me Flash delivery fee will be charged directly by the courier service upon delivery.</p>
                    </div>
                  )}

                  <Link href="/checkout">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      {/* Hide number input arrows on mobile only, scoped to this page */}
      <style jsx global>{`
        @media (max-width: 640px) {
          .cart-page input[type=number]::-webkit-outer-spin-button,
          .cart-page input[type=number]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          .cart-page input[type=number] {
            -moz-appearance: textfield;
          }
        }
      `}</style>
    </div>
  )
}
