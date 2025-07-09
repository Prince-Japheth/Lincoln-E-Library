import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import NextTopLoader from "nextjs-toploader"
import HeaderWrapper from "@/app/header-wrapper"
import { createClient } from "@/lib/supabase/server"
import LoadingSkeleton from "@/components/loading-skeleton"
import { Suspense } from "react"
import AuthProtection from "@/components/auth-protection"

export const metadata: Metadata = {
  title: "Lincoln E-Library - Your Gateway to Knowledge",
  description:
    "Access thousands of books, AI-powered tutoring, and course-based learning in our beautiful digital library.",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side fetch user and role
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let userRole: string | null = null
  if (user) {
    const { data: profile } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()
    userRole = profile?.role ?? null
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" type="image/png" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextTopLoader 
            color="#fe0002"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #fe0002,0 0 5px #fe0002"
          />
          <AuthProtection user={user} userRole={userRole}>
            <HeaderWrapper user={user} userRole={userRole} />
            <Suspense fallback={<LoadingSkeleton />}>
          {children}
            </Suspense>
          </AuthProtection>
        </ThemeProvider>
      </body>
    </html>
  )
}
