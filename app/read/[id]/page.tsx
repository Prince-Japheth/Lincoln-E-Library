"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import PDFViewer from "@/components/pdf-viewer-client"
import { Skeleton } from "@/components/ui/skeleton"
import { Maximize2, Minimize2, Menu, X, PanelLeft } from "lucide-react"
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useTheme } from "next-themes"
import React from "react"

export default function ReadBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [book, setBook] = useState<any | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [sidebarActivePage, setSidebarActivePage] = useState<number>(1)
  const pdfViewerRef = useRef<any>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      console.log('📖 Read Page: Loading book data for ID:', id)

      const { data: userData } = await supabase.auth.getUser()
      setUser(userData.user)
      console.log('📖 Read Page: User loaded:', userData.user?.id)

      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single()

      if (bookError || !bookData) {
        console.error('❌ Read Page: Book not found:', bookError)
        setError("Book not found.")
        setLoading(false)
        return
      }

      console.log('✅ Read Page: Book loaded:', {
        title: bookData.title,
        author: bookData.author,
        fileUrl: bookData.file_url,
        isPublic: bookData.is_public
      })
      setBook(bookData)
      setLoading(false)
    }
    fetchData()
  }, [id])

  // Fullscreen logic
  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (viewerRef.current) {
        if (viewerRef.current.requestFullscreen) viewerRef.current.requestFullscreen()
        else if ((viewerRef.current as any).webkitRequestFullscreen) (viewerRef.current as any).webkitRequestFullscreen()
        else if ((viewerRef.current as any).msRequestFullscreen) (viewerRef.current as any).msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) document.exitFullscreen()
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen()
      else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen()
    }
  }

  useEffect(() => {
    const onFull = () => {
      setIsFullscreen(!!document.fullscreenElement)
      // Force a resize event after exiting fullscreen to trigger responsive recalculation
      if (!document.fullscreenElement) {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'))
          // Reload the page on fullscreen exit for @/read
          window.location.reload()
        }, 100)
      }
    }
    document.addEventListener('fullscreenchange', onFull)
    return () => document.removeEventListener('fullscreenchange', onFull)
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar')
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarOpen])

  // Generate thumbnails for sidebar
  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    console.log('📖 Read Page: PDF loaded with', nextNumPages, 'pages for book:', book?.title)
    setNumPages(nextNumPages)
  }

  // Scroll to top when page changes
  useEffect(() => {
    console.log('📖 Read Page: Page changed to', pageNumber, 'of', numPages, 'for book:', book?.title)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pageNumber, numPages, book?.title])

  // Swipe gesture for fullscreen PDF navigation
  useEffect(() => {
    if (!isFullscreen) return;
    let touchStartX = 0;
    let touchEndX = 0;
    function handleTouchStart(e: TouchEvent) {
      touchStartX = e.changedTouches[0].screenX;
    }
    function handleTouchEnd(e: TouchEvent) {
      touchEndX = e.changedTouches[0].screenX;
      const dx = touchEndX - touchStartX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) setPageNumber(p => Math.min(numPages, p + 1)); // swipe left: next page
        else setPageNumber(p => Math.max(1, p - 1)); // swipe right: prev page
      }
    }
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.addEventListener('touchstart', handleTouchStart);
      viewer.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      if (viewer) {
        viewer.removeEventListener('touchstart', handleTouchStart);
        viewer.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isFullscreen, numPages]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-red-600 text-lg font-semibold">{error}</div>
      </div>
    )
  }
  // Only require login if the book is private
  if (book && !book.is_public && !user) {
    router.replace("/auth/login")
    return null
  }

  return (
    <div
      ref={viewerRef}
      className={`min-h-screen bg-background flex flex-row relative ${isFullscreen ? 'pt-0 overflow-auto' : 'pt-20'}`}
      style={isFullscreen ? { height: '100vh', maxHeight: '100vh', WebkitOverflowScrolling: 'touch' } : {}}
    >

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar with thumbnails */}
      <div
        id="sidebar"
        className={`
          fixed top-0 left-0 h-screen w-64 glassmorphism-card border-r transition-transform duration-300 ease-in-out
          flex flex-col items-center py-4 gap-3 pt-20 overflow-y-auto backdrop-blur-sm
          ${resolvedTheme === 'light' ? 'border-gray-200' : 'border-gray-700'}
          ${sidebarOpen ? 'translate-x-0 z-30' : '-translate-x-full z-30'}
          lg:translate-x-0 lg:z-20
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden"
        >
          <X size={20} />
        </button>

        <Document
          file={book.file_url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Skeleton className="w-44 h-64 mb-3 rounded-xl" />}
        >
          {Array.from({ length: numPages }, (_, i) => (
            <div
              key={i}
              className={`mb-3 cursor-pointer p-2 rounded-xl border-2 transition-all duration-200 ${sidebarActivePage === i + 1 ? 'border-[#fe0002]' : 'border-transparent'
                }`}
              onClick={() => {
                setPageNumber(i + 1)
                setSidebarActivePage(i + 1)
                if (pdfViewerRef.current && pdfViewerRef.current.scrollToPage) {
                  pdfViewerRef.current.scrollToPage(i + 1)
                }
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false)
                }
              }}
            >
              <Page
                pageNumber={i + 1}
                width={176}
                height={248}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
              <div className="text-xs text-center py-1">{i + 1}</div>
            </div>
          ))}
        </Document>
      </div>

      {/* Main PDF Viewer */}
      <div className="flex-1 flex flex-col items-center justify-start min-h-screen bg-background relative lg:ml-64 pt-16 lg:pt-0">

        {/* Pc header */}
        <div
          className={`
             fixed top-20 z-20 mx-4 my-2 flex items-center
            lg:bg-transparent bg-background lg:right-0
            hidden md:hidden lg:flex
          `}
        >
          {/* Sidebar toggle button (mobile only) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-[#fe0002] text-white p-2 rounded-lg shadow hover:bg-[#ff4444] transition-all duration-200 lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <PanelLeft size={20} />}
          </button>
          {/* Spacer to push fullscreen button to far right on desktop */}
          <div className="flex-1" />
          {/* Full screen button */}
          <button
            onClick={handleFullscreen}
            className="bg-[#fe0002] text-white px-3 py-2 rounded-lg shadow hover:bg-[#ff4444] transition-all duration-200"
          >
            {isFullscreen ? <Minimize2 className="inline mr-2" /> : <Maximize2 className="inline mr-2" />}
            {isFullscreen ? "Exit Full Screen" : "Full Screen"}
          </button>
        </div>

        {/* Medium and Mobile header */}
        <div
          className={`
            w-full fixed top-0 z-20 px-4 py-2 flex items-center
            lg:bg-transparent glassmorphism-card lg:right-0
            lg:hidden
            ${isFullscreen ? '' : 'pt-20'}
          `}
        >
          {/* Sidebar toggle button (mobile only) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-[#fe0002] text-white p-2 rounded-lg shadow hover:bg-[#ff4444] transition-all duration-200 lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <PanelLeft size={20} />}
          </button>
          {/* Spacer to push fullscreen button to far right on desktop */}
          <div className="flex-1" />
          {/* Full screen button */}
          <button
            onClick={handleFullscreen}
            className="bg-[#fe0002] text-white px-3 py-2 rounded-lg shadow hover:bg-[#ff4444] transition-all duration-200"
          >
            {isFullscreen ? <Minimize2 className="inline mr-2" /> : <Maximize2 className="inline mr-2" />}
            {isFullscreen ? "Exit Full Screen" : "Full Screen"}
          </button>
        </div>

        <div className="w-full max-w-4xl mx-auto flex flex-col lg:bg-transparent bg-glassmorphism-card rounded-lg p-4 lg:p-0">
          <PDFViewer
            ref={pdfViewerRef}
            fileUrl={book.file_url}
            bookId={book.id}
            userId={user.id}
            title={book.title}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            onVisiblePageChange={setSidebarActivePage}
          />
        </div>
      </div>
    </div>
  )
}