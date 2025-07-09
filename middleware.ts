import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile if authenticated
  let userRole = null
  let profile = null
  if (user) {
    const { data: fetchedProfile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()
    profile = fetchedProfile
    userRole = profile?.role
  }

  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/callback", "/auth/forgot-password", "/auth/reset-password"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Admin-only routes
  const adminRoutes = ["/admin"]
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Protected routes that require authentication
  const protectedRoutes = ["/student", "/admin", "/ai-tutor", "/profile"]
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Book routes - allow public access but check for private books
  const isBookRoute = pathname.startsWith("/book")

  // Handle authentication logic
  if (!user && isProtectedRoute) {
    // Redirect to login if trying to access protected route without authentication
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (user && isAdminRoute && userRole !== "admin") {
    // Redirect non-admin users away from admin routes
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
} 