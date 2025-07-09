"use client"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export default function ReadOnlineButton({ fileUrl }: { fileUrl: string }) {
  return (
    <Button
      onClick={() => window.open(fileUrl, '_blank')}
      className="bg-[#fe0002] hover:bg-[#fe0002]/90 text-white"
    >
      <BookOpen className="h-4 w-4 mr-2" />
      Read Online (New Tab)
    </Button>
  )
} 