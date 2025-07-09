"use client"

import { useState, useEffect, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download,
  BookOpen,
  Bookmark
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFViewerProps {
  fileUrl: string
  bookId: string
  userId: string
  title: string
}

export default function PDFViewer({ fileUrl, bookId, userId, title }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [readingProgress, setReadingProgress] = useState<number>(0)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadReadingProgress()
    loadBookmarks()
    setError("")
    setLoading(true)
    // Timeout will be started when PDF fetch begins
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [bookId, userId, fileUrl])

  const loadReadingProgress = async () => {
    try {
      const { data } = await supabase
        .from("reading_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("book_id", bookId)
        .single()

      if (data) {
        setPageNumber(data.current_page || 1)
        setReadingProgress(data.progress_percentage || 0)
      }
    } catch (error) {
      console.error("Error loading reading progress:", error)
    }
  }

  const loadBookmarks = async () => {
    try {
      const { data } = await supabase
        .from("bookmarks")
        .select("page_number")
        .eq("user_id", userId)
        .eq("book_id", bookId)
        .order("page_number")

      if (data) {
        setBookmarks(data.map(b => b.page_number))
      }
    } catch (error) {
      console.error("Error loading bookmarks:", error)
    }
  }

  const saveReadingProgress = async (page: number) => {
    try {
      const progressPercentage = numPages > 0 ? (page / numPages) * 100 : 0

      const { error } = await supabase
        .from("reading_progress")
        .upsert({
          user_id: userId,
          book_id: bookId,
          current_page: page,
          total_pages: numPages,
          progress_percentage: progressPercentage,
          last_read_at: new Date().toISOString()
        })

      if (error) {
        console.error("Error saving reading progress:", error)
      }
    } catch (error) {
      console.error("Error saving reading progress:", error)
    }
  }

  const toggleBookmark = async (page: number) => {
    try {
      const isBookmarked = bookmarks.includes(page)
      
      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("book_id", bookId)
          .eq("page_number", page)
        
        setBookmarks(bookmarks.filter(b => b !== page))
      } else {
        // Add bookmark
        await supabase
          .from("bookmarks")
          .insert({
            user_id: userId,
            book_id: bookId,
            page_number: page
          })
        
        setBookmarks([...bookmarks, page].sort((a, b) => a - b))
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
    }
  }

  // Start timeout when PDF fetch begins
  const onLoadStart = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setError("PDF took too long to load. Please try again or download the file.")
      setLoading(false)
    }, 45000)
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    setError("")
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const onDocumentLoadError = (err: Error) => {
    setError("Failed to load PDF: " + (err?.message || "Unknown error"))
    setLoading(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    console.error("PDF load error:", err)
  }

  const changePage = (offset: number) => {
    const newPage = pageNumber + offset
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage)
      saveReadingProgress(newPage)
    }
  }

  const changeScale = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(2.0, scale + delta))
    setScale(newScale)
  }

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const jumpToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page)
      saveReadingProgress(page)
    }
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl glassmorphism-card rounded-lg shadow-lg p-8 flex flex-col items-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 bg-white border-2 border-gray-300 rounded-lg shadow-lg animate-pulse"></div>
            <div className="absolute top-2 left-2 right-2 space-y-1">
              <div className="h-1 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-1 bg-gray-300 rounded w-3/4 animate-pulse"></div>
              <div className="h-1 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              <div className="w-2 h-2 bg-[#fe0002] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#fe0002] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-[#fe0002] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          <div className="text-muted-foreground text-base mb-2">Loading PDF...</div>
          <div className="w-full h-2 bg-gradient-to-r from-[#fe0002] via-[#ff4444] to-[#fe0002] rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl glassmorphism-card rounded-lg shadow-lg p-8 flex flex-col items-center text-center">
          <div className="text-red-600 mb-4 text-lg font-semibold">{error}</div>
          <Button variant="outline" onClick={() => window.location.reload()} className="mb-2">Retry</Button>
          <a href={fileUrl} download className="text-blue-600 underline">Download PDF</a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBookmarks(!showBookmarks)}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmarks ({bookmarks.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Navigation Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(-1)}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm">
                Page {pageNumber} of {numPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(1)}
                disabled={pageNumber >= numPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeScale(-0.1)}
                disabled={scale <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-sm min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeScale(0.1)}
                disabled={scale >= 2.0}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={rotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${readingProgress}%` }}
            ></div>
          </div>

          {/* Page Input */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Go to page:</span>
            <Input
              type="number"
              min={1}
              max={numPages}
              value={pageNumber}
              onChange={(e) => jumpToPage(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <span className="text-sm text-gray-500">of {numPages}</span>
          </div>
        </CardContent>
      </Card>

      {/* Bookmarks Panel */}
      {showBookmarks && (
        <Card>
          <CardHeader>
            <CardTitle>Bookmarks</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarks.length === 0 ? (
              <p className="text-gray-500">No bookmarks yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {bookmarks.map((page) => (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    onClick={() => jumpToPage(page)}
                  >
                    Page {page}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PDF Viewer */}
      <div className="flex justify-center">
        <div className="border rounded-lg overflow-hidden shadow-lg">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            onSourceSuccess={onLoadStart}
            onSourceError={onDocumentLoadError}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>

      {/* Page Controls */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => toggleBookmark(pageNumber)}
          className={bookmarks.includes(pageNumber) ? "bg-blue-100" : ""}
        >
          <Bookmark className="h-4 w-4 mr-2" />
          {bookmarks.includes(pageNumber) ? "Remove Bookmark" : "Add Bookmark"}
        </Button>
      </div>
    </div>
  )
} 