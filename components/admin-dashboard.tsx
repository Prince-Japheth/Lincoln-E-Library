"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Users, FileText, Plus, Eye, Edit, Trash2, Check, X, Bell, GraduationCap, MoreVertical } from "lucide-react"
import BookUploadDialog from "@/components/book-upload-dialog"
import BookEditDialog from "@/components/book-edit-dialog"
import CourseCreateDialog from "@/components/course-create-dialog"
import CourseEditDialog from "@/components/course-edit-dialog"
import VideoUploadDialog from "@/components/video-upload-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { logAuditEvent, checkRateLimit } from "@/lib/utils"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import DashboardAnalytics from "@/components/dashboard-analytics"


interface AdminDashboardProps {
  books: any[]
  bookRequests: any[]
  courses: any[]
  users: any[]
}

export default function AdminDashboard({ books: initialBooks, bookRequests, courses, users }: AdminDashboardProps) {
  const [books, setBooks] = useState(initialBooks)
  const [allCourses, setAllCourses] = useState(courses)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingBook, setEditingBook] = useState<any>(null)
  const [showCreateCourseDialog, setShowCreateCourseDialog] = useState(false)
  const [showEditCourseDialog, setShowEditCourseDialog] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // Bulk selection state
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  // Memoize books, bookRequests, and users for performance
  const memoBooks = useMemo(() => books, [books])
  const memoBookRequests = useMemo(() => bookRequests, [bookRequests])
  const [usersState, setUsersState] = useState(users)
  const memoUsers = useMemo(() => usersState, [usersState])

  // Filter books by search
  const [search, setSearch] = useState("")
  const [filterCourse, setFilterCourse] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterGenre, setFilterGenre] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const booksPerPage = 10

  // Unique courses and genres for filters
  const courseMap = new Map();
  allCourses.forEach(course => {
    courseMap.set(course.id, course);
  });
  const uniqueCourses = Array.from(courseMap.values());
  const uniqueGenres = Array.from(new Set(books.map(b => b.genre).filter(Boolean)))

  // Filter and sort books
  const filteredBooks = books
    .filter(
      (book) =>
        (book.title.toLowerCase().includes(search.toLowerCase()) ||
          book.author.toLowerCase().includes(search.toLowerCase()) ||
          book.genre.toLowerCase().includes(search.toLowerCase())) &&
        (filterCourse === "all" || book.course_id === filterCourse) &&
        (filterStatus === "all" || 
          (filterStatus === "public" ? (book.is_public === true || book.is_public === 'true') : 
           filterStatus === "private" ? (book.is_public === false || book.is_public === 'false') :
           filterStatus === "draft" ? (book.is_public === null || book.is_public === undefined) : false)) &&
        (filterGenre === "all" || book.genre === filterGenre)
    )
    .sort((a, b) => Number(new Date(b.created_at)) - Number(new Date(a.created_at)))

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage)
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage)

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete_book' | 'delete_books' | 'delete_user' | 'delete_users' | 'delete_course' | 'change_role'
    title: string
    description: string
    onConfirm: () => void
  } | null>(null)

  // Bulk book actions
  const handleSelectBook = (id: string) => {
    setSelectedBookIds((prev) => prev.includes(id) ? prev.filter((bid) => bid !== id) : [...prev, id])
  }
  const handleSelectAllBooks = () => {
    if (selectedBookIds.length === books.length) {
      setSelectedBookIds([])
    } else {
      setSelectedBookIds(books.map((b) => b.id))
    }
  }
  const handleBulkDeleteBooks = () => {
    setConfirmAction({
      type: 'delete_books',
      title: 'Delete Selected Books',
      description: `Are you sure you want to delete ${selectedBookIds.length} selected books? This action cannot be undone.`,
      onConfirm: async () => {
        setLoading(true)
        try {
          const allowed = await checkRateLimit({ userId: users[0]?.id, endpoint: "delete_books", limit: 10, windowMinutes: 1 })
          if (!allowed) {
            toast({ title: "Rate limit exceeded", description: "Please try again later.", variant: "destructive" })
            return
          }

          const { error } = await supabase.from("books").delete().in("id", selectedBookIds)
          if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
          } else {
            setSelectedBookIds([])
            await logAuditEvent({
              userId: users[0]?.id,
              action: "delete_books",
              tableName: "books",
              recordId: selectedBookIds.join(","),
            })
          }
        } catch (err) {
          toast({ title: "Unexpected Error", description: "An unexpected error occurred.", variant: "destructive" })
        } finally {
          setLoading(false)
        }
      }
    })
    setShowConfirmDialog(true)
  }

  // Bulk user actions
  const handleSelectUser = (id: string) => {
    setSelectedUserIds((prev) => prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id])
  }
  const handleSelectAllUsers = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([])
    } else {
      setSelectedUserIds(users.map((u) => u.id))
    }
  }
  const handleBulkDeleteUsers = () => {
    setConfirmAction({
      type: 'delete_users',
      title: 'Delete Selected Users',
      description: `Are you sure you want to delete ${selectedUserIds.length} selected users? This action cannot be undone.`,
      onConfirm: async () => {
        setLoading(true)
        try {
          const allowed = await checkRateLimit({ userId: users[0]?.id, endpoint: "delete_users", limit: 10, windowMinutes: 1 })
          if (!allowed) {
            toast({ title: "Rate limit exceeded", description: "Please try again later.", variant: "destructive" })
            return
          }

          const { error } = await supabase.from("user_profiles").delete().in("id", selectedUserIds)
          if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
          } else {
            setSelectedUserIds([])
            await logAuditEvent({
              userId: users[0]?.id,
              action: "delete_users",
              tableName: "user_profiles",
              recordId: selectedUserIds.join(","),
            })
          }
        } catch (err) {
          toast({ title: "Unexpected Error", description: "An unexpected error occurred.", variant: "destructive" })
        } finally {
          setLoading(false)
        }
      }
    })
    setShowConfirmDialog(true)
  }
  const handleBulkChangeRole = (role: string) => {
    setConfirmAction({
      type: 'change_role',
      title: 'Change User Roles',
      description: `Are you sure you want to change the role of ${selectedUserIds.length} users to ${role}?`,
      onConfirm: async () => {
        setLoading(true)
        try {
          const allowed = await checkRateLimit({ userId: users[0]?.id, endpoint: "change_role", limit: 10, windowMinutes: 1 })
          if (!allowed) {
            toast({ title: "Rate limit exceeded", description: "Please try again later.", variant: "destructive" })
            return
          }

          const { error } = await supabase.from("user_profiles").update({ role }).in("id", selectedUserIds)
          if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
          } else {
            setSelectedUserIds([])
            await logAuditEvent({
              userId: users[0]?.id,
              action: "change_role",
              tableName: "user_profiles",
              recordId: selectedUserIds.join(","),
              newValues: { role },
            })
          }
        } catch (err) {
          toast({ title: "Unexpected Error", description: "An unexpected error occurred.", variant: "destructive" })
        } finally {
          setLoading(false)
        }
      }
    })
    setShowConfirmDialog(true)
  }

  const handleRequestAction = async (requestId: string, action: "approved" | "denied") => {
    setLoading(true)
    try {
      const allowed = await checkRateLimit({ userId: users[0]?.id, endpoint: "update_request", limit: 10, windowMinutes: 1 })
      if (!allowed) {
        toast({ title: "Rate limit exceeded", description: "Please try again later.", variant: "destructive" })
        return
      }

      const { error } = await supabase.from("book_requests").update({ status: action }).eq("id", requestId)

      if (error) {
        console.error("Error updating request:", error)
      } else {
        // Create notification for the user
        const request = bookRequests.find((req) => req.id === requestId)
        if (request) {
          await supabase.from("notifications").insert({
            user_id: request.user_id,
            title: `Book Request ${action === "approved" ? "Approved" : "Denied"}`,
            message: `Your request for "${request.title}" by ${request.author} has been ${action}.`,
            type: action === "approved" ? "success" : "info",
          })
        }

        await logAuditEvent({
          userId: users[0]?.id,
          action: "update_request",
          tableName: "book_requests",
          recordId: requestId,
          newValues: { status: action },
        })

        // Refresh the page to show updated data
        window.location.reload()
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditBook = (book: any) => {
    setEditingBook(book)
    setShowEditDialog(true)
  }

  const handleDeleteBook = (bookId: string) => {
    setConfirmAction({
      type: 'delete_book',
      title: 'Delete Book',
      description: 'Are you sure you want to delete this book? This action cannot be undone.',
      onConfirm: async () => {
        setLoading(true)
        try {
          // Fetch old book for audit
          const oldBook = books.find((b) => b.id === bookId)
          const { error } = await supabase.from("books").delete().eq("id", bookId)

          if (error) {
            console.error("Error deleting book:", error)
          } else {
            setBooks((prevBooks) => prevBooks.filter((b) => b.id !== bookId))
            await logAuditEvent({
              userId: users[0]?.id,
              action: "delete_book",
              tableName: "books",
              recordId: bookId,
              oldValues: oldBook,
            })
          }
        } catch (error) {
          console.error("Error:", error)
        } finally {
          setLoading(false)
        }
      }
    })
    setShowConfirmDialog(true)
  }

  const handleBookUpdated = (updatedBook: any) => {
    setBooks((prevBooks) => prevBooks.map((b) => b.id === updatedBook.id ? { ...b, ...updatedBook } : b))
    setShowEditDialog(false)
    setEditingBook(null)
  }

  const pendingRequests = bookRequests.filter((req) => req.status === "pending")

  const [courseSearch, setCourseSearch] = useState("")
  const filteredCourses = uniqueCourses.filter(course => course.name.toLowerCase().includes(courseSearch.toLowerCase()))

  // Add this callback for course creation
  const handleCourseCreated = (newCourse: any) => {
    setAllCourses(prev => {
      // Avoid duplicates
      if (prev.some(c => c.id === newCourse.id)) return prev;
      return [...prev, newCourse];
    });
    toast({ title: "Course created", description: `Course '${newCourse.name}' was added successfully!`, variant: "default" });
  }

  // Add this callback for book creation
  const handleBookAdded = (newBook: any) => {
    setBooks(prev => [newBook, ...prev]);
    toast({ title: "Book added", description: `Book '${newBook.title}' was added successfully!`, variant: "default" });
  }

  const handleEditCourse = (course: any) => {
    setEditingCourse(course)
    setShowEditCourseDialog(true)
  }

  const handleDeleteCourse = (courseId: string) => {
    setConfirmAction({
      type: 'delete_course',
      title: 'Delete Course',
      description: 'Are you sure you want to delete this course? Books associated with this course will lose their course assignment.',
      onConfirm: async () => {
        setLoading(true)
        try {
          // First, update books to remove course association
          const { error: booksError } = await supabase
            .from("books")
            .update({ course_id: null })
            .eq("course_id", courseId)

          if (booksError) {
            toast({ title: "Error", description: "Failed to update books: " + booksError.message, variant: "destructive" })
            return
          }

          // Then delete the course
          const { error } = await supabase.from("courses").delete().eq("id", courseId)

          if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
          } else {
            setAllCourses((prev) => prev.filter((c) => c.id !== courseId))
            await logAuditEvent({
              userId: users[0]?.id,
              action: "delete_course",
              tableName: "courses",
              recordId: courseId,
            })
            toast({ title: "Course deleted", description: "Course was deleted successfully!", variant: "default" })
          }
        } catch (err) {
          toast({ title: "Unexpected Error", description: "An unexpected error occurred.", variant: "destructive" })
        } finally {
          setLoading(false)
        }
      }
    })
    setShowConfirmDialog(true)
  }

  const handleCourseUpdated = (updatedCourse: any) => {
    setAllCourses((prev) => prev.map((c) => c.id === updatedCourse.id ? updatedCourse : c))
    setShowEditCourseDialog(false)
    setEditingCourse(null)
  }

  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [videos, setVideos] = useState<any[]>([])
  const [editingVideo, setEditingVideo] = useState<any>(null)
  const [showEditVideoDialog, setShowEditVideoDialog] = useState(false)
  const [deletingVideo, setDeletingVideo] = useState<any>(null)

  // Fetch videos on mount
  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: false })
      setVideos(data || [])
    }
    fetchVideos()
  }, [])

  const handleVideoAdded = async (video: any) => {
    setVideos((prev) => [video, ...prev])
    try {
      await logAuditEvent({
        userId: users[0]?.id,
        action: "add_video",
        tableName: "videos",
        recordId: video.id,
        newValues: video,
      })
      console.log("[AUDIT] Video added and audit log updated.")
    } catch (err) {
      console.error("[AUDIT] Failed to log video add:", err)
    }
  }

  const handleEditVideo = (video: any) => {
    setEditingVideo(video)
    setShowEditVideoDialog(true)
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) return
    const oldVideo = videos.find((v) => v.id === videoId)
    const { error } = await supabase.from("videos").delete().eq("id", videoId)
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      setVideos((prev) => prev.filter((v) => v.id !== videoId))
      toast({ title: "Video deleted", variant: "default" })
      try {
        await logAuditEvent({
          userId: users[0]?.id,
          action: "delete_video",
          tableName: "videos",
          recordId: videoId,
          oldValues: oldVideo,
        })
        console.log("[AUDIT] Video deleted and audit log updated.")
      } catch (err) {
        console.error("[AUDIT] Failed to log video delete:", err)
      }
    }
  }

  const handleVideoUpdated = async (updatedVideo: any) => {
    setVideos((prev) => prev.map((v) => v.id === updatedVideo.id ? updatedVideo : v))
    setShowEditVideoDialog(false)
    setEditingVideo(null)
    toast({ title: "Video updated", variant: "default" })
    try {
      await logAuditEvent({
        userId: users[0]?.id,
        action: "edit_video",
        tableName: "videos",
        recordId: updatedVideo.id,
        newValues: updatedVideo,
      })
      console.log("[AUDIT] Video edited and audit log updated.")
    } catch (err) {
      console.error("[AUDIT] Failed to log video edit:", err)
    }
  }

  // Video filtering state
  const [videoSearch, setVideoSearch] = useState("")
  const [videoFilterCourse, setVideoFilterCourse] = useState("all")
  const [videoPage, setVideoPage] = useState(1)
  const videosPerPage = 10

  const filteredVideos = videos
    .filter(
      (video) =>
        (video.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
          video.link.toLowerCase().includes(videoSearch.toLowerCase())) &&
        (videoFilterCourse === "all" || video.course_id === videoFilterCourse)
    )
    .sort((a, b) => Number(new Date(b.created_at)) - Number(new Date(a.created_at)))

  const totalVideoPages = Math.ceil(filteredVideos.length / videosPerPage)
  const paginatedVideos = filteredVideos.slice((videoPage - 1) * videosPerPage, videoPage * videosPerPage)

  // Add state for editing/deleting a user
  const [editingUser, setEditingUser] = useState<any>(null)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [deletingUser, setDeletingUser] = useState<any>(null)
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false)
  const [userActionLoading, setUserActionLoading] = useState(false)
  const [userActionSuccess, setUserActionSuccess] = useState("")
  const [userActionError, setUserActionError] = useState("")

  // User delete handler
  const handleDeleteUser = async (user: any) => {
    setUserActionLoading(true)
    setUserActionError("")
    setUserActionSuccess("")
    try {
      const { error } = await supabase.from("user_profiles").delete().eq("user_id", user.user_id)
      if (error) {
        setUserActionError(error.message)
      } else {
        setUserActionSuccess("User deleted successfully.")
        setUsersState((prev: any[]) => prev.filter(u => u.user_id !== user.user_id))
        await logAuditEvent({
          userId: users[0]?.id,
          action: "delete_user",
          tableName: "user_profiles",
          recordId: user.user_id,
          oldValues: user,
        })
        console.log("[AUDIT] User deleted and audit log updated.")
        if (analyticsRef.current && analyticsRef.current.refresh) analyticsRef.current.refresh()
        setTimeout(() => {
          setUserActionSuccess("")
          setShowDeleteUserDialog(false)
          setDeletingUser(null)
          // window.location.reload(); // Removed: no full page reload
        }, 1500)
      }
    } catch (err) {
      setUserActionError("An unexpected error occurred.")
      console.error("[AUDIT] Failed to log user delete:", err)
    } finally {
      setUserActionLoading(false)
    }
  }

  // Defensive update for user role
  const editUserInProgress = useRef(false)
  const handleEditUser = async (user: any, newRole: string) => {
    if (editUserInProgress.current) return // Prevent duplicate calls
    editUserInProgress.current = true
    setUserActionLoading(true)
    setUserActionError("")
    setUserActionSuccess("")
    // Defensive: log user object and user_id
    console.log("[DEBUG] handleEditUser called with user:", user)
    if (!user || !user.user_id) {
      setUserActionError("Invalid user object: user_id is missing or null.")
      setUserActionLoading(false)
      editUserInProgress.current = false
      console.error("[DEBUG] Invalid user object passed to handleEditUser:", user)
      return
    }
    try {
      // Defensive: use maybeSingle and check for null
      const { data: updated, error } = await supabase
        .from("user_profiles")
        .update({ role: newRole })
        .eq("user_id", user.user_id)
        .select()
        .maybeSingle();
      if (error) {
        setUserActionError(error.message)
      } else if (!updated) {
        setUserActionError("No user found to update. Please check the user ID and try again.")
        console.error("[DEBUG] No user found for user_id:", user.user_id)
      } else {
        setUserActionSuccess("User updated successfully.")
        // Find the old user before updating state
        const oldUser = usersState.find(u => u.user_id === user.user_id)
        setUsersState((prev: any[]) => prev.map(u => u.user_id === user.user_id ? { ...u, role: newRole } : u))
        try {
          await logAuditEvent({
            userId: users[0]?.user_id,
            action: "edit_user",
            tableName: "user_profiles",
            recordId: user.user_id,
            oldValues: oldUser,
            newValues: { ...user, role: newRole },
          })
          console.log("[AUDIT] User edited and audit log updated.")
        } catch (err) {
          console.error("[AUDIT] Failed to log user edit:", err)
        }
        if (analyticsRef.current && analyticsRef.current.refresh) analyticsRef.current.refresh()
        setTimeout(() => {
          setUserActionSuccess("")
          setShowEditUserDialog(false)
          setEditingUser(null)
        }, 1500)
      }
    } catch (err) {
      setUserActionError("An unexpected error occurred.")
      console.error("[AUDIT] Failed to log user edit:", err)
    } finally {
      setUserActionLoading(false)
      editUserInProgress.current = false
    }
  }

  // SQL to enforce uniqueness on user_id in user_profiles:
  // ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);
  const analyticsRef = useRef<{ refresh: () => void }>(null)

  return (
    <div className="space-y-6">
      <div className="mb-8">
      <DashboardAnalytics userRole="admin" ref={analyticsRef} />
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="books" className="space-y-4">
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="requests">
            Requests{" "}
            {pendingRequests.length > 0 && <Badge className="ml-2 bg-[#fe0002]">{pendingRequests.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-4 px-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4">
            <h3 className="text-lg font-semibold">Book Management</h3>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full md:w-auto">
              <Input
                type="text"
                placeholder="Search books..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-64"
              />
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto overflow-x-auto">
              <Select value={filterCourse} onValueChange={value => { setFilterCourse(value); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-40 min-w-[140px]">
                  <SelectValue placeholder="Filter by course" />
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
                  <SelectItem value="all">All Courses</SelectItem>
                  {filteredCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={value => { setFilterStatus(value); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-32 min-w-[100px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterGenre} onValueChange={value => { setFilterGenre(value); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-40 min-w-[120px]">
                  <SelectValue placeholder="Filter by genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {uniqueGenres.map((genre) => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={() => setShowCreateCourseDialog(true)} variant="outline" className="w-full sm:w-auto ml-0 sm:ml-2">
                <Plus className="h-4 w-4 mr-2" /> Create Course
              </Button>
              <Button onClick={() => setShowUploadDialog(true)} className="w-full sm:w-auto bg-[#fe0002] hover:bg-[#fe0002]/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
              </div>
            </div>
          </div>

          {/* Bulk book actions */}
          {selectedBookIds.length > 0 && (
            <div className="mb-4 flex gap-4 items-center">
              <span className="text-sm">{selectedBookIds.length} selected</span>
              <Button variant="destructive" onClick={handleBulkDeleteBooks} disabled={loading}>
                Delete Selected
              </Button>
            </div>
          )}

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[600px] text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <input type="checkbox" checked={selectedBookIds.length === books.length && books.length > 0} onChange={handleSelectAllBooks} />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <input type="checkbox" checked={selectedBookIds.includes(book.id)} onChange={() => handleSelectBook(book.id)} />
                      </TableCell>
                      <TableCell className="font-medium max-w-[120px] truncate whitespace-nowrap" title={book.title}>{book.title}</TableCell>
                      <TableCell className="max-w-[100px] truncate whitespace-nowrap" title={book.author}>{book.author}</TableCell>
                      <TableCell className="max-w-[80px] truncate whitespace-nowrap" title={book.genre}>{book.genre}</TableCell>
                      <TableCell className="max-w-[100px] truncate whitespace-nowrap" title={book.courses?.name}>{book.courses?.name || "No course"}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            (book.is_public === true || book.is_public === 'true') ? "default" : 
                            (book.is_public === false || book.is_public === 'false') ? "secondary" : 
                            "outline"
                          }
                        >
                          {(book.is_public === true || book.is_public === 'true') ? "Public" : 
                           (book.is_public === false || book.is_public === 'false') ? "Private" : 
                           "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/book/${book.id}`} target="_blank" rel="noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditBook(book)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                            onClick={() => handleDeleteBook(book.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-4 px-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4">
            <h3 className="text-lg font-semibold">Course Management</h3>
            <Button onClick={() => setShowCreateCourseDialog(true)} className="w-full sm:w-auto bg-[#fe0002] hover:bg-[#fe0002]/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[600px] text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Books Count</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allCourses.map((course) => {
                    const booksCount = books.filter(book => book.course_id === course.id).length
                    return (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium max-w-[150px] truncate whitespace-nowrap" title={course.name}>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-gray-500" />
                            {course.name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate whitespace-nowrap" title={course.description}>
                          {course.description || "No description"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{booksCount} books</Badge>
                        </TableCell>
                        <TableCell className="max-w-[100px] truncate whitespace-nowrap" title={new Date(course.created_at).toLocaleDateString()}>
                          {new Date(course.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditCourse(course)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => handleDeleteCourse(course.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4 px-2">
          <h3 className="text-lg font-semibold">Book Requests</h3>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[600px] text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="max-w-[120px] truncate whitespace-nowrap" title={request.user_profiles?.full_name}>
                        <div>
                          <div className="font-medium">{request.user_profiles?.full_name}</div>
                          <div className="text-sm text-gray-500">{request.user_profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[120px] truncate whitespace-nowrap" title={request.title}>{request.title}</TableCell>
                      <TableCell className="max-w-[100px] truncate whitespace-nowrap" title={request.author}>{request.author}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "default"
                              : request.status === "denied"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[80px] truncate whitespace-nowrap" title={new Date(request.created_at).toLocaleDateString()}>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleRequestAction(request.id, "approved")}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRequestAction(request.id, "denied")}
                              disabled={loading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 px-2">
          <h3 className="text-lg font-semibold">User Management</h3>

          {/* Bulk user actions */}
          {selectedUserIds.length > 0 && (
            <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
              <span className="text-sm">{selectedUserIds.length} selected</span>
              <Button variant="destructive" onClick={handleBulkDeleteUsers} disabled={loading} className="w-full sm:w-auto">
                Delete Selected
              </Button>
              <Button variant="outline" onClick={() => handleBulkChangeRole("admin")} disabled={loading} className="w-full sm:w-auto">
                Make Admin
              </Button>
              <Button variant="outline" onClick={() => handleBulkChangeRole("student")} disabled={loading} className="w-full sm:w-auto">
                Make Student
              </Button>
            </div>
          )}

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[600px] text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <input type="checkbox" checked={selectedUserIds.length === users.length && users.length > 0} onChange={handleSelectAllUsers} />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersState.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => handleSelectUser(user.id)} />
                      </TableCell>
                      <TableCell className="font-medium max-w-[120px] truncate whitespace-nowrap" title={user.full_name}>{user.full_name}</TableCell>
                      <TableCell className="max-w-[140px] truncate whitespace-nowrap" title={user.email}>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[80px] truncate whitespace-nowrap" title={new Date(user.created_at).toLocaleDateString()}>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                              <MoreVertical className="h-4 w-4" />
                        </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingUser(user); setShowEditUserDialog(true); }}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setDeletingUser(user); setShowDeleteUserDialog(true); }}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Videos</CardTitle>
              <Button onClick={() => setShowVideoDialog(true)} className="bg-[#fe0002] text-white">
                <Plus className="h-4 w-4 mr-2" /> Upload Video
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                  type="text"
                  placeholder="Search videos..."
                  value={videoSearch}
                  onChange={e => { setVideoSearch(e.target.value); setVideoPage(1); }}
                  className="w-full md:w-64"
                />
                <Select value={videoFilterCourse} onValueChange={value => { setVideoFilterCourse(value); setVideoPage(1); }}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {uniqueCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {filteredVideos.length === 0 ? (
                <div className="text-muted-foreground">No videos uploaded yet.</div>
              ) : (
                <div className="space-y-4">
                  {paginatedVideos.map((video) => (
                    <div key={video.id} className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-3">
                      <div>
                        <div className="font-semibold text-lg">{video.title}</div>
                        <a href={video.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{video.link}</a>
                        {video.course_id && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {uniqueCourses.find((c) => c.id === video.course_id)?.name || "Unknown Course"}
                      </div>
                        )}
                      </div>
                      <div className="mt-2 md:mt-0 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditVideo(video)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteVideo(video.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground ml-2">{new Date(video.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Pagination Controls for videos if needed */}
            </CardContent>
          </Card>
          <VideoUploadDialog open={showVideoDialog} onOpenChange={setShowVideoDialog} onVideoAdded={handleVideoAdded} courses={uniqueCourses} />
          {editingVideo && (
            <EditVideoDialog
              open={showEditVideoDialog}
              onOpenChange={setShowEditVideoDialog}
              video={editingVideo}
              courses={uniqueCourses}
              onVideoUpdated={handleVideoUpdated}
              toast={toast}
            />
          )}
        </TabsContent>
      </Tabs>

      <BookUploadDialog open={showUploadDialog} onOpenChange={setShowUploadDialog} courses={uniqueCourses} onBookAdded={handleBookAdded} />
      {editingBook && (
        <BookEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          book={editingBook}
          courses={uniqueCourses}
          onBookUpdated={handleBookUpdated}
        />
      )}
      <CourseCreateDialog open={showCreateCourseDialog} onOpenChange={setShowCreateCourseDialog} onCourseCreated={handleCourseCreated} />
      {editingCourse && (
        <CourseEditDialog
          open={showEditCourseDialog}
          onOpenChange={setShowEditCourseDialog}
          course={editingCourse}
          onCourseUpdated={handleCourseUpdated}
        />
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmAction?.onConfirm()
                setShowConfirmDialog(false)
                setConfirmAction(null)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showEditUserDialog && editingUser && (
        <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="mb-4">Name: {editingUser.full_name}<br />Email: {editingUser.email}</div>
            <div className="mb-4">
              <label className="block mb-1">Role</label>
              <select
                className="w-full border rounded p-2"
                value={editingUser.role}
                onChange={e => handleEditUser(editingUser, e.target.value)}
                disabled={userActionLoading}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {userActionSuccess && <div className="text-green-600 mb-2">{userActionSuccess}</div>}
            {userActionError && <div className="text-red-600 mb-2">{userActionError}</div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditUserDialog(false)} disabled={userActionLoading}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {showDeleteUserDialog && deletingUser && (
        <Dialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
            </DialogHeader>
            <div className="mb-4">Are you sure you want to delete user <b>{deletingUser.full_name}</b> ({deletingUser.email})?</div>
            {userActionSuccess && <div className="text-green-600 mb-2">{userActionSuccess}</div>}
            {userActionError && <div className="text-red-600 mb-2">{userActionError}</div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteUserDialog(false)} disabled={userActionLoading}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDeleteUser(deletingUser)} disabled={userActionLoading}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Edit Video Dialog Component
function EditVideoDialog({ open, onOpenChange, video, courses, onVideoUpdated, toast }: { open: boolean, onOpenChange: (v: boolean) => void, video: any, courses: any[], onVideoUpdated: (video: any) => void, toast: any }) {
  const [title, setTitle] = useState(video.title)
  const [link, setLink] = useState(video.link)
  const [courseId, setCourseId] = useState(video.course_id || "none")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.from("videos").update({ title, link, course_id: courseId === "none" ? null : courseId }).eq("id", video.id).select().single()
    setLoading(false)
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      onVideoUpdated(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
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
            <Button type="submit" disabled={loading} className="w-full bg-[#fe0002] text-white">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
