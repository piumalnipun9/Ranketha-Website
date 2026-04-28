"use client"

import { useState } from "react"
import { ShoppingCart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: number | string
  name: string
  price: number
  image: string
  category: string
  brand: string
  inStock: boolean
  stockQuantity?: number
}

interface AddToCartButtonProps {
  product: Product
  quantity?: number
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "secondary"
  showIcon?: boolean
}

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  size = "default",
  variant = "default",
  showIcon = true,
}: AddToCartButtonProps) {
  const { addItem } = useCartStore()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const items = useCartStore(state => state.items)

  const handleAddToCart = async () => {
    if (!product.inStock) return

    setIsAdding(true)

    // Enforce stock limit based on what's already in cart
    const currentQty = items.find(i => i.id === product.id.toString())?.quantity || 0
    const maxStock = typeof product.stockQuantity === 'number' ? product.stockQuantity : undefined
    let allowedToAdd = quantity
    if (typeof maxStock === 'number') {
      const remaining = Math.max(0, maxStock - currentQty)
      if (remaining <= 0) {
        setIsAdding(false)
        toast({ title: 'Out of stock', description: `No more units available. In cart: ${currentQty}/${maxStock}.` })
        return
      }
      if (quantity > remaining) {
        allowedToAdd = remaining
        toast({ title: 'Limited by stock', description: `Only ${remaining} left in stock. Added ${remaining} to cart.` })
      }
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Add with desired quantity in a single call
    await addItem({ ...product, id: product.id.toString() }, allowedToAdd)

    setIsAdding(false)
    setJustAdded(true)

    // Show success state briefly
    setTimeout(() => setJustAdded(false), 2000)

    // Show toast notification
    toast({
      title: "Added to cart!",
      description: `${product.name} ${allowedToAdd > 1 ? `(${allowedToAdd})` : ""} has been added to your cart.`,
      // Removed direct open-cart action; user can navigate manually
    })
  }

  if (!product.inStock) {
    return (
      <Button disabled className={className} size={size} variant="outline">
        Out of Stock
      </Button>
    )
  }

  // Disable when adding and also when no units remaining
  const currentQty = items.find(i => i.id === product.id.toString())?.quantity || 0
  const noneLeft = typeof product.stockQuantity === 'number' && currentQty >= product.stockQuantity

  return (
    <Button onClick={handleAddToCart} disabled={isAdding || noneLeft} className={className } size={size} variant={variant}>
      {isAdding ? (
        <>
          <div className="spinner mr-2" />
          Adding...
        </>
      ) : justAdded ? (
        <>
          {showIcon && <Check className="h-4 w-4 mr-2" />}
          Added!
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className="h-4 w-4 mr-2" />}
          {noneLeft ? 'Max in Cart' : 'Add to Cart'}
        </>
      )}
    </Button>
  )
}
