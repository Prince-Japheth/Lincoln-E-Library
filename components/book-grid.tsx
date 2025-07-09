"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Download, Eye, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import BookRequestDialog from "@/components/book-request-dialog"

interface Book {
  id: string
  title: string
  author: string
  genre: string
  description: string
  cover_image_url: string
  file_url: string
  is_public: boolean
  courses?: { name: string }
}

interface Course {
  id: string
  name: string
}

interface BookGridProps {
  books: Book[]
  courses: Course[]
  userRole: string
  userId: string
}

export default function BookGrid({ books, courses, userRole, userId }: BookGridProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showRequestDialog, setShowRequestDialog] = useState(false)

  const genres = ["all", ...Array.from(new Set(books.map((book) => book.genre)))]

  // Memoize filteredBooks for performance
  const filteredBooks = useMemo(() => books.filter((book) => {
    const genreMatch = selectedGenre === "all" || book.genre === selectedGenre
    const courseMatch = selectedCourse === "all" || book.courses?.name === selectedCourse
    const searchMatch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase())
    return genreMatch && courseMatch && searchMatch
  }), [books, selectedGenre, selectedCourse, searchQuery])

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Books Available</h3>
        <p className="text-gray-500">Check back later for new additions to the library.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search books, authors, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 glassmorphism-card border-0 text-base"
          />
        </div>

        {/* Filters and Request Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* On mobile, filters can be made collapsible for better UX */}
          {/* TODO: Consider using a Disclosure/Accordion for filters on mobile for even better UX */}
          <div className="flex-1">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="glassmorphism-card border-0">
                <SelectValue placeholder="Filter by genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre === "all" ? "All Genres" : genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="glassmorphism-card border-0">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.name}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Book Request Button - Prominently displayed for students */}
          {userRole === "student" && (
            <Button
              onClick={() => setShowRequestDialog(true)}
              className="bg-[#fe0002] hover:bg-[#fe0002]/90 px-6 py-3 h-auto font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" />
              Request New Book
            </Button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredBooks.length} of {books.length} books
          </span>
          {(searchQuery || selectedGenre !== "all" || selectedCourse !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setSelectedGenre("all")
                setSelectedCourse("all")
              }}
              className="text-[#fe0002] hover:text-[#fe0002]/80"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Books Grid */}
      {/* TODO: For very large book lists, consider using react-window or react-virtualized for virtualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow glassmorphism-card border-0">
            <div className="aspect-[3/4] relative">
              <Image
                src={book.cover_image_url || "/placeholder.svg?height=400&width=300"}
                alt={book.title}
                fill
                className="object-cover"
              />
              {!book.is_public && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-[#fe0002] text-white">Private</Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {book.genre}
                </Badge>
                {book.courses && (
                  <Badge variant="outline" className="text-xs border-[#fe0002] text-[#fe0002]">
                    {book.courses.name}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3">{book.description}</p>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-[#fe0002] text-[#fe0002] hover:bg-[#fe0002] hover:text-white bg-transparent"
                asChild
              >
                <Link href={`/book/${book.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </Button>

              <Button size="sm" className="flex-1 bg-[#fe0002] hover:bg-[#fe0002]/90" asChild>
                <a href={book.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Read
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Books Found</h3>
          <p className="text-gray-500">
            {searchQuery || selectedGenre !== "all" || selectedCourse !== "all"
              ? "Try adjusting your search or filters to see more books."
              : "No books are available at the moment."}
          </p>
          {userRole === "student" && (
            <Button onClick={() => setShowRequestDialog(true)} className="mt-4 bg-[#fe0002] hover:bg-[#fe0002]/90">
              <Plus className="h-4 w-4 mr-2" />
              Request a Book
            </Button>
          )}
        </div>
      )}

      {/* Book Request Dialog - Only show for students */}
      {userRole === "student" && (
        <BookRequestDialog open={showRequestDialog} onOpenChange={setShowRequestDialog} userId={userId} />
      )}
    </div>
  )
}
