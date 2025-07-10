"use client"

import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"
import AnimatedLogo from "@/components/animated-logo"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function Footer() {
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])
  return (
    <footer className="bg-muted/30 border-t border-border/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <AnimatedLogo className="h-8 w-8" />
              <span className="text-xl font-bold gradient-text">Lincoln E-Library</span>
            </Link>
            <p className="text-muted-foreground">
              Your gateway to infinite knowledge with thousands of books and AI-powered learning.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-muted-foreground hover:text-[#fe0002] transition-colors">
                Home
              </Link>
              {user ? (
                <>
                  <Link href="/student/dashboard" className="block text-muted-foreground hover:text-[#fe0002] transition-colors">Dashboard</Link>
                  <Link href="/student/profile" className="block text-muted-foreground hover:text-[#fe0002] transition-colors">Profile</Link>
                  <Link href="/videos" className="block text-muted-foreground hover:text-[#fe0002] transition-colors">Videos</Link>
                  <Link href="/student/ai-tutor" className="block text-muted-foreground hover:text-[#fe0002] transition-colors">AI Tutor</Link>
                  <Link href="/auth/logout" className="block text-muted-foreground hover:text-[#fe0002] transition-colors">Sign Out</Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block text-muted-foreground hover:text-[#fe0002] transition-colors">Sign In</Link>
                  <Link href="/auth/signup" className="block text-muted-foreground hover:text-[#fe0002] transition-colors">Sign Up</Link>
                </>
              )}
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Resources</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-muted-foreground hover:text-[#fe0002] transition-colors">
                Help Center
              </Link>
              <Link href="#" className="block text-muted-foreground hover:text-[#fe0002] transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="block text-muted-foreground hover:text-[#fe0002] transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <div className="space-y-2">
              <a
                href="mailto:info@lincoln.edu.ng"
                className="flex items-center space-x-2 text-muted-foreground hover:text-[#fe0002] transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>info@lincoln.edu.ng</span>
              </a>
              <a
                href="mailto:sheiduhalilu@lincoln.edu.ng"
                className="flex items-center space-x-2 text-muted-foreground hover:text-[#fe0002] transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>sheiduhalilu@lincoln.edu.ng</span>
              </a>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Lincoln University College, Azhata, FCT Abuja, Nigeria</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 Lincoln E-Library. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
