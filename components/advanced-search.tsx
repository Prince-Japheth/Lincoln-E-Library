"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, BookOpen, User, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SearchFilters {
  query: string
  genre: string
  course: string
  author: string
  isPublic: boolean | null
  sortBy: string
  sortOrder: string
}

interface Book {
  id: string
  title: string
  author: string
  genre: string
  description: string
  cover_image_url: string
  is_public: boolean
  created_at: string
  courses?: { name: string }
}

interface AdvancedSearchProps {
  onResultsChange: (books: Book[]) => void
  onLoadingChange: (loading: boolean) => void
}

export default function AdvancedSearch({ onResultsChange, onLoadingChange }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    genre: "",
    course: "",
    author: "",
    isPublic: null,
    sortBy: "title",
    sortOrder: "asc"
  })
  
  const [genres, setGenres] = useState<string[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Book[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    loadGenres()
    loadCourses()
  }, [])

  useEffect(() => {
    if (filters.query || filters.genre || filters.course || filters.author || filters.isPublic !== null) {
      performSearch()
    }
  }, [filters])

  const loadGenres = async () => {
    try {
      const { data } = await supabase
        .from("books")
        .select("genre")
        .not("genre", "is", null)
        .not("genre", "eq", "")

      if (data) {
        const uniqueGenres = [...new Set(data.map(book => book.genre))].sort()
        setGenres(uniqueGenres)
      }
    } catch (error) {
      console.error("Error loading genres:", error)
    }
  }

  const loadCourses = async () => {
    try {
      const { data } = await supabase
        .from("courses")
        .select("id, name")
        .order("name")

      if (data) {
        setCourses(data)
      }
    } catch (error) {
      console.error("Error loading courses:", error)
    }
  }

  const performSearch = async () => {
    setLoading(true)
    onLoadingChange(true)

    try {
      let query = supabase
        .from("books")
        .select(`
          *,
          courses(name)
        `)

      // Apply filters
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,author.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
      }

      if (filters.genre) {
        query = query.eq("genre", filters.genre)
      }

      if (filters.course) {
        query = query.eq("course_id", filters.course)
      }

      if (filters.author) {
        query = query.ilike("author", `%${filters.author}%`)
      }

      if (filters.isPublic !== null) {
        query = query.eq("is_public", filters.isPublic)
      }

      // Apply sorting
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === "asc" })

      const { data, error } = await query

      if (error) {
        console.error("Search error:", error)
        setResults([])
      } else {
        setResults(data || [])
        onResultsChange(data || [])
      }
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
      onResultsChange([])
    } finally {
      setLoading(false)
      onLoadingChange(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      genre: "",
      course: "",
      author: "",
      isPublic: null,
      sortBy: "title",
      sortOrder: "asc"
    })
  }

  const hasActiveFilters = () => {
    return filters.genre || filters.course || filters.author || filters.isPublic !== null
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search books by title, author, or description..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters() && (
            <Badge variant="secondary" className="ml-1">
              {[
                filters.genre && 1,
                filters.course && 1,
                filters.author && 1,
                filters.isPublic !== null && 1
              ].filter(Boolean).length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          {filters.genre && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Genre: {filters.genre}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters({ ...filters, genre: "" })}
              />
            </Badge>
          )}
          {filters.course && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Course: {courses.find(c => c.id === filters.course)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters({ ...filters, course: "" })}
              />
            </Badge>
          )}
          {filters.author && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Author: {filters.author}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters({ ...filters, author: "" })}
              />
            </Badge>
          )}
          {filters.isPublic !== null && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.isPublic ? "Public" : "Private"}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters({ ...filters, isPublic: null })}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Genre Filter */}
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select value={filters.genre} onValueChange={(value) => setFilters({ ...filters, genre: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All genres</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course Filter */}
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select value={filters.course} onValueChange={(value) => setFilters({ ...filters, course: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Author Filter */}
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  placeholder="Filter by author"
                  value={filters.author}
                  onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                />
              </div>

              {/* Public/Private Filter */}
              <div className="space-y-2">
                <Label>Availability</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public-only"
                      checked={filters.isPublic === true}
                      onCheckedChange={(checked) => 
                        setFilters({ ...filters, isPublic: checked ? true : null })
                      }
                    />
                    <Label htmlFor="public-only">Public only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="private-only"
                      checked={filters.isPublic === false}
                      onCheckedChange={(checked) => 
                        setFilters({ ...filters, isPublic: checked ? false : null })
                      }
                    />
                    <Label htmlFor="private-only">Private only</Label>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <Label htmlFor="sortBy">Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="genre">Genre</SelectItem>
                    <SelectItem value="created_at">Date Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Select value={filters.sortOrder} onValueChange={(value) => setFilters({ ...filters, sortOrder: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {!loading && results.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Found {results.length} book{results.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {results.filter(b => b.is_public).length} public
            </span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {results.filter(b => !b.is_public).length} private
            </span>
          </div>
        </div>
      )}

      {!loading && results.length === 0 && filters.query && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No books found matching your search criteria.</p>
          <p className="text-sm">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  )
} 