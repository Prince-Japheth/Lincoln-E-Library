"use client"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export default function OpenInNewTabButton({ bookId }: { bookId: string }) {
  return (
    <Button
      onClick={() => window.open(`/read/${bookId}`, '_blank')}
      className="bg-[#fe0002] hover:bg-[#fe0002]/90 text-white"
    >
      <BookOpen className="h-4 w-4 mr-2" />
      Open In New Tab (Full Screen)
    </Button>
  )
} 