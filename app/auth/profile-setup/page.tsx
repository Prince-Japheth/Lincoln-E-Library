"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Camera, ArrowRight, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AnimatedLogo from "@/components/animated-logo"

export default function ProfileSetupPage() {
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePictureUrl, setProfilePictureUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Get existing profile data
      const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      if (profile) {
        setFullName(profile.full_name || "")
        setBio(profile.bio || "")
        setProfilePictureUrl(profile.profile_picture_url || "")
      }
    }

    getUser()
  }, [router])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("user_id", user.id)
          .single()
        if (profile) {
          router.replace(profile.role === "admin" ? "/admin/dashboard" : "/student/dashboard")
          return
        }
      }
      setChecking(false)
    }
    checkUser()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setProfilePictureUrl(previewUrl)
    }
  }

  const uploadProfilePicture = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `profile-pictures/${fileName}`

      const { error: uploadError } = await supabase.storage.from("profile-pictures").upload(filePath, file)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return null
      }

      const { data } = supabase.storage.from("profile-pictures").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading file:", error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let uploadedImageUrl = profilePictureUrl

      // Upload profile picture if a new file was selected
      if (profilePicture) {
        const uploadUrl = await uploadProfilePicture(profilePicture)
        if (uploadUrl) {
          uploadedImageUrl = uploadUrl
        }
      }

      // Update user profile
      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: fullName,
          bio: bio,
          profile_picture_url: uploadedImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard")
        }, 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  if (success) {
    return (
      <div className="min-h-screen auth-gradient flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <Card className="max-w-md w-full glassmorphism-card border-0 shadow-2xl relative z-10 animate-slide-up">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="text-green-500 mb-6">
              <CheckCircle className="h-20 w-20 mx-auto animate-bounce-gentle" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Profile Setup Complete! 🎉</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Your profile has been updated successfully. Redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (checking) return null

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      <div className="max-w-lg w-full space-y-8 relative z-10">
        <div className="text-center animate-slide-up">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <AnimatedLogo className="h-12 w-12" />
            <span className="text-3xl font-bold gradient-text">Lincoln E-Library</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Complete Your Profile</h2>
          <p className="text-muted-foreground text-lg">Let's personalize your learning experience</p>
        </div>

        <Card className="glassmorphism-card border-0 shadow-2xl animate-slide-up delay-200">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Profile Setup</CardTitle>
            <CardDescription className="text-base">Add your details to get started</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive" className="glassmorphism-card border-red-500/20">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Profile Picture */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Profile Picture</Label>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden glassmorphism-card">
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <label
                      htmlFor="profile-picture"
                      className="absolute bottom-0 right-0 bg-[#fe0002] text-white p-2 rounded-full cursor-pointer hover:bg-[#fe0002]/90 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </label>
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Click the camera icon to upload a photo</p>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    aria-invalid={!fullName && error ? "true" : "false"}
                    placeholder="Enter your full name"
                    className="pl-10 h-12 glassmorphism-card border-0 text-base"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-medium">
                  Bio (Optional)
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                  className="glassmorphism-card border-0 text-base min-h-[100px]"
                  rows={4}
                />
              </div>


              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1 h-12 text-base font-semibold glassmorphism-card border-[#fe0002]/30 text-[#fe0002] hover:bg-[#fe0002] hover:text-white hover:scale-105 transition-all duration-300 bg-transparent"
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base font-semibold morph-button bg-gradient-to-r from-[#fe0002] to-[#ff4444] hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 hover:scale-105 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Complete Setup</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
