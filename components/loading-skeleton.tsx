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
