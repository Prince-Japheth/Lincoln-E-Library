"use client"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import ProfileForm from "@/components/profile-form"
import UserPreferences from "@/components/user-preferences"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock } from "lucide-react"

export default async function AdminProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

  // Password change state
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError("")
    setPwSuccess(false)
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.")
      return
    }
    if (newPassword !== confirmNewPassword) {
      setPwError("Passwords do not match.")
      return
    }
    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        setPwError(error.message)
      } else {
        setPwSuccess(true)
        setNewPassword("")
        setConfirmNewPassword("")
      }
    } catch (err) {
      setPwError("An unexpected error occurred.")
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-8">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="mb-8 animate-slide-up">
            <div className="glassmorphism-card rounded-3xl p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Admin Profile</h1>
              <p className="text-muted-foreground text-lg">Manage your admin account information and preferences.</p>
            </div>
          </div>

          <div className="animate-slide-up delay-200 mb-8">
            <ProfileForm profile={profile} userId={user.id} />
          </div>

          <div className="animate-slide-up delay-300">
            <UserPreferences userId={user.id} />
          </div>

          {/* Password change section */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {pwError && (
                <Alert variant="destructive">
                  <AlertDescription>{pwError}</AlertDescription>
                </Alert>
              )}
              {pwSuccess && (
                <Alert>
                  <AlertDescription>Password updated successfully!</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pl-10 h-12 glassmorphism-card border-0 text-base"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pl-10 h-12 glassmorphism-card border-0 text-base"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold morph-button bg-gradient-to-r from-[#fe0002] to-[#ff4444] hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 hover:scale-105 transition-all duration-300 mt-6"
                disabled={pwLoading}
              >
                {pwLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 