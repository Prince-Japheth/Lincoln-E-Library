"use client"

export default function AnimatedLogo({ className = "h-8 w-8", responsive = false }: { className?: string, responsive?: boolean }) {
  if (responsive) {
    return (
      <div className={`relative ${className}`}>
        {/* Mobile: logo.png */}
        <img
          src="/logo.png"
          alt="Lincoln E-Library Logo"
          className="w-full h-full object-contain block md:hidden"
          draggable={false}
        />
        {/* md and up: favicon.png */}
        <img
          src="/favicon.png"
          alt="Lincoln E-Library Favicon"
          className="w-full h-full object-contain hidden md:block"
          draggable={false}
        />
      </div>
    )
  }
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
