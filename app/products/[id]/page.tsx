"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Check, ShoppingCart } from "lucide-react"

import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  // In a real app, you would fetch the product data based on the ID
  const product = {
    id: params.id,
    title: "Website Template Bundle",
    price: 49.99,
    image: "/placeholder.svg?height=600&width=600",
    category: "Templates",
    seller: "DesignStudio",
    description:
      "A comprehensive bundle of website templates for various industries. Includes 10 fully responsive templates with modern design.",
    features: [
      "10 unique templates",
      "Fully responsive design",
      "Compatible with all modern browsers",
      "Easy to customize",
      "Detailed documentation",
      "Free updates for 1 year",
    ],
    rating: 4.8,
    reviews: 124,
    dateAdded: "2023-10-15",
  }

  return (
    <AuthGuard redirectTo="/">
      <div className="container px-4 py-8 md:py-12">
        <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-6">
          <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="aspect-square cursor-pointer overflow-hidden rounded-md border bg-muted">
              <Image
                src="/placeholder.svg?height=100&width=100"
                alt="Product thumbnail"
                width={100}
                height={100}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="aspect-square cursor-pointer overflow-hidden rounded-md border bg-muted">
              <Image
                src="/placeholder.svg?height=100&width=100"
                alt="Product thumbnail"
                width={100}
                height={100}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="aspect-square cursor-pointer overflow-hidden rounded-md border bg-muted">
              <Image
                src="/placeholder.svg?height=100&width=100"
                alt="Product thumbnail"
                width={100}
                height={100}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="aspect-square cursor-pointer overflow-hidden rounded-md border bg-muted">
              <Image
                src="/placeholder.svg?height=100&width=100"
                alt="Product thumbnail"
                width={100}
                height={100}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{product.category}</Badge>
              <p className="text-sm text-muted-foreground">by {product.seller}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">${product.price.toFixed(2)}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="text-yellow-500">★★★★★</span>
              <span>
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
          </div>
          <p className="text-muted-foreground">{product.description}</p>
          <div className="space-y-2">
            <h3 className="font-medium">Key Features:</h3>
            <ul className="space-y-1">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <Separator />
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="sm:flex-1 gap-2">
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="sm:flex-1">
              Buy Now
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Digital product - Instant delivery after purchase</p>
            <p>Added on {product.dateAdded}</p>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Product Description</h3>
              <p>
                This comprehensive website template bundle includes 10 fully responsive templates designed for various
                industries. Each template features a modern design that's easy to customize to fit your brand.
              </p>
              <p>
                Whether you're building a portfolio, business website, blog, or e-commerce store, this bundle has you
                covered. All templates are compatible with modern browsers and come with detailed documentation to help
                you get started quickly.
              </p>
              <h4 className="text-lg font-medium mt-6">What's Included:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>10 unique website templates</li>
                <li>Responsive design for all screen sizes</li>
                <li>Cross-browser compatibility</li>
                <li>Easy customization options</li>
                <li>Comprehensive documentation</li>
                <li>1 year of free updates</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Customer Reviews</h3>
              <p>
                This product has {product.reviews} reviews with an average rating of {product.rating} out of 5 stars.
              </p>
              <div className="space-y-6 mt-6">
                <div className="border-b pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">John D.</div>
                        <div className="text-yellow-500">★★★★★</div>
                      </div>
                      <div className="text-sm text-muted-foreground">Posted 2 weeks ago</div>
                    </div>
                  </div>
                  <p className="mt-2">
                    These templates are amazing! Very easy to customize and the documentation is very thorough. Saved me
                    a ton of time on my project.
                  </p>
                </div>
                <div className="border-b pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">Sarah M.</div>
                        <div className="text-yellow-500">★★★★☆</div>
                      </div>
                      <div className="text-sm text-muted-foreground">Posted 1 month ago</div>
                    </div>
                  </div>
                  <p className="mt-2">
                    Great templates overall. I had a few issues with mobile responsiveness on one of them, but customer
                    support was helpful in resolving it.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="support" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Support</h3>
              <p>
                We provide comprehensive support for all our products. If you have any questions or issues, please don't
                hesitate to reach out.
              </p>
              <div className="space-y-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Email Support</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our support team is available Monday-Friday, 9am-5pm EST. Average response time: 24 hours.
                    </p>
                    <a
                      href="mailto:support@digitalmarket.com"
                      className="text-sm text-primary hover:underline mt-1 inline-block"
                    >
                      support@digitalmarket.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Documentation</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Comprehensive documentation is included with your purchase. It covers installation, customization,
                      and troubleshooting.
                    </p>
                    <a href="/documentation" className="text-sm text-primary hover:underline mt-1 inline-block">
                      View Documentation
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <path d="M12 17h.01" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">FAQ</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check our frequently asked questions for quick answers to common questions.
                    </p>
                    <a href="/faq" className="text-sm text-primary hover:underline mt-1 inline-block">
                      View FAQ
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AuthGuard>
  )
}
