"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Camera, Save, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ProfileFormProps {
  profile: any
  userId: string
}

export default function ProfileForm({ profile, userId }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePictureUrl, setProfilePictureUrl] = useState(profile?.profile_picture_url || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

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
      const fileName = `${userId}-${Math.random()}.${fileExt}`
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
    setSuccess(false)

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
        .eq("user_id", userId)

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glassmorphism-card border-0 bg-white/80 dark:bg-gray-900/80">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center space-x-2">
          <User className="h-6 w-6 text-[#fe0002]" />
          <span>Profile Information</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="glassmorphism-card border-red-500/20">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="glassmorphism-card border-green-500/20 text-green-600">
              <AlertDescription>Profile updated successfully!</AlertDescription>
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

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                value={profile?.email || ""}
                disabled
                className="pl-10 h-12 glassmorphism-card border-0 text-base bg-muted/50"
              />
            </div>
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
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
                placeholder="Enter your full name"
                className="pl-10 h-12 glassmorphism-card border-0 text-base"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="bio" className="text-base font-medium">
              Bio
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

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold morph-button bg-gradient-to-r from-[#fe0002] to-[#ff4444] hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 hover:scale-105 transition-all duration-300 mb-4"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </div>
            )}
          </Button>

          {/* Delete Account Button */}
          <DeleteAccount userId={userId} />
        </form>
      </CardContent>
    </Card>
  )
}

function DeleteAccount({ userId }: { userId: string }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()
  const router = require("next/navigation").useRouter()

  const handleDelete = async () => {
    setLoading(true)
    setError("")
    try {
      // Delete user profile
      await supabase.from("user_profiles").delete().eq("user_id", userId)
      // Delete user from auth
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.push("/")
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {confirm ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-red-600">Are you sure? This action cannot be undone.</p>
          <Button onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700 w-full">
            {loading ? "Deleting..." : "Confirm Delete Account"}
          </Button>
          <Button variant="outline" onClick={() => setConfirm(false)} disabled={loading} className="w-full">
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setConfirm(true)} className="w-full border-red-600 text-red-600 hover:bg-red-50">
          Delete Account
        </Button>
      )}
    </div>
  )
}
