"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          router.push("/auth/login?error=callback_error")
          return
        }

        if (data.session?.user) {
          // Check if user profile exists
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", data.session.user.id)
            .single()

          if (!profile) {
            // Create profile for OAuth users
            await supabase.from("user_profiles").insert([
              {
                user_id: data.session.user.id,
                full_name: data.session.user.user_metadata?.full_name || data.session.user.email?.split("@")[0],
                email: data.session.user.email,
                role: "student",
              },
            ])

            // Redirect to profile setup
            router.push("/auth/profile-setup")
          } else {
            // Redirect based on role
            router.push(profile.role === "admin" ? "/admin/dashboard" : "/student/dashboard")
          }
        } else {
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Callback handling error:", error)
        router.push("/auth/login?error=callback_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#fe0002]/30 border-t-[#fe0002] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}
