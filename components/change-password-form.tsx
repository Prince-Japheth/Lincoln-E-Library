"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function ChangePasswordForm({ userId }: { userId: string }) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)
  const supabase = createClient()

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
    <div className="mt-10">
      <Card className="bg-white/80 dark:bg-gray-900/80 border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center space-x-2">
            <Lock className="h-5 w-5 text-[#fe0002]" />
            <span>Change Password</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
} 