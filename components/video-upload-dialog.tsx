"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function VideoUploadDialog({ open, onOpenChange, onVideoAdded, courses = [] }: { open: boolean, onOpenChange: (v: boolean) => void, onVideoAdded?: (video: any) => void, courses?: any[] }) {
  const [title, setTitle] = useState("")
  const [link, setLink] = useState("")
  const [courseId, setCourseId] = useState("none")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !link.trim()) {
      toast({ title: "Missing fields", description: "Please provide both title and video link.", variant: "destructive" })
      return
    }
    setLoading(true)
    const { data, error } = await supabase.from("videos").insert({ title, link, course_id: courseId === "none" ? null : courseId }).select().single()
    setLoading(false)
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Video added!", description: "The video has been uploaded.", variant: "success" })
      setTitle("")
      setLink("")
      setCourseId("none")
      onOpenChange(false)
      if (onVideoAdded) await onVideoAdded(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Video</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Video Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={loading}
            required
          />
          <Input
            placeholder="Video Link (YouTube, Vimeo, etc.)"
            value={link}
            onChange={e => setLink(e.target.value)}
            disabled={loading}
            required
          />
          <div>
            <label className="block mb-1 text-sm font-medium">Course (optional)</label>
            <select
              className="w-full px-3 py-2 rounded border border-border bg-card text-foreground"
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
              disabled={loading}
            >
              <option value="none">No Course</option>
              {courses.map((course: any) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" loading={loading} disabled={loading} className="w-full bg-[#fe0002] text-white">
              {loading ? "Uploading..." : "Upload Video"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 