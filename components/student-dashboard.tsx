"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Download, Eye, Search, Filter, Clock, Star, TrendingUp, Bookmark, Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import BookRequestDialog from "@/components/book-request-dialog"
import BookRequestList from "@/components/book-request-list"

interface StudentDashboardProps {
  books: any[]
  courses: any[]
  bookRequests: any[]
  readingStats: any
  user: any
}

export default function StudentDashboard({ books, courses, bookRequests: initialBookRequests, readingStats, user }: StudentDashboardProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [bookRequests, setBookRequests] = useState(initialBookRequests)
  const booksPerPage = 12
  const supabase = createClient()
  const { toast } = useToast()
  const [courseSearch, setCourseSearch] = useState("")
  const [genreSearch, setGenreSearch] = useState("")

  const genres = ["all", ...Array.from(new Set(books.map((book) => book.genre)))]

  const getBookStatus = (book: any) => {
    if (book.is_public === true || book.is_public === 'true') return 'public'
    if (book.is_public === false || book.is_public === 'false') return 'private'
    return 'draft'
  }

  // Only show public or private books (never drafts)
  const visibleBooks = books.filter((book) => book.is_public === true || book.is_public === 'true' || book.is_public === false || book.is_public === 'false');
  const filteredBooks = visibleBooks.filter((book) => {
    const genreMatch = selectedGenre === "all" || book.genre === selectedGenre;
    const courseMatch = selectedCourse === "all" || book.courses?.name === selectedCourse;
    const statusMatch = selectedStatus === "all" || 
      (selectedStatus === "public" ? (book.is_public === true || book.is_public === 'true') : 
       selectedStatus === "private" ? (book.is_public === false || book.is_public === 'false') : false);
    const searchMatch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    return genreMatch && courseMatch && statusMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage)
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'public':
        return <Badge variant="default">Public</Badge>
      case 'private':
        return <Badge variant="secondary">Private</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Add a callback to refresh book requests
  const handleRequestSubmitted = async () => {
    const { data, error } = await supabase
      .from("book_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    if (!error && data) {
      setBookRequests(data)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.full_name}! Access your complete library.</p>
          <div className="mt-4">
            <Button asChild className="bg-primary text-white hover:bg-primary/90">
              <Link href="/videos">
                <Play className="h-4 w-4 mr-2" />
                Watch Videos
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glassmorphism-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{books.length}</div>
              <p className="text-xs text-muted-foreground">Available in library</p>
            </CardContent>
          </Card>

          <Card className="glassmorphism-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books Read</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readingStats.totalBooksRead}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="glassmorphism-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reading Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readingStats.totalReadingTime}</div>
              <p className="text-xs text-muted-foreground">Total time spent</p>
            </CardContent>
          </Card>

          <Card className="glassmorphism-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requests</CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookRequests.length}</div>
              <p className="text-xs text-muted-foreground">Pending requests</p>
            </CardContent>
          </Card>
        </div>

        <BookRequestList bookRequests={bookRequests} setBookRequests={setBookRequests} userId={user.id} />

        {/* Search and Filters */}
        <Card className="glassmorphism-card border-0 mb-8 bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search books, authors, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-10 h-12 bg-card text-card-foreground border border-border text-base"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedGenre} onValueChange={(value) => { setSelectedGenre(value); setCurrentPage(1); }}>
                  <SelectTrigger className="h-12 bg-card text-card-foreground border border-border min-w-[150px]">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-card-foreground border border-border">
                    <div className="p-2">
                      <Input
                        placeholder="Search genres..."
                        value={genreSearch}
                        onChange={e => setGenreSearch(e.target.value)}
                        className="mb-2 h-8 text-sm bg-card text-card-foreground border border-border"
                      />
                    </div>
                    {genres.filter(g => g === "all" || g.toLowerCase().includes(genreSearch.toLowerCase())).map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre === "all" ? "All Genres" : genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCourse} onValueChange={(value) => { setSelectedCourse(value); setCurrentPage(1); }}>
                  <SelectTrigger className="h-12 bg-card text-card-foreground border border-border min-w-[150px]">
                    <SelectValue placeholder="Course" />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-card-foreground border border-border">
                    <div className="p-2">
                      <Input
                        placeholder="Search courses..."
                        value={courseSearch}
                        onChange={e => setCourseSearch(e.target.value)}
                        className="mb-2 h-8 text-sm bg-card text-card-foreground border border-border"
                      />
                    </div>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.filter(c => c.name.toLowerCase().includes(courseSearch.toLowerCase())).map((course) => (
                      <SelectItem key={course.id} value={course.name}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={(value) => { setSelectedStatus(value); setCurrentPage(1); }}>
                  <SelectTrigger className="h-12 bg-card text-card-foreground border border-border min-w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-card-foreground border border-border">
                    <SelectItem value="all">All Books</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={() => setShowRequestDialog(true)}
                  className="h-12 bg-[#fe0002] hover:bg-[#fe0002]/90"
                >
                  Request Book
                </Button>
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>
                  Showing {paginatedBooks.length} of {filteredBooks.length} books
                </span>
              </div>

              {(searchQuery || selectedGenre !== "all" || selectedCourse !== "all" || selectedStatus !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedGenre("all")
                    setSelectedCourse("all")
                    setSelectedStatus("all")
                    setCurrentPage(1)
                  }}
                  className="text-[#fe0002] hover:text-[#fe0002]/80"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Books Grid */}
        <div className="bento-grid mb-8">
          {paginatedBooks.map((book, index) => (
            <Card
              key={book.id}
              className="glassmorphism-card border-0 shadow-md overflow-hidden hover-lift group flex flex-col h-full"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square relative overflow-hidden rounded-t-2xl">
                <Image
                  src={book.cover_image_url || "/placeholder.svg?height=400&width=300"}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(getBookStatus(book))}
                </div>
              </div>

              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-[#fe0002] transition-colors duration-300">
                  {book.title}
                </h3>
                <p className="text-muted-foreground mb-3 font-medium">by {book.author}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary/10 text-primary border-0">
                    {book.genre}
                  </Badge>
                  {book.courses && (
                    <Badge className="border-primary/30 text-primary bg-transparent">
                      {book.courses.name}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground line-clamp-3 leading-relaxed mb-4 flex-1">{book.description}</p>
                <div className="mt-auto flex gap-3 pt-4">
                <Button
                  size="sm"
                  className="flex-1 bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href={`/book/${book.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="flex-1 morph-button bg-gradient-to-r from-[#fe0002] to-[#ff4444] hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 hover:scale-105 transition-all duration-300"
                  asChild
                >
                    <Link href={`/book/${book.id}`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read Book
                    </Link>
                </Button>
              </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-8">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-16">
            <div className="glassmorphism-card rounded-3xl p-12 max-w-md mx-auto">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Books Found</h3>
              <p className="text-muted-foreground mb-4">
                No books match your current search and filter criteria.
              </p>
              <Button 
                onClick={() => setShowRequestDialog(true)}
                className="bg-[#fe0002] hover:bg-[#fe0002]/90"
              >
                Request a Book
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Book Request Dialog */}
      <BookRequestDialog 
        open={showRequestDialog} 
        onOpenChange={setShowRequestDialog} 
        userId={user.id}
        onRequestSubmitted={handleRequestSubmitted}
      />
    </div>
  )
} 