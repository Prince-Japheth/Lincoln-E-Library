"use client"

import React from "react"
import { createClient } from "@/lib/supabase/client"
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useTheme } from "next-themes"

// Set the workerSrc to the local file in public/
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  fileUrl: string
  bookId: string
  userId: string
  title: string
  pageNumber?: number
  setPageNumber?: (page: number) => void
}

export default function PDFViewer({ fileUrl, title, bookId, userId, pageNumber: controlledPageNumber, setPageNumber: setControlledPageNumber }: PDFViewerProps) {
  const [numPages, setNumPages] = React.useState<number>(0)
  const [internalPageNumber, setInternalPageNumber] = React.useState<number>(1)
  const pageNumber = controlledPageNumber !== undefined ? controlledPageNumber : internalPageNumber
  const setPageNumber = setControlledPageNumber || setInternalPageNumber
  const [pdfSource, setPdfSource] = React.useState<string | null>(null)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState<number>(0)
  const supabase = React.useRef(createClient())
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = React.useState<number>(0)
  const { resolvedTheme } = useTheme()
  const [sessionStartTime, setSessionStartTime] = React.useState<Date | null>(null)
  const [lastActivityTime, setLastActivityTime] = React.useState<Date>(new Date())

  React.useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  React.useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [containerRef.current])

  // Start reading session when component mounts
  React.useEffect(() => {
    if (userId && bookId) {
      const startTime = new Date()
      setSessionStartTime(startTime)
      setLastActivityTime(startTime)
      console.log('📚 PDF Viewer: Reading session started at:', startTime.toISOString())
    }
  }, [userId, bookId])

  // Track user activity
  React.useEffect(() => {
    const updateActivity = () => {
      setLastActivityTime(new Date())
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, updateActivity)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity)
      })
    }
  }, [])

  React.useEffect(() => {
    if (!fileUrl) {
      setPdfSource(null);
      setLoadError('No fileUrl provided.');
      return;
    }
    setLoadError(null);
    setPdfSource(fileUrl);
    // Try to fetch as Blob if direct URL fails
    return () => {
      if (pdfSource && pdfSource.startsWith('blob:')) {
        URL.revokeObjectURL(pdfSource);
      }
    };
  }, [fileUrl]);

  React.useEffect(() => {
    if (!userId || !bookId) return;
    
    // Calculate reading time
    const now = new Date()
    const sessionEndTime = lastActivityTime
    const readingTimeMinutes = sessionStartTime 
      ? Math.round((sessionEndTime.getTime() - sessionStartTime.getTime()) / (1000 * 60))
      : 0
    
    const progressData = {
      user_id: userId,
      book_id: bookId,
      current_page: pageNumber,
      total_pages: numPages,
      progress_percentage: numPages > 0 ? Math.round((pageNumber / numPages) * 100) : 0,
      reading_time_minutes: readingTimeMinutes,
      session_start_time: sessionStartTime?.toISOString(),
      session_end_time: sessionEndTime.toISOString(),
      last_read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log('📚 PDF Viewer: Updating reading progress:', {
      userId,
      bookId,
      pageNumber,
      numPages,
      progressPercentage: progressData.progress_percentage,
      readingTimeMinutes: progressData.reading_time_minutes,
      sessionStart: progressData.session_start_time,
      sessionEnd: progressData.session_end_time,
      timestamp: progressData.last_read_at
    });
    
    // Upsert progress on page change
    supabase.current.from('reading_progress').upsert(progressData, {
      onConflict: 'user_id,book_id'
    })
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ PDF Viewer: Failed to update reading progress:', error);
        } else {
          console.log('✅ PDF Viewer: Successfully saved reading progress to database:', {
            data,
            readingTimeMinutes,
            progressPercentage: progressData.progress_percentage
          });
        }
      });
  }, [userId, bookId, pageNumber, numPages, sessionStartTime, lastActivityTime]);

  function onDocumentLoadSuccess({ numPages: nextNumPages }: { numPages: number }) {
    setNumPages(nextNumPages)
    setLoadError(null)
  }

  function onDocumentError(error: any) {
    console.error('react-pdf error:', error)
    setLoadError('Failed to load PDF. Possible reasons: file is missing, URL is invalid, CORS error, or file is not a valid PDF.\nfileUrl: ' + fileUrl)
  }

  if (!fileUrl) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full glassmorphism-card rounded-lg shadow-lg p-8 flex flex-col items-center text-center">
          <div className="text-red-600 mb-4 text-lg font-semibold">No PDF file available for this book.</div>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className={`w-full glassmorphism-card rounded-lg pt-5 overflow-x-auto flex flex-col items-center border ${resolvedTheme === 'light' ? 'border-gray-200' : 'border-gray-700'} shadow-none`}
      >
        {/* <div className="w-full text-xs text-gray-400 px-4 pt-2 pb-1">PDF URL: {fileUrl}</div> */}
        <div className="flex justify-center w-full overflow-y-auto">
          <Document
            file={pdfSource}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentError}
            loading={<div className="p-8 text-center flex flex-col items-center justify-center gap-4">
              <AnimatedBookLoader />
              <span className="mt-2">Loading PDF...</span>
              <ProgressBar progress={progress} />
            </div>}
            error={<div className="p-8 text-center text-red-600">{loadError || 'Failed to load PDF.'}</div>}
            onLoadProgress={({ loaded, total }) => setProgress(Math.round((loaded / total) * 100))}
          >
            {containerWidth > 0 && (
              <Page
                pageNumber={pageNumber}
                width={containerWidth - 32}
                renderTextLayer={true}
                renderAnnotationLayer={false}
              />
            )}
          </Document>
        </div>
        <div className="flex items-center justify-center gap-4 py-4 flex-shrink-0">
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            className={`px-3 py-1 rounded-lg border font-semibold transition-colors duration-150
              ${resolvedTheme === 'light' ?
                'border-[#fe0002] text-[#fe0002] bg-white hover:bg-[#fe0002] hover:text-white' :
                'border-[#fe0002] text-[#fe0002] bg-transparent hover:bg-[#fe0002] hover:text-white'}
              disabled:opacity-50`}
          >
            Previous
          </button>
          <span className="text-sm">
            Page {pageNumber} of {numPages || '?'}
          </span>
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            className={`px-3 py-1 rounded-lg border font-semibold transition-colors duration-150
              ${resolvedTheme === 'light' ?
                'border-[#fe0002] text-[#fe0002] bg-white hover:bg-[#fe0002] hover:text-white' :
                'border-[#fe0002] text-[#fe0002] bg-transparent hover:bg-[#fe0002] hover:text-white'}
              disabled:opacity-50`}
          >
            Next
          </button>
        </div>
        {loadError && (
          <div className="text-xs text-red-500 mt-2 whitespace-pre-wrap px-4 pb-4">{loadError}</div>
        )}
      </div>
    </div>
  )
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
      <div
        className="bg-[#fe0002] h-2 rounded-full transition-all duration-200"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  )
}

