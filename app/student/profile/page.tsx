import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfileForm from "@/components/profile-form"
import UserPreferences from "@/components/user-preferences"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock } from "lucide-react"
import ChangePasswordForm from "@/components/change-password-form"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }
  // Get user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="mb-8 animate-slide-up">
            <div className="glassmorphism-card rounded-3xl p-8 bg-white/80 dark:bg-gray-900/80">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Profile Settings</h1>
              <p className="text-muted-foreground text-lg">Manage your account information and preferences.</p>
            </div>
          </div>
          <div className="animate-slide-up delay-200 mb-8">
            <ProfileForm profile={profile} userId={user.id} />
          </div>
          <div className="animate-slide-up delay-300">
            <UserPreferences userId={user.id} />
          </div>
          <ChangePasswordForm userId={user.id} />
        </div>
      </main>
    </div>
  )
} 