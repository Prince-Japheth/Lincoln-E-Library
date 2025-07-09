"use client"
import Header from "@/components/header"
import { usePathname } from "next/navigation"
 
export default function HeaderWrapper({ user, userRole }: { user: any, userRole: string | null }) {
  const pathname = usePathname();
  if (pathname.startsWith("/auth")) return null;
  return <Header user={user} userRole={userRole} />;
} 