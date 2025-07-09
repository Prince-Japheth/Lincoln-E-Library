"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, ArrowRight, UserCheck, Shield, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AnimatedLogo from "@/components/animated-logo"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("student")
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        // Set remember me in localStorage
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true")
          localStorage.setItem("rememberedEmail", email)
        } else {
          localStorage.removeItem("rememberMe")
          localStorage.removeItem("rememberedEmail")
        }

        // Check user role after successful login
        const {
          data: { user },
        } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("user_id", user.id)
            .single()
          
          if (profileError) {
            console.error("Profile fetch error:", profileError)
            setError("Error fetching user profile. Please try again.")
            return
          }
          
          if (!profile) {
            console.error("No profile found for user:", user.id)
            setError("User profile not found. Please contact support.")
            return
          }
          
          toast({
            title: "Login successful!",
            description: "Redirecting to your dashboard. Please wait...",
          })
          setRedirecting(true)
          setTimeout(() => {
            const targetUrl = profile.role === "admin" ? "/admin/dashboard" : "/student/dashboard"
            router.replace(targetUrl)
            window.location.href = targetUrl
          }, 1200)
        }
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Load remembered email on component mount
  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe")
    const rememberedEmail = localStorage.getItem("rememberedEmail")
    if (remembered === "true" && rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

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
  if (redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <div className="text-lg font-semibold">Login successful! Redirecting to your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Back to Home - Fixed at top left */}
      <div className="fixed top-6 left-6 z-50 animate-slide-up">
        <Link
          href="/"
          className="inline-flex items-center glassmorphism-card px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#fe0002]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#ff4444]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#ff6b6b]/10 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center animate-slide-up">
          <Link href="/" className="flex items-center justify-center space-x-3 mb-8">
            <AnimatedLogo className="h-12 w-12" />
            <span className="text-3xl font-bold gradient-text">Lincoln E-Library</span>
          </Link>
          <h2 className="text-4xl font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground text-lg">Sign in to continue your learning journey</p>
        </div>

        <Card className="glassmorphism-card border-0 shadow-2xl animate-slide-up delay-200">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription className="text-base">Choose your account type and enter your credentials</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 glassmorphism-card">
                <TabsTrigger value="student" className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Student</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4 mt-6">
                <form onSubmit={handleLogin}>
                  {error && (
                    <Alert variant="destructive" className="glassmorphism-card border-red-500/20">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
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
                          placeholder="Enter your password"
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

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </Label>
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
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <div className="glassmorphism-card p-4 rounded-xl mb-4">
                  <h3 className="font-semibold text-[#fe0002] mb-2">Admin Test Credentials:</h3>
                  <p className="text-sm text-muted-foreground">Email: admin@lincoln.edu</p>
                  <p className="text-sm text-muted-foreground">Password: LincolnAdmin123!</p>
                </div>

                <form onSubmit={handleLogin}>
                  {error && (
                    <Alert variant="destructive" className="glassmorphism-card border-red-500/20">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email" className="text-base font-medium">
                        Admin Email
                      </Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="admin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-invalid={!email && error ? "true" : "false"}
                          placeholder="admin@lincoln.edu"
                          className="pl-10 h-12 glassmorphism-card border-0 text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-password" className="text-base font-medium">
                        Admin Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          aria-invalid={!password && error ? "true" : "false"}
                          placeholder="Enter admin password"
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

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="admin-remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label
                        htmlFor="admin-remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </Label>
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
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin Sign In</span>
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {activeTab === "student" && (
              <p className="text-center text-muted-foreground">
                {"Don't have an account? "}
                <Link
                  href="/auth/signup"
                  className="text-[#fe0002] hover:text-[#fe0002]/80 font-semibold transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            )}
          </CardFooter>
        </Card>

        <div className="text-center mt-4">
          <Link href="/auth/forgot-password" className="inline-flex items-center text-[#fe0002] hover:text-[#fe0002]/80 font-semibold transition-colors">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  )
}
