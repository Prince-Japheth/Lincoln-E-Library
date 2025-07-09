import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BookDetailsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Book Details Section */}
          <div className="mb-8">
            <Card className="glassmorphism-card border-0 p-0">
              <CardContent className="flex flex-col md:flex-row gap-8 p-8">
                <div className="flex-shrink-0 w-48 h-64 rounded-2xl overflow-hidden">
                  <Skeleton className="w-full h-full rounded-2xl" />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  <Skeleton className="h-8 w-2/3 rounded" />
                  <Skeleton className="h-5 w-1/3 rounded" />
                  <div className="flex gap-2 mb-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full rounded mb-2" />
                  <Skeleton className="h-4 w-5/6 rounded mb-2" />
                  <Skeleton className="h-4 w-2/3 rounded mb-2" />
                  <div className="flex gap-3 mt-4">
                    <Skeleton className="h-10 w-32 rounded" />
                    <Skeleton className="h-10 w-32 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PDF Viewer Section Skeleton */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <Skeleton className="h-8 w-40 mb-6 rounded" />
            <div className="mb-4">
              <Skeleton className="h-10 w-48 rounded" />
            </div>
            <Skeleton className="w-full h-96 rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  )
} 