"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Store, Package } from "lucide-react"

export default function SellPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // Temporarily disabled authentication check
  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     router.push("/signin?callbackUrl=/sell")
  //   }
  // }, [status, router])

  // Temporarily disabled loading check
  // if (status === "loading") {
  //   return (
  //     <div className="py-12 text-center">
  //       <p className="text-muted-foreground">Loading...</p>
  //     </div>
  //   )
  // }

  // Temporarily disabled authentication check
  // if (status === "unauthenticated") {
  //   return (
  //     <div className="py-12 text-center">
  //       <p className="text-muted-foreground">Please sign in to access this page.</p>
  //     </div>
  //   )
  // }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Start Selling</h1>
          <p className="text-muted-foreground">
            Choose how you want to sell your digital products
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/create-shop")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Create a Shop</CardTitle>
                  <CardDescription>
                    Set up your own branded shop with custom URL
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Custom shop URL (yourname.marketplace.com)</li>
                <li>• Branded shop page</li>
                <li>• Shop analytics and insights</li>
                <li>• Multiple products</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/sell/product")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>Sell Individual Product</CardTitle>
                  <CardDescription>
                    List a single product without creating a shop
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Quick product listing</li>
                <li>• No shop setup required</li>
                <li>• Instant approval process</li>
                <li>• Perfect for one-time sales</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help getting started?{" "}
            <a href="/contact-us" className="text-primary hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
