"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, GraduationCap, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AnimatedLogo from "@/components/animated-logo"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)
  const [signupSuccess, setSignupSuccess] = useState(false)

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

  if (checking) return null

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        setSignupSuccess(true)
        // Only create profile after email confirmation, or handle in callback
        // Optionally, you can still insert a profile here if you want
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Back to Home - Fixed at top left */}
      <div className="fixed top-6 left-6 z-50 animate-slide-up">
        <Link
          href="/"
          className="inline-flex items-center glassmorphism-card px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2 text-gray-500" />
          Back to Home
        </Link>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#fe0002]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#ff4444]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#ff6b6b]/10 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      <div className="max-w-lg w-full space-y-8 relative z-10">
        <div className="text-center animate-slide-up">
          {/* <Link href="/" className="flex items-center justify-center space-x-3 mb-8">
            <AnimatedLogo className="h-12 w-12" />
            <span className="text-3xl font-bold gradient-text">Lincoln E-Library</span>
          </Link> */}
          <h2 className="text-4xl font-bold text-foreground mb-2">Join Our Learning Community</h2>
          <p className="text-muted-foreground text-lg">Create your student account and unlock thousands of books</p>
        </div>

        <Card className="glassmorphism-card border-0 shadow-2xl animate-slide-up delay-200">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
              <GraduationCap className="h-6 w-6 text-[#fe0002]" />
              <span>Student Registration</span>
            </CardTitle>
            <CardDescription className="text-base">Join thousands of students already learning with us</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSignUp}>
              {error && (
                <Alert variant="destructive" className="glassmorphism-card border-red-500/20">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {signupSuccess && (
                <Alert variant="success" className="mb-6">
                  <AlertDescription>
                    Account created! Please check your email to confirm your account before signing in.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {/* Full Name and Email in same row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={!email && error ? "true" : "false"}
                        placeholder="Enter your email"
                        className="pl-10 h-12 glassmorphism-card border-0 text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Password and Confirm Password in same row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={!password && error ? "true" : "false"}
                        placeholder="Create a password"
                        className="pl-10 pr-10 h-12 glassmorphism-card border-0 text-base"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-base font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        aria-invalid={!confirmPassword && error ? "true" : "false"}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10 h-12 glassmorphism-card border-0 text-base"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold morph-button bg-gradient-to-r from-[#fe0002] to-[#ff4444] hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 hover:scale-105 transition-all duration-300 mt-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Create Student Account</span>
                    <ArrowRight className="h-4 w-4 text-[#fe0002]" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <p className="text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-[#fe0002] hover:text-[#fe0002]/80 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
