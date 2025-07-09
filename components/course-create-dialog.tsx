import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

interface CourseCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCourseCreated: (course: any) => void
}

export default function CourseCreateDialog({ open, onOpenChange, onCourseCreated }: CourseCreateDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const { data, error } = await supabase.from("courses").insert({ name, description }).select().single()
      if (error) {
        setError(error.message)
      } else {
        onCourseCreated(data)
        setName("")
        setDescription("")
        onOpenChange(false)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Course name"
            aria-invalid={!name}
            className="w-full"
          />
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Course description (optional)"
            className="w-full"
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#fe0002] hover:bg-[#fe0002]/90" disabled={loading || !name}>
              {loading ? "Creating..." : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 