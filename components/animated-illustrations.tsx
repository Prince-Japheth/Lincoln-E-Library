import React from "react"

// AnimatedBook: Book with flipping pages
export function AnimatedBook({ className = "h-8 w-8 mx-auto mb-2" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="48" height="40" rx="6" fill="#fe0002" fillOpacity="0.08" />
      <rect x="14" y="18" width="20" height="28" rx="2" fill="#fe0002" fillOpacity="0.18" />
      <rect x="30" y="18" width="20" height="28" rx="2" fill="#fe0002" fillOpacity="0.28" />
      <rect x="18" y="22" width="12" height="20" rx="1" fill="#fe0002" />
      <rect x="34" y="22" width="12" height="20" rx="1" fill="#fe0002" />
      <g>
        <rect id="page" x="25" y="22" width="6" height="20" rx="1" fill="#fff" fillOpacity="0.7">
          <animate attributeName="x" values="25;33;25" dur="1.2s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  )
}

// AnimatedFilter: Funnel with animated flow
export function AnimatedFilter({ className = "h-8 w-8 mx-auto mb-2" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,16 52,16 38,36 38,52 26,52 26,36" fill="#fe0002" fillOpacity="0.12" />
      <polygon points="18,20 46,20 36,34 36,48 28,48 28,34" fill="#fe0002" fillOpacity="0.28" />
      <rect x="30" y="48" width="4" height="8" rx="2" fill="#fe0002" />
      <circle id="drop" cx="32" cy="44" r="2" fill="#fe0002">
        <animate attributeName="cy" values="44;54;44" dur="1.1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

// AnimatedBrain: Brain with pulsing neural lines
export function AnimatedBrain({ className = "h-8 w-8 mx-auto mb-2" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="32" rx="20" ry="14" fill="#ff6b6b" fillOpacity="0.12" />
      <ellipse cx="32" cy="32" rx="14" ry="10" fill="#ff6b6b" fillOpacity="0.28" />
      <ellipse cx="32" cy="32" rx="8" ry="6" fill="#ff6b6b" />
      <path d="M24 32 Q28 24 32 32 Q36 40 40 32" stroke="#fff" strokeWidth="2" fill="none">
        <animate attributeName="d" values="M24 32 Q28 24 32 32 Q36 40 40 32;M24 32 Q28 40 32 32 Q36 24 40 32;M24 32 Q28 24 32 32 Q36 40 40 32" dur="1.3s" repeatCount="indefinite" />
      </path>
      <g>
        <animateTransform attributeName="transform" type="scale" values="1;1.08;1" dur="1.2s" repeatCount="indefinite" />
      </g>
    </svg>
  )
}

// AnimatedLock: Lock with animated shackle
export function AnimatedLock({ className = "h-8 w-8 mx-auto mb-2" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="28" width="32" height="24" rx="6" fill="#fe0002" fillOpacity="0.18" />
      <rect x="24" y="36" width="16" height="8" rx="2" fill="#fe0002" />
      <path d="M24 28 v-6 a8 8 0 0 1 16 0 v6" stroke="#fe0002" strokeWidth="3" fill="none">
        <animate attributeName="d" values="M24 28 v-6 a8 8 0 0 1 16 0 v6;M24 28 v-10 a8 8 0 0 1 16 0 v10;M24 28 v-6 a8 8 0 0 1 16 0 v6" dur="1.2s" repeatCount="indefinite" />
      </path>
      <circle cx="32" cy="44" r="2" fill="#fff" />
    </svg>
  )
}

// AnimatedCap: Graduation cap with swinging tassel
export function AnimatedCap({ className = "h-8 w-8 mx-auto mb-2" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cap base */}
      <rect x="16" y="32" width="32" height="8" rx="2" fill="#222" />
      {/* Cap top */}
      <polygon points="32,16 8,28 32,40 56,28" fill="#444" />
      {/* Tassel string */}
      <line x1="32" y1="16" x2="32" y2="28" stroke="#ffb300" strokeWidth="2" >
        <animate attributeName="x2" values="32;38;32" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="y2" values="28;36;28" dur="1.2s" repeatCount="indefinite" />
      </line>
      {/* Tassel ball */}
      <circle cx="32" cy="28" r="2" fill="#ffb300">
        <animate attributeName="cx" values="32;38;32" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="cy" values="28;36;28" dur="1.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
} 