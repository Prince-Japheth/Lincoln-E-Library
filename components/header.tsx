"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Moon, Sun, Settings, UserCircle, Home as HomeIcon, BookOpen, MessageSquare, Play } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import AnimatedLogo from "@/components/animated-logo"
import NotificationBell from "@/components/notification-bell"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"

interface HeaderProps {
  user: any
  userRole: string | null
}

export default function Header({ user, userRole }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  // Prevent background scroll when menu is open
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
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  const isActive = (path: string) => pathname === path

  // Close menu on navigation
  const handleNav = (href: string) => {
    setIsMenuOpen(false)
    router.push(href)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glassmorphism-nav">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 animate-slide-left">
            <AnimatedLogo className="h-8 w-8" />
            <span className="text-xl font-bold gradient-text">Lincoln E-Library</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 animate-slide-up">
            <Link href="/">
              <Button
                variant="ghost"
                className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive("/")
                    ? "bg-[#fe0002]/10 text-[#fe0002] font-semibold"
                    : "text-foreground/70 hover:text-[#fe0002] hover:bg-[#fe0002]/5"
                }`}
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            {user && (
              <>
                <Link href={userRole === "admin" ? "/admin/dashboard" : "/student/dashboard"}>
                  <Button
                    variant="ghost"
                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive(userRole === "admin" ? "/admin/dashboard" : "/student/dashboard")
                        ? "bg-[#fe0002]/10 text-[#fe0002] font-semibold"
                        : "text-foreground/70 hover:text-[#fe0002] hover:bg-[#fe0002]/5"
                    }`}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                {userRole === "student" && (
                  <>
                    <Link href="/student/ai-tutor">
                      <Button
                        variant="ghost"
                        className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                          isActive("/student/ai-tutor")
                            ? "bg-[#fe0002]/10 text-[#fe0002] font-semibold"
                            : "text-foreground/70 hover:text-[#fe0002] hover:bg-[#fe0002]/5"
                        }`}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        AI Tutor
                      </Button>
                    </Link>
                    <Link href="/videos">
                      <Button
                        variant="ghost"
                        className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                          isActive("/videos")
                            ? "bg-[#fe0002]/10 text-[#fe0002] font-semibold"
                            : "text-foreground/70 hover:text-[#fe0002] hover:bg-[#fe0002]/5"
                        }`}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Videos
                      </Button>
                    </Link>
                  </>
                )}
                {userRole === "student" && (
                  <Link href="/student/profile">
                    <Button
                      variant="ghost"
                      className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                        isActive("/student/profile")
                          ? "bg-[#fe0002]/10 text-[#fe0002] font-semibold"
                          : "text-foreground/70 hover:text-[#fe0002] hover:bg-[#fe0002]/5"
                      }`}
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Theme Toggle & Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3 animate-slide-right">
            {/* Notification Bell for Admin */}
            {userRole === "admin" && <NotificationBell userRole={userRole} />}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="glassmorphism-card hover:scale-110 transition-all duration-300 p-2 rounded-xl"
            >
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="morph-button glassmorphism-card border-[#fe0002]/30 text-[#fe0002] hover:bg-[#fe0002] hover:text-white hover:scale-105 transition-all duration-300 bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="morph-button glassmorphism-card border-[#fe0002]/30 text-[#fe0002] hover:bg-[#fe0002] hover:text-white hover:scale-105 transition-all duration-300 bg-transparent"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="morph-button bg-gradient-to-r from-[#fe0002] to-[#ff4444] hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 hover:scale-105 transition-all duration-300"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden glassmorphism-card p-2 rounded-xl hover:scale-110 transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Bottom Sheet */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Bottom Sheet */}
          <nav
            id="mobile-menu"
            className="fixed left-0 bottom-0 w-full h-[80vh] max-h-[600px] bg-background rounded-t-3xl shadow-2xl p-6 flex flex-col gap-6 animate-slide-up focus:outline-none z-[10000]"
            tabIndex={0}
            aria-modal="true"
            role="dialog"
          >
            {/* Drag Handle */}
            <div className="mx-auto mb-4 w-12 h-1.5 bg-muted-foreground/40 rounded-full" />
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent focus:outline-none"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
            {/* Nav Links */}
            <div className="flex flex-col gap-2 mt-4">
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
            {/* Divider */}
            <div className="border-t border-muted my-4" />
            {/* Theme Toggle */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-semibold transition-all duration-300 hover:bg-accent"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            {/* Auth Buttons */}
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/30">
                  <User className="h-5 w-5 text-[#fe0002]" />
                  <span className="text-base font-medium">{user.email?.split("@")[0]}</span>
                  {userRole && (
                    <span className="text-xs bg-[#fe0002] text-white px-2 py-1 rounded-full">{userRole}</span>
                  )}
                </div>
                <button
                  className="w-full mt-2 px-4 py-3 rounded-xl text-lg font-semibold border border-[#fe0002]/30 text-[#fe0002] hover:bg-[#fe0002] hover:text-white transition-all duration-300"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5 mr-2 inline" /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  className="w-full px-4 py-3 rounded-xl text-lg font-semibold border border-[#fe0002]/30 text-[#fe0002] hover:bg-[#fe0002] hover:text-white transition-all duration-300"
                  onClick={() => handleNav("/auth/login")}
                >
                  Login
                </button>
                <button
                  className="w-full px-4 py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-[#fe0002] to-[#ff4444] text-white hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 transition-all duration-300"
                  onClick={() => handleNav("/auth/signup")}
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
