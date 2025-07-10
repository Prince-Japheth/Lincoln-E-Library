"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Eye, Search, Grid, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { EmptyBooksIllustration } from "@/components/empty-state-illustrations"

interface Book {
  id: string
  title: string
  author: string
  genre: string
  description: string
  cover_image_url: string
  file_url: string
  courses?: { name: string }
}

interface Course {
  id: string
  name: string
}

interface PublicBookGridProps {
  books: Book[]
  courses: Course[]
}

const BOOKS_PER_PAGE = 8

export default function 
PublicBookGrid({ books, courses }: PublicBookGridProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAll, setShowAll] = useState(false)

  const genres = ["all", ...Array.from(new Set(books.map((book) => book.genre)))]

  const filteredBooks = books.filter((book) => {
    const genreMatch = selectedGenre === "all" || book.genre === selectedGenre
    const courseMatch = selectedCourse === "all" || book.courses?.name === selectedCourse
    const searchMatch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase())

    return genreMatch && courseMatch && searchMatch
  })

  const displayedBooks = showAll ? filteredBooks : filteredBooks.slice(0, BOOKS_PER_PAGE)
  const hasMoreBooks = filteredBooks.length > BOOKS_PER_PAGE

  if (books.length === 0) {
    return (
      <div className="text-center py-20 animate-slide-up">
        <div className="glassmorphism-card rounded-3xl p-12 max-w-md mx-auto">
          <EmptyBooksIllustration />
          <h3 className="text-2xl font-bold text-foreground mb-4">No Public Books Available</h3>
          <p className="text-muted-foreground text-lg">Check back later for new additions to our public collection.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="glassmorphism-card border-0 mb-8 bg-card rounded-2xl p-6 animate-slide-up">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search books, authors, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-card text-card-foreground border border-border text-base"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="min-w-[200px]">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="h-12 bg-card text-card-foreground border border-border">
                  <SelectValue placeholder="Filter by genre" />
                </SelectTrigger>
                <SelectContent className="bg-card text-card-foreground border border-border">
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre === "all" ? "All Genres" : genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[200px]">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="h-12 bg-card text-card-foreground border border-border">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent className="bg-card text-card-foreground border border-border">
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Grid className="h-4 w-4" />
            <span>
              Showing {displayedBooks.length} of {filteredBooks.length} books
            </span>
          </div>

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
      <div className="bento-grid animate-slide-up delay-200">
        {displayedBooks.map((book, index) => (
          <Link
            href={`/book/${book.id}`}
            className="block group w-full sm:w-auto"
            tabIndex={-1}
            aria-label={`View details for ${book.title}`}
          >
            <Card
              key={book.id}
              className="w-full max-w-full sm:max-w-[400px] glassmorphism-card border-0 shadow-md overflow-hidden hover-lift group cursor-pointer flex flex-col h-full"
              style={{ animationDelay: `${index * 0.1}s` }}
              tabIndex={0}
              onClick={e => {
                // Prevent nested button click from triggering card navigation
                if (
                  (e.target as HTMLElement).closest("button, a") &&
                  (e.target as HTMLElement) !== e.currentTarget
                ) {
                  return
                }
                window.location.href = `/book/${book.id}`
              }}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  window.location.href = `/book/${book.id}`
                }
              }}
              role="link"
              aria-label={`View details for ${book.title}`}
            >
              <div className="aspect-square relative overflow-hidden rounded-t-2xl">
                <Image
                  src={book.cover_image_url || "/placeholder.svg?height=400&width=300"}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <CardContent className="p-6 flex-1 flex flex-col">
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
                {/* Book description removed as per instructions */}
              </CardContent>

              <CardFooter className="p-6 pt-0 flex gap-3 mt-auto">
                <Button
                  size="sm"
                  className="flex-1 bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all duration-300"
                  asChild
                  tabIndex={0}
                  onClick={e => e.stopPropagation()}
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
                  tabIndex={0}
                  onClick={e => e.stopPropagation()}
                >
                  <a href={book.file_url} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {/* View All Button */}
      {hasMoreBooks && !showAll && (
        <div className="text-center animate-slide-up delay-400">
          <Button
            onClick={() => setShowAll(true)}
            size="lg"
            className="morph-button bg-gradient-to-r from-[#fe0002] to-[#ff4444] hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 hover:scale-105 transition-all duration-300"
          >
            View All {filteredBooks.length} Books
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      )}

      {/* No Results */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-16 animate-slide-up">
          <div className="glassmorphism-card rounded-3xl p-12 max-w-md mx-auto">
            <EmptyBooksIllustration />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Books Found</h3>
            <p className="text-muted-foreground">
              No books match your current search and filter criteria. Try adjusting your filters.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
