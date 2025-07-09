import { BookDetailsSkeleton, PDFViewerSkeleton } from "@/components/loading-skeleton"

export default function BookDetailsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BookDetailsSkeleton />
          <div className="mt-8">
            <PDFViewerSkeleton />
          </div>
        </div>
      </main>
    </div>
  )
} 