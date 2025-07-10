"use client"
import Header from "@/components/header"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function HeaderWrapper({ user, userRole }: { user: any, userRole: string | null }) {
  // Avoid hydration mismatch by only rendering after mount
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null;
  if (pathname.startsWith("/auth")) return null;
  return <Header user={user} userRole={userRole} />;
}