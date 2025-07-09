import AnimatedLogo from "@/components/animated-logo"

export function BookGridSkeleton() {
  return (
    <div className="bento-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glassmorphism-card border-0 overflow-hidden hover-lift group flex flex-col h-full min-h-[420px] rounded-2xl">
          <div className="aspect-[2/3] relative overflow-hidden rounded-t-2xl skeleton" />
          <div className="p-6 flex flex-col flex-1">
            <div className="skeleton h-6 w-3/4 rounded mb-2" />
            <div className="skeleton h-4 w-1/2 rounded mb-3" />
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="skeleton h-6 w-16 rounded-full" />
              <div className="skeleton h-6 w-20 rounded-full" />
            </div>
            <div className="skeleton h-16 w-full rounded mb-4 flex-1" />
            <div className="mt-auto flex gap-3 pt-4">
            <div className="skeleton h-10 flex-1 rounded" />
            <div className="skeleton h-10 flex-1 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glassmorphism-card border-0 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-5 w-5 rounded" />
          </div>
          <div className="skeleton h-8 w-16 rounded mb-2" />
          <div className="skeleton h-3 w-32 rounded" />
        </div>
      ))}
    </div>
  )
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-4 animate-slide-up">
      <div className="skeleton h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    </div>
  )
}

export function BookDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="mb-6">
        <div className="inline-flex items-center text-[#fe0002]">
          <div className="skeleton h-4 w-24 rounded mr-2" />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div className="md:col-span-1">
          <div className="glassmorphism-card overflow-hidden">
            <div className="aspect-[3/4] relative skeleton" />
          </div>
        </div>
        {/* Book Information */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="skeleton h-10 w-2/3 rounded mb-2" />
            <div className="skeleton h-6 w-1/3 rounded mb-4" />
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="skeleton h-6 w-16 rounded-full" />
              <div className="skeleton h-6 w-20 rounded-full" />
              <div className="skeleton h-6 w-14 rounded-full" />
            </div>
            <div className="flex gap-4 mb-6">
              <div className="skeleton h-12 w-32 rounded" />
              <div className="skeleton h-12 w-32 rounded" />
            </div>
          </div>
          <div className="glassmorphism-card">
            <div className="p-6">
              <div className="skeleton h-6 w-40 rounded mb-4" />
              <div className="skeleton h-4 w-full rounded mb-2" />
              <div className="skeleton h-4 w-5/6 rounded mb-2" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
          </div>
          <div className="glassmorphism-card">
            <div className="p-6">
              <div className="skeleton h-6 w-40 rounded mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="skeleton h-4 w-20 rounded mb-1" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
                <div>
                  <div className="skeleton h-4 w-20 rounded mb-1" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
                <div>
                  <div className="skeleton h-4 w-20 rounded mb-1" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
                <div>
                  <div className="skeleton h-4 w-20 rounded mb-1" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PDFViewerSkeleton() {
  return (
    <div className="glassmorphism-card rounded-lg shadow-lg p-6 animate-pulse">
      <div className="h-8 w-40 skeleton rounded mb-6" />
      <div className="mb-4">
        <div className="h-10 w-32 skeleton rounded" />
      </div>
      <div className="w-full h-[500px] bg-muted-foreground/10 skeleton rounded-lg" />
    </div>
  )
}

export default function LoadingSkeleton() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90">
      <div className="flex flex-col items-center">
        <AnimatedLogo className="h-16 w-16 animate-spin-slow mb-6" />
        <div className="w-32 h-2 bg-gradient-to-r from-[#fe0002] via-[#ff4444] to-[#fe0002] rounded-full animate-pulse" />
      </div>
    </div>
  )
}

// Add this CSS to your global styles or tailwind config:
// .animate-spin-slow { animation: spin 2s linear infinite; }
// @keyframes spin { 100% { transform: rotate(360deg); } }
