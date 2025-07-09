"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface BookEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book: any
  courses: any[]
  onBookUpdated?: (updatedBook: any) => void
}

export default function BookEditDialog({ open, onOpenChange, book, courses, onBookUpdated }: BookEditDialogProps) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [genre, setGenre] = useState("")
  const [description, setDescription] = useState("")
  const [courseId, setCourseId] = useState("none")
  const [bookStatus, setBookStatus] = useState("draft") // "public", "private", "draft"
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (book) {
      setTitle(book.title || "")
      setAuthor(book.author || "")
      setGenre(book.genre || "")
      setDescription(book.description || "")
      setCourseId(book.course_id || "none")
      
      // Convert is_public to book status
      if (book.is_public === true || book.is_public === 'true') {
        setBookStatus("public")
      } else if (book.is_public === false || book.is_public === 'false') {
        setBookStatus("private")
      } else {
        setBookStatus("draft")
      }
      
      setCoverImageUrl(book.cover_image_url || "")
      setFileUrl(book.file_url || "")
    }
  }, [book])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setLoading(true)
    setError("")

    // Convert status to is_public value
    let isPublicValue: boolean | null = null
    if (bookStatus === "public") {
      isPublicValue = true
    } else if (bookStatus === "private") {
      isPublicValue = false
    }
    // For "draft", isPublicValue remains null

    try {
      const { error } = await supabase
        .from("books")
        .update({
          title,
          author,
          genre,
          description,
          course_id: courseId === "none" ? null : courseId,
          is_public: isPublicValue,
          cover_image_url: coverImageUrl,
          file_url: fileUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", book.id)

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        if (onBookUpdated) {
          onBookUpdated({
            ...book,
            title,
            author,
            genre,
            description,
            course_id: courseId === "none" ? null : courseId,
            is_public: isPublicValue,
            cover_image_url: coverImageUrl,
            file_url: fileUrl,
          })
        } else {
        setTimeout(() => {
          setSuccess(false)
          onOpenChange(false)
          window.location.reload()
        }, 2000)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError("")
    setSuccess(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>Update the book information and settings.</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center">
            <div className="text-green-600 mb-4">
              <Edit className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Book Updated Successfully!</h3>
            <p className="text-muted-foreground">The book has been updated in the library.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <Alert variant="destructive" className="glassmorphism-card border-red-500/20">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Book title"
                    aria-invalid={submitted && !title}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-author">Author *</Label>
                  <Input
                    id="edit-author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author name"
                    aria-invalid={submitted && !author}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-genre">Genre *</Label>
                  <Input
                    id="edit-genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="e.g., Fiction, Science, History"
                    aria-invalid={submitted && !genre}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-course">Course</Label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No course</SelectItem>
                      {Array.from(new Map(courses.map(c => [c.id, c])).values()).map((course) => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the book"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-bookStatus">Book Status</Label>
                <Select value={bookStatus} onValueChange={setBookStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select book status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Not published)</SelectItem>
                    <SelectItem value="private">Private (Only logged in users can see)</SelectItem>
                    <SelectItem value="public">Public (Everyone can see)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-coverImageUrl">Cover Image URL</Label>
                <Input
                  id="edit-coverImageUrl"
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-fileUrl">Book File URL *</Label>
                <Input
                  id="edit-fileUrl"
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://example.com/book.pdf"
                  aria-invalid={submitted && !fileUrl}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#fe0002] hover:bg-[#fe0002]/90" disabled={loading}>
                {loading ? "Updating Book..." : "Update Book"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
