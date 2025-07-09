"use client"

import React from "react"

interface PDFViewerProps {
  fileUrl: string
  bookId: string
  userId: string
  title: string
}

export default function PDFViewer({ fileUrl, title }: PDFViewerProps) {
  if (!fileUrl) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl glassmorphism-card rounded-lg shadow-lg p-8 flex flex-col items-center text-center">
          <div className="text-red-600 mb-4 text-lg font-semibold">No PDF file available for this book.</div>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl glassmorphism-card rounded-lg shadow-lg p-0 overflow-hidden">
      <iframe
          src={fileUrl}
          title={title}
          className="w-full h-[80vh] min-h-[500px] bg-white"
          style={{ border: "none" }}
          allowFullScreen
        />

      </div>
    </div>
  )
} 