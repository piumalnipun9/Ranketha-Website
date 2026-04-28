"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCartStore } from "@/lib/cart-store"
import Image from "next/image"
import Link from "next/link"

export function CartDrawer() {
  const {
    items,
    updateQuantity,
    removeItem,
    removeItems,
    getTotalItems,
    getTotalPrice,
    isCartOpen,
    setCartOpen,
  } = useCartStore()
  const [localQty, setLocalQty] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const timers = useRef<Record<string, NodeJS.Timeout>>({})

  // Sync local quantities when drawer opens or items change
  useEffect(() => {
    if (!isCartOpen) return;
    setLocalQty(prev => {
      const next: Record<string, number> = { ...prev }
      items.forEach(i => { next[i.id] = i.quantity })
      Object.keys(next).forEach(id => { if (!items.find(it => it.id === id)) delete next[id] })
      return next
    })
    setSelected(prev => {
      const next: Record<string, boolean> = {}
      items.forEach(i => { next[i.id] = prev[i.id] ?? false })
      return next
    })
  }, [isCartOpen, items.map(i => i.id).join('|')])

  const schedule = (id: string, quantity: number) => {
    if (timers.current[id]) clearTimeout(timers.current[id])
    timers.current[id] = setTimeout(() => {
      const item = items.find(i => i.id === id)
      if (item && item.quantity !== quantity) {
        updateQuantity(id, quantity)
      }
      delete timers.current[id]
    }, 400)
  }

  const subtotal = getTotalPrice()
  const shipping = subtotal >= 5000 ? 0 : 500 // Free shipping over 5000 LKR
  const tax = subtotal * 0.05 // 5% tax
  const total = subtotal + shipping + tax

  return (
  <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Shopping Cart ({getTotalItems()})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Your cart is empty</h3>
              <p className="text-slate-600 mb-6">Add some products to get started!</p>
              <Button onClick={() => setCartOpen(false)} asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-blue-600"
                        checked={!!selected[item.id]}
                        onChange={(e) => setSelected(prev => ({ ...prev, [item.id]: e.target.checked }))}
                        aria-label={`Select ${item.name}`}
                      />
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 truncate">{item.name}</h3>
                        <p className="text-sm text-slate-600">LKR {item.price.toFixed(2)} each</p>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <Input
                          type="number"
                          value={localQty[item.id] ?? item.quantity}
                          onChange={(e) => {
                            const raw = Number.parseInt(e.target.value)
                            const q = Math.max(1, isNaN(raw) ? 1 : raw)
                            setLocalQty(prev => ({ ...prev, [item.id]: q }))
                            schedule(item.id, q)
                          }}
                          className="w-20 h-8 text-center text-sm"
                          min="1"
                        />

                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">
                            LKR {(item.price * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-blue-600"
                      checked={items.length > 0 && items.every(i => selected[i.id])}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setSelected(Object.fromEntries(items.map(i => [i.id, checked])))
                      }}
                      aria-label="Select all"
                    />
                    <span>Select all</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={items.every(i => !selected[i.id])}
                    onClick={async () => {
                      const ids = items.filter(i => selected[i.id]).map(i => i.id)
                      if (ids.length === 0) return
                      await removeItems(ids)
                      // Clear selection for removed ids
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">LKR {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? <span className="text-green-600">Free</span> : `LKR ${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-medium">LKR {tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">Total</span>
                      <span className="font-bold text-lg text-blue-600">LKR {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {subtotal < 5000 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      Add <span className="font-semibold">LKR {(5000 - subtotal).toFixed(2)}</span> more for free shipping!
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Button className="w-full" size="lg" onClick={() => setCartOpen(false)} asChild>
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => setCartOpen(false)}
                    asChild
                  >
                    <Link href="/cart">View Full Cart</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
