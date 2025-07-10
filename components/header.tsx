"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Menu,
  X,
  User,
  LogOut,
  Moon,
  Sun,
  Settings,
  UserCircle,
  Home as HomeIcon,
  BookOpen,
  MessageSquare,
  Play,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import AnimatedLogo from "@/components/animated-logo"
import NotificationBell from "@/components/notification-bell"
import { createClient } from "@/lib/supabase/client"

interface HeaderProps {
  user: any
  userRole: string | null
}

export default function Header({ user, userRole }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMenuOpen])

  const handleSignOut = async () => {
    console.log('Sign out button clicked');
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push("/")
    window.location.reload();
  }

  const isActive = (path: string) => pathname === path

  const handleNav = (href: string) => {
    setIsMenuOpen(false)
    router.push(href)
  }

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-white/30 shadow-lg glassmorphism-nav">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 animate-slide-left">
              <AnimatedLogo className="h-20 w-20 md:h-10 md:w-10 lg:h-20 lg:w-20" responsive />
            <span className="text-xl font-bold gradient-text hidden xl:inline">Lincoln E-Library</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 animate-slide-up">
            <Link href="/">
              <Button variant="ghost" className={`px-4 py-2 rounded-xl transition-all duration-300 ${isActive("/") ? "bg-[#fe0002]/10 text-[#fe0002] font-semibold" : "text-foreground/70 hover:text-[#fe0002] hover:bg-[#fe0002]/5"}`}>
                <HomeIcon className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Home</span>
              </Button>
            </Link>
            {user && (
              <>
                <Link href={userRole === "admin" ? "/admin/dashboard" : "/student/dashboard"}>
                  <Button variant="ghost" className={`px-4 py-2 rounded-xl transition-all duration-300 ${isActive(userRole === "admin" ? "/admin/dashboard" : "/student/dashboard") ? "bg-[#fe0002]/10 text-[#fe0002] font-semibold" : "text-foreground/70 hover:text-[#fe0002] hover:bg-[#fe0002]/5"}`}>
                    <BookOpen className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Dashboard</span>
                  </Button>
                </Link>
                {userRole === "student" && (
                  <>
                    <Link href="/student/ai-tutor">
                      <Button variant="ghost" className={`px-4 py-2 rounded-xl transition-all duration-300 ${isActive("/student/ai-tutor") ? "bg-[#fe0002]/10 text-[#fe0002] font-semibold" : "text-foreground/70 hover:text-[#fe0002] hover:bg-[#fe0002]/5"}`}>
                        <MessageSquare className="h-4 w-4 lg:mr-2" />
                        <span className="hidden lg:inline">AI Tutor</span>
                      </Button>
                    </Link>
                    <Link href="/videos">
                      <Button variant="ghost" className={`px-4 py-2 rounded-xl transition-all duration-300 ${isActive("/videos") ? "bg-[#fe0002]/10 text-[#fe0002] font-semibold" : "text-foreground/70 hover:text-[#fe0002] hover:bg-[#fe0002]/5"}`}>
                        <Play className="h-4 w-4 lg:mr-2" />
                        <span className="hidden lg:inline">Videos</span>
                      </Button>
                    </Link>
                  </>
                )}
                {userRole === "student" && (
                  <Link href="/student/profile">
                    <Button variant="ghost" className={`px-4 py-2 rounded-xl transition-all duration-300 ${isActive("/student/profile") ? "bg-[#fe0002]/10 text-[#fe0002] font-semibold" : "text-foreground/70 hover:text-[#fe0002] hover:bg-[#fe0002]/5"}`}>
                      <UserCircle className="h-4 w-4 lg:mr-2" />
                      <span className="hidden lg:inline">Profile</span>
                    </Button>
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-3 animate-slide-right">
            {userRole === "admin" && <NotificationBell userRole={userRole} />}

            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="glassmorphism-card hover:scale-110 transition-all duration-300 p-2 rounded-xl">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="glassmorphism-card px-4 py-2 rounded-xl flex items-center space-x-3">
                  <User className="h-4 w-4 text-[#fe0002]" />
                  <span className="text-sm font-medium">{user.email?.split("@")[0]}</span>
                  {userRole && (
                    <span className="text-xs bg-[#fe0002] text-white px-2 py-1 rounded-full">{userRole}</span>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="morph-button glassmorphism-card border-[#fe0002]/30 text-[#fe0002] hover:bg-[#fe0002] hover:text-white hover:scale-105 transition-all duration-300 bg-transparent">
                  <LogOut className="h-4 w-4 lg:mr-2" />
                  <span className="hidden lg:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="morph-button glassmorphism-card border-[#fe0002]/30 text-[#fe0002] hover:bg-[#fe0002] hover:text-white hover:scale-105 transition-all duration-300 bg-transparent">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="morph-button bg-gradient-to-r from-[#fe0002] to-[#ff4444] hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 hover:scale-105 transition-all duration-300">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden glassmorphism-card p-2 rounded-xl hover:scale-110 transition-all duration-300" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? "Close menu" : "Open menu"} aria-expanded={isMenuOpen} aria-controls="mobile-menu">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[9999] flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Mobile Nav */}
          <nav
            id="mobile-menu"
            className="fixed inset-0 w-full h-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-muted shadow-2xl p-8 flex flex-col gap-6 animate-slide-up focus:outline-none z-[10000]"
            tabIndex={0}
            aria-modal="true"
            role="dialog"
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent focus:outline-none"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex flex-col items-center gap-4 mt-8">
              <AnimatedLogo className="w-full mb-2" />
              <span className="text-2xl font-bold gradient-text mb-6">Lincoln E-Library</span>
              <button
                className={`w-full text-left px-4 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${isActive("/") ? "bg-[#fe0002]/10 text-[#fe0002]" : "text-foreground/80 hover:text-[#fe0002] hover:bg-[#fe0002]/5"}`}
                onClick={() => handleNav("/")}
              >
                <HomeIcon className="h-5 w-5 mr-2 inline" /> Home
              </button>
              {user && (
                <>
                  <button
                    className={`w-full text-left px-4 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${isActive(userRole === "admin" ? "/admin/dashboard" : "/student/dashboard") ? "bg-[#fe0002]/10 text-[#fe0002]" : "text-foreground/80 hover:text-[#fe0002] hover:bg-[#fe0002]/5"}`}
                    onClick={() => handleNav(userRole === "admin" ? "/admin/dashboard" : "/student/dashboard")}
                  >
                    <BookOpen className="h-5 w-5 mr-2 inline" /> Dashboard
                  </button>
                  {userRole === "student" && (
                    <>
                      <button
                        className={`w-full text-left px-4 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${isActive("/student/ai-tutor") ? "bg-[#fe0002]/10 text-[#fe0002]" : "text-foreground/80 hover:text-[#fe0002] hover:bg-[#fe0002]/5"}`}
                        onClick={() => handleNav("/student/ai-tutor")}
                      >
                        <MessageSquare className="h-5 w-5 mr-2 inline" /> AI Tutor
                      </button>
                      <button
                        className={`w-full text-left px-4 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${isActive("/videos") ? "bg-[#fe0002]/10 text-[#fe0002]" : "text-foreground/80 hover:text-[#fe0002] hover:bg-[#fe0002]/5"}`}
                        onClick={() => handleNav("/videos")}
                      >
                        <Play className="h-5 w-5 mr-2 inline" /> Videos
                      </button>
                      <button
                        className={`w-full text-left px-4 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${isActive("/student/profile") ? "bg-[#fe0002]/10 text-[#fe0002]" : "text-foreground/80 hover:text-[#fe0002] hover:bg-[#fe0002]/5"}`}
                        onClick={() => handleNav("/student/profile")}
                      >
                        <UserCircle className="h-5 w-5 mr-2 inline" /> Profile
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col items-center gap-4 mt-auto mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="glassmorphism-card hover:scale-110 transition-all duration-300 p-2 rounded-xl w-full justify-center"
              >
                {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </Button>
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="morph-button glassmorphism-card border-[#fe0002]/30 text-[#fe0002] hover:bg-[#fe0002] hover:text-white hover:scale-105 transition-all duration-300 bg-transparent w-full justify-center"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              ) : (
                <div className="flex flex-row gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNav("/auth/login")}
                    className="morph-button glassmorphism-card border-[#fe0002]/30 text-[#fe0002] hover:bg-[#fe0002] hover:text-white hover:scale-105 transition-all duration-300 bg-transparent flex-1 justify-center"
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleNav("/auth/signup")}
                    className="morph-button bg-gradient-to-r from-[#fe0002] to-[#ff4444] hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 hover:scale-105 transition-all duration-300 flex-1 justify-center"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
