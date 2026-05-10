import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Temporarily disabled authentication for testing
export default function middleware(req) {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")

  // Protect admin routes (temporarily allow all access)
  // if (isAdminRoute && !isAdmin) {
  //   return NextResponse.redirect(new URL("/", req.url))
  // }

  // Add security headers
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  )

  return response
}

// Temporarily disabled authentication matcher
// export const config = {
//   matcher: [
//     "/admin/:path*",
//     "/sell/:path*",
//     "/profile/:path*",
//     "/api/admin/:path*",
//   ]
// }

export const config = {
  matcher: [
    // Temporarily allow all routes without authentication
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ]
} 