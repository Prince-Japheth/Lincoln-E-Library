"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { logAuditEventWithProfileCheck } from "@/lib/utils"

interface CourseEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: any
  onCourseUpdated: (updatedCourse: any) => void
}

export default function CourseEditDialog({ open, onOpenChange, course, onCourseUpdated }: CourseEditDialogProps) {
  const [name, setName] = useState(course?.name || "")
  const [description, setDescription] = useState(course?.description || "")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({})
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // Reset form when course changes
  useState(() => {
    if (course) {
      setName(course.name || "")
      setDescription(course.description || "")
      setErrors({})
    }
  })

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {}

    if (!name.trim()) {
      newErrors.name = "Course name is required"
    } else if (name.trim().length < 2) {
      newErrors.name = "Course name must be at least 2 characters"
    }

    if (description.trim().length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("courses")
        .update({
          name: name.trim(),
          description: description.trim(),
          updated_at: new Date().toISOString()
        })
        .eq("id", course.id)
        .select()
        .single()

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        })
      } else {
        setSuccess(true)
        onCourseUpdated(data)
        try {
          const { data: { user } } = await supabase.auth.getUser();
          await logAuditEventWithProfileCheck({
            userId: user?.id,
            action: "edit_course",
            tableName: "courses",
            recordId: data.id,
            newValues: data,
          })
          console.log("[AUDIT] Course edited and audit log updated.")
        } catch (err) {
          console.error("[AUDIT] Failed to log course edit:", err)
        }
        onOpenChange(false)
        toast({
          title: "Course updated",
          description: `Course '${data.name}' was updated successfully!`,
          variant: "default"
        })
        setTimeout(() => setSuccess(false), 2000)
      }
    } catch (err) {
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Course Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter course name"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter course description"
              rows={3}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {success && (
            <div className="mb-4 p-3 border border-green-600 bg-green-50 text-green-700 rounded flex items-center gap-2">
              <span>Course updated successfully!</span>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Course
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 