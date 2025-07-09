"use client"

export default function AnimatedLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Book Pages */}
        <rect x="20" y="25" width="60" height="50" rx="3" fill="#fe0002" className="animate-scale-pulse" />
        <rect x="25" y="30" width="50" height="40" rx="2" fill="white" className="animate-scale-pulse delay-200" />

        {/* Book Lines */}
        <line
          x1="30"
          y1="40"
          x2="65"
          y2="40"
          stroke="#fe0002"
          strokeWidth="2"
          className="animate-scale-pulse delay-300"
        />
        <line
          x1="30"
          y1="45"
          x2="60"
          y2="45"
          stroke="#ff4444"
          strokeWidth="2"
          className="animate-scale-pulse delay-400"
        />
        <line
          x1="30"
          y1="50"
          x2="55"
          y2="50"
          stroke="#ff6b6b"
          strokeWidth="2"
          className="animate-scale-pulse delay-500"
        />

        {/* Floating Knowledge Dots */}
        <circle cx="15" cy="20" r="3" fill="#fe0002" className="animate-bounce-gentle" />
        <circle cx="85" cy="30" r="2" fill="#ff4444" className="animate-bounce-gentle delay-500" />
        <circle cx="10" cy="60" r="2" fill="#ff6b6b" className="animate-bounce-gentle delay-1000" />
        <circle cx="90" cy="70" r="3" fill="#ffa8a8" className="animate-bounce-gentle delay-1500" />

        {/* Digital Glow Effect */}
        <rect
          x="20"
          y="25"
          width="60"
          height="50"
          rx="3"
          fill="none"
          stroke="#fe0002"
          strokeWidth="1"
          opacity="0.5"
          className="animate-pulse"
        />
      </svg>
    </div>
  )
}
