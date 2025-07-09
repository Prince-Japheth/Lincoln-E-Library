"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface AuthProtectionProps {
  children: React.ReactNode
  user: any
  userRole: string | null
}

export default function AuthProtection({ children, user, userRole }: AuthProtectionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      // Get current user from client-side
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      // Public routes that don't require authentication
      const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/callback", "/auth/forgot-password", "/auth/reset-password", "/auth/profile-setup"]
      const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

      // Admin-only routes
      const adminRoutes = ["/admin"]
      const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

      // Protected routes that require authentication
      const protectedRoutes = ["/student", "/admin", "/ai-tutor", "/profile"]
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
      
      // Book routes - allow public access but check for private books
      const isBookRoute = pathname.startsWith("/book")

      // If not authenticated and trying to access protected route
      if (!currentUser && isProtectedRoute) {
        router.push("/auth/login")
        return
      }

      // If authenticated but trying to access admin route without admin role
      if (currentUser && isAdminRoute && userRole !== "admin") {
        router.push("/student/dashboard")
        return
      }

      // If authenticated and on login/signup pages, redirect to appropriate dashboard
      if (currentUser && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup"))) {
        if (userRole === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/student/dashboard")
        }
        return
      }
    }

    checkAuth()
  }, [pathname, user, userRole, router, supabase.auth])

  return <>{children}</>
} 