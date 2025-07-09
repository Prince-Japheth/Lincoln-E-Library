"use client"

// This file is now a dynamic import wrapper for SSR safety
import dynamic from 'next/dynamic'
const PDFViewerClient = dynamic(() => import('./pdf-viewer-client'), { ssr: false })
export default PDFViewerClient; 