import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { logAuditEvent } from "@/lib/utils"

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
  const [success, setSuccess] = useState(false)
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
        setSuccess(true)
        onCourseCreated(data)
        try {
          await logAuditEvent({
            userId: null, // TODO: Replace with actual admin user id if available
            action: "add_course",
            tableName: "courses",
            recordId: data.id,
            newValues: data,
          })
          console.log("[AUDIT] Course added and audit log updated.")
        } catch (err) {
          console.error("[AUDIT] Failed to log course add:", err)
        }
        setName("")
        setDescription("")
        setTimeout(() => {
          setSuccess(false)
          onOpenChange(false)
        }, 2000)
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
          {success && (
            <div className="mb-4 p-3 border border-green-600 bg-green-50 text-green-700 rounded flex items-center gap-2">
              <span>Course created successfully!</span>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 border border-red-600 bg-red-50 text-red-700 rounded flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}
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