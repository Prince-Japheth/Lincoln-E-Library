"use client"

export default function AnimatedLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <img
        src="/logo.png"
        alt="Lincoln E-Library Logo"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  )
}
