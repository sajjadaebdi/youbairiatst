"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/app/store/cart"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"

interface ProductCardProps {
  id: string
  title: string
  price: number
  image: string
  category: string
  seller: string
}

export default function ProductCard({
  id,
  title,
  price,
  image,
  category,
  seller,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const checkAuth = useCartStore((state) => state.checkAuth)
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  const handleAddToCart = async () => {
    try {
      setIsAdding(true)
      await checkAuth() // Ensure auth status is up to date
      await addItem({
        id,
        title,
        price,
        image,
        category,
        seller,
        quantity: 1,
      })
      toast.success("Added to cart!")
    } catch (error) {
      console.error("Failed to add to cart:", error)
      if (error instanceof Error && error.message.includes("login")) {
        toast.error("Please login to add items to cart")
        router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
      } else {
        toast.error("Failed to add item to cart")
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="group relative bg-background rounded-lg border p-4 hover:shadow-md transition-shadow">
      <Link href={`/products/${id}`}>
        <div className="aspect-square relative mb-4 overflow-hidden rounded-md">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{category}</p>
        <p className="font-medium">₹{price.toFixed(2)}</p>
      </Link>
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-4"
        onClick={handleAddToCart}
        disabled={isAdding}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isAdding ? "Adding..." : "Add to Cart"}
      </Button>
    </div>
  )
}
