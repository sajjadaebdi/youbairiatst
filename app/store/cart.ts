import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase/client"

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  image: string
  category: string
  seller: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  isAuthenticated: boolean
  checkAuth: () => Promise<void>
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isAuthenticated: false,

      checkAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          set({ isAuthenticated: !!session?.user })
        } catch (error) {
          console.error("Auth check failed:", error)
          set({ isAuthenticated: false })
        }
      },

      addItem: async (item) => {
        const { isAuthenticated } = get()
        if (!isAuthenticated) {
          throw new Error("Please login to add items to cart")
        }

        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      removeItem: async (id) => {
        const { isAuthenticated } = get()
        if (!isAuthenticated) {
          throw new Error("Please login to modify cart")
        }

        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      updateQuantity: async (id, quantity) => {
        const { isAuthenticated } = get()
        if (!isAuthenticated) {
          throw new Error("Please login to modify cart")
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: async () => {
        const { isAuthenticated } = get()
        if (!isAuthenticated) {
          throw new Error("Please login to modify cart")
        }

        set({ items: [] })
      },
    }),
    {
      name: "cart-storage",
    }
  )
)
