"use client"

import { useEffect, useState } from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface CartIconProps {
  className?: string
  showText?: boolean
}

export function CartIcon({ className, showText = true }: CartIconProps) {
  const { getTotalItems } = useCartStore()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    // Render a stable fallback without cart badge
    return (
      <Link href="/cart">
        <Button variant="ghost" className={`relative ${className}`}>
          <ShoppingCart className="h-5 w-5" />
          {showText && <span className="ml-2">Cart</span>}
        </Button>
      </Link>
    )
  }

  const itemCount = getTotalItems()

  return (
    <Link href="/cart">
      <Button variant="ghost" className={`relative ${className}`}>
        <ShoppingCart className="h-5 w-5" />
        {showText && <span className="ml-2">Cart</span>}
        {itemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </Badge>
        )}
      </Button>
    </Link>
  )
}
