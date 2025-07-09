"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
import { Edit, Upload, FileText, Image, X, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { uploadFile } from "@/lib/supabase/storage"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

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
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const coverImageRef = useRef<HTMLInputElement>(null)
  const bookFileRef = useRef<HTMLInputElement>(null)

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
      setCoverImageFile(null)
      setBookFile(null)
      setUploadProgress(0)
    }
  }, [book])

  const validateFiles = () => {
    if (!bookFile && !fileUrl) {
      setError("Please select a book file (PDF) or provide a link.")
      return false
    }
    if (bookFile && bookFile.type !== "application/pdf") {
      setError("Book file must be a PDF")
      return false
    }
    if (bookFile && bookFile.size > 50 * 1024 * 1024) {
      setError("Book file size must be less than 50MB")
      return false
    }
    if (coverImageFile && coverImageFile.size > 5 * 1024 * 1024) {
      setError("Cover image size must be less than 5MB")
      return false
    }
    return true
  }

  const handleFileUpload = async () => {
    if (!validateFiles()) return { fileUrl: fileUrl, coverImageUrl: coverImageUrl }
    setUploadProgress(0)
    let bookUrlToUse = fileUrl
    let coverUrlToUse = coverImageUrl
    try {
      if (bookFile) {
        const bookFileName = `${Date.now()}-${bookFile.name}`
        const bookPath = `books/${bookFileName}`
        const { url: bookUrl, error: bookError } = await uploadFile(
          bookFile,
          "books",
          bookPath
        )
        if (bookError) {
          setError(`Failed to upload book file: ${bookError.message}`)
          return { fileUrl: fileUrl, coverImageUrl: coverImageUrl }
        }
        bookUrlToUse = bookUrl
      }
      setUploadProgress(50)
      if (coverImageFile) {
        const coverFileName = `${Date.now()}-${coverImageFile.name}`
        const coverPath = `covers/${coverFileName}`
        const { url: coverUrl, error: coverError } = await uploadFile(
          coverImageFile,
          "covers",
          coverPath
        )
        if (coverError) {
          setError(`Failed to upload cover image: ${coverError.message}`)
          return { fileUrl: bookUrlToUse, coverImageUrl: coverImageUrl }
        }
        coverUrlToUse = coverUrl
      }
      setUploadProgress(100)
      return { fileUrl: bookUrlToUse, coverImageUrl: coverUrlToUse }
    } catch (error) {
      setError("File upload failed")
      return { fileUrl: bookUrlToUse, coverImageUrl: coverUrlToUse }
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImageFile(file)
    }
  }
  const handleBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBookFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setLoading(true)
    setError("")
    // Upload files first
    const { fileUrl: newFileUrl, coverImageUrl: newCoverImageUrl } = await handleFileUpload()
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
          cover_image_url: newCoverImageUrl,
          file_url: newFileUrl,
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
            cover_image_url: newCoverImageUrl,
            file_url: newFileUrl,
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
                  <Label htmlFor="genre">Genre *</Label>
                  <Input
                    id="genre"
                    value={genre}
                    onChange={e => {
                      setGenre(e.target.value);
                      // Filter suggestions as user types
                      setGenreSuggestions(
                        genres.filter(g => g.toLowerCase().includes(e.target.value.toLowerCase()) && g !== e.target.value)
                      );
                    }}
                    placeholder="Genre"
                    aria-invalid={!genre}
                    className="w-full"
                    autoComplete="off"
                  />
                  {genre && genreSuggestions.length > 0 && (
                    <div className="absolute z-10 bg-card border border-border rounded shadow mt-1 w-full max-h-40 overflow-auto">
                      {genreSuggestions.map((g) => (
                        <div
                          key={g}
                          className="px-4 py-2 cursor-pointer hover:bg-accent"
                          onClick={() => { setGenre(g); setGenreSuggestions([]); }}
                        >
                          {g}
                        </div>
                      ))}
                    </div>
                  )}
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

              {/* Book File Section */}
              <div className="grid gap-2">
                <Label>Book File (PDF) *</Label>
                <Tabs defaultValue={bookFile ? "upload" : "link"} className="w-full">
                  <TabsList className="mb-2">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="link">Link</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => bookFileRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Select PDF File
                      </Button>
                      {bookFile && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Check className="h-4 w-4" />
                          {bookFile.name}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setBookFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <input
                      ref={bookFileRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleBookFileChange}
                      className="hidden"
                    />
                  </TabsContent>
                  <TabsContent value="link">
                <Input
                  type="url"
                      placeholder="Paste PDF file link here"
                      value={fileUrl}
                      onChange={e => setFileUrl(e.target.value)}
                    />
                  </TabsContent>
                </Tabs>
              </div>
              {/* Cover Image Section */}
              <div className="grid gap-2">
                <Label>Cover Image (Optional)</Label>
                <Tabs defaultValue={coverImageFile ? "upload" : "link"} className="w-full">
                  <TabsList className="mb-2">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="link">Link</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => coverImageRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Image className="h-4 w-4" />
                        Select Cover Image
                      </Button>
                      {coverImageFile && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Check className="h-4 w-4" />
                          {coverImageFile.name}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCoverImageFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <input
                      ref={coverImageRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                  </TabsContent>
                  <TabsContent value="link">
                <Input
                  type="url"
                      placeholder="Paste cover image link here"
                      value={coverImageUrl}
                      onChange={e => setCoverImageUrl(e.target.value)}
                    />
                  </TabsContent>
                </Tabs>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
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
