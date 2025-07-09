import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function StudentDashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glassmorphism-card border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <Card className="glassmorphism-card border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Books Grid Skeleton */}
        <div className="bento-grid mb-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="glassmorphism-card border-0 shadow-md overflow-hidden hover-lift group flex flex-col h-full rounded-2xl min-w-[220px]"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="aspect-square relative overflow-hidden rounded-t-2xl">
                <Skeleton className="absolute inset-0 w-full h-full" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4 rounded mb-2" />
                <Skeleton className="h-4 w-1/2 rounded mb-3" />
                <Skeleton className="h-4 w-full rounded mb-2 flex-1" />
                <div className="mt-auto flex gap-3 pt-4">
                  <Skeleton className="h-10 flex-1 rounded" />
                  <Skeleton className="h-10 flex-1 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Book Requests Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-6 w-40 mb-4" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-white border-0 shadow-md rounded-lg p-4 mb-3 flex flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 