function AnimatedBookLoader() {
  return (
    <div className="relative w-16 h-16">
      {/* Book spine */}
      <div className="absolute left-1/2 top-0 w-1 h-full bg-gradient-to-b from-[#fe0002] to-[#cc0002] transform -translate-x-1/2 animate-pulse" />
      
      {/* Left book cover */}
      <div className="absolute left-0 top-0 w-6 h-12 bg-gradient-to-br from-[#fe0002] to-[#cc0002] rounded-l-lg shadow-lg transform origin-left animate-bounce">
        <div className="absolute inset-1 bg-white/20 rounded-l-sm" />
        <div className="absolute top-2 left-2 w-2 h-0.5 bg-white/40 rounded" />
        <div className="absolute top-4 left-2 w-1.5 h-0.5 bg-white/30 rounded" />
      </div>
      
      {/* Right book cover */}
      <div className="absolute right-0 top-0 w-6 h-12 bg-gradient-to-br from-white to-gray-100 border border-[#fe0002] rounded-r-lg shadow-lg transform origin-right animate-bounce" style={{ animationDelay: '0.1s' }}>
        <div className="absolute inset-1 bg-[#fe0002]/10 rounded-r-sm" />
        <div className="absolute top-2 right-2 w-2 h-0.5 bg-[#fe0002]/60 rounded" />
        <div className="absolute top-4 right-2 w-1.5 h-0.5 bg-[#fe0002]/40 rounded" />
        <div className="absolute top-6 right-2 w-1 h-0.5 bg-[#fe0002]/30 rounded" />
      </div>
      
      {/* Pages */}
      <div className="absolute left-1/2 top-0 w-5 h-12 bg-gradient-to-b from-white to-gray-50 transform -translate-x-1/2 rounded-sm shadow-sm animate-pulse" style={{ animationDelay: '0.2s' }}>
        <div className="absolute top-1 left-1 right-1 h-0.5 bg-gray-200 rounded" />
        <div className="absolute top-3 left-1 right-1 h-0.5 bg-gray-200 rounded" />
        <div className="absolute top-5 left-1 right-1 h-0.5 bg-gray-200 rounded" />
        <div className="absolute top-7 left-1 right-1 h-0.5 bg-gray-200 rounded" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute top-0 left-1/2 w-1 h-1 bg-[#fe0002] rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-2 left-1/3 w-0.5 h-0.5 bg-[#fe0002] rounded-full animate-ping" style={{ animationDelay: '0.7s' }} />
      <div className="absolute top-4 right-1/3 w-0.5 h-0.5 bg-[#fe0002] rounded-full animate-ping" style={{ animationDelay: '0.9s' }} />
    </div>
  )
}

<style jsx global>{`
  .loader {
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
    display: inline-block;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`}</style> 