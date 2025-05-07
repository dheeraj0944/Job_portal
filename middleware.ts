import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/utils"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get("token")?.value || ""
  console.log(`[Middleware] Path: ${path}`)
  console.log(`[Middleware] Token found: ${token ? 'Yes' : 'No'} (Length: ${token.length})`)

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register", "/jobs"]
  const isPublicPath = publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith("/api/") || path.startsWith("/_next/"),
  )

  // Check if the path is for job details
  const isJobDetailsPath = path.match(/^\/jobs\/[a-zA-Z0-9]+$/)

  if (isPublicPath || isJobDetailsPath) {
    return NextResponse.next()
  }

  // Verify token (now async)
  console.log("[Middleware] Verifying token...")
  // console.log(`[Middleware] JWT_SECRET used for verification: ${process.env.JWT_SECRET ? 'Loaded from env' : 'Using fallback'}`) // Logged in utils now
  const payload = await verifyToken(token) // Await and get payload
  console.log(`[Middleware] Token payload: ${payload ? JSON.stringify(payload) : 'null'}`)

  // If no token or invalid token, redirect to login
  if (!payload) { // Check payload now
    console.log("[Middleware] No valid payload, redirecting to /login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based access control
  const userRole = payload.role as string // Get role from payload
  console.log(`[Middleware] User role from payload: ${userRole}`)

  if (path.startsWith("/recruiter") && userRole !== "recruiter") {
    console.log("[Middleware] Path starts with /recruiter but role is not recruiter, redirecting to /dashboard")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (path === "/dashboard" && userRole !== "user") {
    console.log("[Middleware] Path is /dashboard but role is not user, redirecting to /recruiter/dashboard")
    return NextResponse.redirect(new URL("/recruiter/dashboard", request.url))
  }

  console.log("[Middleware] Access granted, calling NextResponse.next()")
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
