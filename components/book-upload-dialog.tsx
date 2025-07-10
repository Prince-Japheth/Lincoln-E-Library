"use client"

import type React from "react"

import { useState, useRef, useMemo } from "react"
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
import { Upload, FileText, Image, X, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { uploadFile } from "@/lib/supabase/storage"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { logAuditEvent, logAuditEventWithProfileCheck } from "@/lib/utils"
import { useTheme } from "next-themes"

interface BookUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: any[]
  onBookAdded?: (book: any) => void
}

export default function BookUploadDialog({ open, onOpenChange, courses, onBookAdded }: BookUploadDialogProps) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [genre, setGenre] = useState("")
  const [description, setDescription] = useState("")
  const [courseId, setCourseId] = useState("none")
  const [bookStatus, setBookStatus] = useState("draft") // "public", "private", "draft"
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [courseSearch, setCourseSearch] = useState("")
  const [genreSuggestions, setGenreSuggestions] = useState<string[]>([]);
  
  const coverImageRef = useRef<HTMLInputElement>(null)
  const bookFileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { resolvedTheme } = useTheme();

  const genres = [
    "Science Fiction", "Fantasy", "Mystery", "Romance", "Thriller", "Non-Fiction", "Biography", "History", "Children", "Young Adult", "Self-Help", "Education", "Science", "Math", "Technology", "Art", "Comics", "Graphic Novel", "Horror", "Adventure", "Drama", "Poetry", "Religion", "Health", "Business", "Philosophy", "Travel", "Cooking", "Sports", "Music", "Classic", "Short Stories", "Memoir", "Politics", "Psychology", "Reference", "True Crime", "Other"
  ];

  // Ensure unique courses by id
  const uniqueCourses = useMemo(() => Array.from(new Map(courses.map(c => [c.id, c])).values()), [courses])
  const filteredCourses = useMemo(
    () => uniqueCourses.filter(course => course.name.toLowerCase().includes(courseSearch.toLowerCase())),
    [uniqueCourses, courseSearch]
  )

  const validateFiles = () => {
    if (!bookFile && !fileUrl) {
      setError("Please select a book file (PDF) or provide a link.")
      return false
    }

    if (bookFile && bookFile.type !== "application/pdf") {
      setError("Book file must be a PDF")
      return false
    }

    if (bookFile && bookFile.size > 50 * 1024 * 1024) { // 50MB limit
      setError("Book file size must be less than 50MB")
      return false
    }

    if (coverImageFile && coverImageFile.size > 5 * 1024 * 1024) { // 5MB limit
      setError("Cover image size must be less than 5MB")
      return false
    }

    return true
  }

  // Refactor handleFileUpload to return { fileUrl, coverImageUrl }
  const handleFileUpload = async () => {
    if (!validateFiles()) return { fileUrl, coverImageUrl };
    setUploadProgress(0);
    let bookUrlToUse = fileUrl;
    let coverUrlToUse = coverImageUrl;
    try {
      if (bookFile) {
        const bookFileName = `${Date.now()}-${bookFile.name}`;
        const bookPath = `books/${bookFileName}`;
        const { url: bookUrl, error: bookError } = await uploadFile(
          bookFile,
          "books",
          bookPath
        );
        if (bookError) {
          setError(`Failed to upload book file: ${bookError.message}`);
          return { fileUrl, coverImageUrl };
        }
        bookUrlToUse = bookUrl;
      }
      setUploadProgress(50);
      if (coverImageFile) {
        const coverFileName = `${Date.now()}-${coverImageFile.name}`;
        const coverPath = `covers/${coverFileName}`;
        const { url: coverUrl, error: coverError } = await uploadFile(
          coverImageFile,
          "covers",
          coverPath
        );
        if (coverError) {
          setError(`Failed to upload cover image: ${coverError.message}`);
          return { fileUrl: bookUrlToUse, coverImageUrl };
        }
        coverUrlToUse = coverUrl;
      }
      setUploadProgress(100);
      return { fileUrl: bookUrlToUse, coverImageUrl: coverUrlToUse };
    } catch (error) {
      setError("File upload failed");
      return { fileUrl: bookUrlToUse, coverImageUrl: coverUrlToUse };
    }
  };

  // In handleSubmit, use the returned URLs from handleFileUpload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUploadProgress(1); // Show progress bar immediately

    if (!title || !author || !genre) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Upload files first
    const uploadResult = await handleFileUpload();
    if (!uploadResult) {
      setLoading(false);
      return;
    }
    const { fileUrl: newFileUrl, coverImageUrl: newCoverImageUrl } = uploadResult;

    // Convert status to is_public value
    let isPublicValue: boolean | null = null;
    if (bookStatus === "public") {
      isPublicValue = true;
    } else if (bookStatus === "private") {
      isPublicValue = false;
    }
    // For "draft", isPublicValue remains null

    try {
      const { data, error } = await supabase.from("books").insert([
        {
          title,
          author,
          genre,
          description,
          course_id: courseId === "none" ? null : courseId,
          is_public: isPublicValue,
          cover_image_url: newCoverImageUrl || "/placeholder.svg?height=400&width=300",
          file_url: newFileUrl || null,
        },
      ]).select().single();

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        if (onBookAdded) onBookAdded(data);
        const { data: { user } } = await supabase.auth.getUser();
        await logAuditEventWithProfileCheck({
          userId: user?.id,
          action: "add_book",
          tableName: "books",
          recordId: data.id,
          oldValues: null,
          newValues: data,
          ipAddress: null,
          userAgent: null,
        });
        console.log("[AUDIT] Book added and audit log updated.");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("")
    setAuthor("")
    setGenre("")
    setDescription("")
    setCourseId("none")
    setBookStatus("draft")
    setCoverImageFile(null)
    setBookFile(null)
    setCoverImageUrl("")
    setFileUrl("")
    setError("")
    setUploadProgress(0)
    setCourseSearch("")
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>
            Upload a new book to the library. Fill in the details below and select the book file.
          </DialogDescription>
        </DialogHeader>

        {/* Floating success/error alerts */}
        <div className="fixed top-6 left-1/2 z-50 transform -translate-x-1/2 w-full max-w-md pointer-events-none">
          {success && (
            <Alert className={`border-green-600 ${resolvedTheme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'} shadow-lg pointer-events-auto`}>
              <Check className="h-5 w-5 text-green-600" />
              <AlertDescription>Book uploaded successfully!</AlertDescription>
            </Alert>
          )}
              {error && (
            <Alert className={`mt-2 border-red-600 ${resolvedTheme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'} shadow-lg pointer-events-auto`}>
              <X className="h-5 w-5 text-red-600" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Book title"
                    aria-invalid={!title}
                    className="w-full"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author name"
                    aria-invalid={!author}
                    className="w-full"
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
                  <Label htmlFor="course">Course</Label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          type="text"
                          placeholder="Search courses..."
                          value={courseSearch}
                          onChange={e => setCourseSearch(e.target.value)}
                          className="mb-2 w-full"
                        />
                      </div>
                      <SelectItem value="none">No course</SelectItem>
                      {filteredCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the book"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bookStatus">Book Status</Label>
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

              {/* File Upload Section */}
              <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Book File (PDF) *</Label>
                <Tabs defaultValue="upload" className="w-full">
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

              <div className="grid gap-2">
                <Label>Cover Image (Optional)</Label>
                <Tabs defaultValue="upload" className="w-full">
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
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Add Book"}
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  )
}
