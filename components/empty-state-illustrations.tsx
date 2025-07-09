"use client"

export function EmptyBooksIllustration() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full animate-bounce-gentle"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Book Stack */}
        <rect x="60" y="120" width="80" height="12" rx="2" fill="#fe0002" className="animate-scale-pulse" />
        <rect x="65" y="110" width="70" height="12" rx="2" fill="#ff4444" className="animate-scale-pulse delay-200" />
        <rect x="70" y="100" width="60" height="12" rx="2" fill="#ff6b6b" className="animate-scale-pulse delay-400" />

        {/* Floating Pages */}
        <rect
          x="40"
          y="60"
          width="30"
          height="40"
          rx="3"
          fill="#ffa8a8"
          className="animate-float"
          transform="rotate(-15)"
        />
        <rect
          x="130"
          y="50"
          width="30"
          height="40"
          rx="3"
          fill="#ffcccc"
          className="animate-float delay-1000"
          transform="rotate(15)"
        />

        {/* Search Icon */}
        <circle cx="100" cy="40" r="15" stroke="#fe0002" strokeWidth="3" fill="none" className="animate-rotate-slow" />
        <line x1="111" y1="51" x2="125" y2="65" stroke="#fe0002" strokeWidth="3" className="animate-rotate-slow" />
      </svg>
    </div>
  )
}

export function EmptyRequestsIllustration() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full animate-bounce-gentle"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Document */}
        <rect x="70" y="50" width="60" height="80" rx="5" fill="#ffa8a8" className="animate-scale-pulse" />
        <rect x="75" y="55" width="50" height="70" rx="3" fill="white" />

        {/* Lines on document */}
        <line x1="80" y1="70" x2="120" y2="70" stroke="#fe0002" strokeWidth="2" />
        <line x1="80" y1="80" x2="115" y2="80" stroke="#ff4444" strokeWidth="2" />
        <line x1="80" y1="90" x2="110" y2="90" stroke="#ff6b6b" strokeWidth="2" />

        {/* Plus icon */}
        <circle cx="100" cy="150" r="20" fill="#fe0002" className="animate-scale-pulse delay-500" />
        <line x1="100" y1="140" x2="100" y2="160" stroke="white" strokeWidth="3" />
        <line x1="90" y1="150" x2="110" y2="150" stroke="white" strokeWidth="3" />

        {/* Floating dots */}
        <circle cx="50" cy="80" r="3" fill="#fe0002" className="animate-bounce-gentle delay-200" />
        <circle cx="150" cy="90" r="3" fill="#ff4444" className="animate-bounce-gentle delay-700" />
        <circle cx="40" cy="120" r="3" fill="#ff6b6b" className="animate-bounce-gentle delay-1000" />
      </svg>
    </div>
  )
}

export function EmptyChatsIllustration() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full animate-bounce-gentle"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chat Bubble 1 */}
        <rect x="40" y="60" width="60" height="40" rx="20" fill="#ffa8a8" className="animate-scale-pulse" />
        <polygon points="70,100 80,110 90,100" fill="#ffa8a8" className="animate-scale-pulse" />

        {/* Chat Bubble 2 */}
        <rect x="100" y="90" width="60" height="40" rx="20" fill="#fe0002" className="animate-scale-pulse delay-300" />
        <polygon points="130,130 120,140 110,130" fill="#fe0002" className="animate-scale-pulse delay-300" />

        {/* AI Brain Icon */}
        <circle cx="100" cy="40" r="15" fill="#ff4444" className="animate-rotate-slow" />
        <circle cx="95" cy="35" r="3" fill="white" />
        <circle cx="105" cy="35" r="3" fill="white" />
        <path d="M 90 45 Q 100 50 110 45" stroke="white" strokeWidth="2" fill="none" />

        {/* Floating Question Marks */}
        <text x="60" y="45" fill="#fe0002" fontSize="16" className="animate-bounce-gentle delay-500">
          ?
        </text>
        <text x="140" y="70" fill="#ff4444" fontSize="16" className="animate-bounce-gentle delay-800">
          ?
        </text>
      </svg>
    </div>
  )
}

export function AdminDashboardIllustration() {
  return (
    <div className="relative w-64 h-48 flex items-center justify-center">
      <svg
        viewBox="0 0 360 200"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* SVG Filters for glass and glow */}
        <defs>
          <linearGradient id="panelGradient2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#f8dada" />
          </linearGradient>
          <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fe0002" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="metallic" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="50%" stopColor="#ff6b6b" />
            <stop offset="100%" stopColor="#fe0002" />
          </linearGradient>
          <filter id="shadow2" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#fe0002" floodOpacity="0.10" />
          </filter>
          <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Glassy Dashboard Panel */}
        <rect x="60" y="36" width="220" height="110" rx="28" fill="url(#panelGradient2)" stroke="#fe0002" strokeWidth="4" filter="url(#shadow2)" opacity="0.95" />
        {/* Panel shadow */}
        <ellipse cx="170" cy="170" rx="120" ry="18" fill="#fe0002" opacity="0.07" />
        {/* Animated Chart Bars with glass effect */}
        <rect x="100" y="120" width="18" height="30" rx="4" fill="url(#panelGradient2)" opacity="0.85">
          <animate attributeName="height" values="30;55;30" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="y" values="120;95;120" dur="1.2s" repeatCount="indefinite" />
        </rect>
        <rect x="128" y="105" width="18" height="45" rx="4" fill="#ff4444" opacity="0.85">
          <animate attributeName="height" values="45;25;45" dur="1.1s" repeatCount="indefinite" />
          <animate attributeName="y" values="105;125;105" dur="1.1s" repeatCount="indefinite" />
        </rect>
        <rect x="156" y="90" width="18" height="60" rx="4" fill="#ff6b6b" opacity="0.85">
          <animate attributeName="height" values="60;35;60" dur="1.3s" repeatCount="indefinite" />
          <animate attributeName="y" values="90;115;90" dur="1.3s" repeatCount="indefinite" />
        </rect>
        <rect x="184" y="115" width="18" height="35" rx="4" fill="#ffa8a8" opacity="0.85">
          <animate attributeName="height" values="35;60;35" dur="1.4s" repeatCount="indefinite" />
          <animate attributeName="y" values="115;90;115" dur="1.4s" repeatCount="indefinite" />
        </rect>
        {/* Animated Line Chart with points */}
        <polyline points="105,110 140,80 175,120 210,70" fill="none" stroke="#ff4444" strokeWidth="4" filter="url(#shadow2)" opacity="0.8">
          <animate attributeName="points" values="105,110 140,80 175,120 210,70;105,120 140,90 175,100 210,80;105,110 140,80 175,120 210,70" dur="2s" repeatCount="indefinite" />
        </polyline>
        {/* Animated points on line chart */}
        <circle cx="140" cy="80" r="6" fill="#fe0002" filter="url(#glowFilter)">
          <animate attributeName="cy" values="80;90;80" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="175" cy="120" r="6" fill="#ff4444" filter="url(#glowFilter)">
          <animate attributeName="cy" values="120;100;120" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="210" cy="70" r="6" fill="#ff6b6b" filter="url(#glowFilter)">
          <animate attributeName="cy" values="70;80;70" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Animated Pie Chart with slices */}
        <g>
          <circle cx="250" cy="80" r="22" fill="#fff" stroke="#ff6b6b" strokeWidth="4" />
          <path d="M250 80 L250 58 A22 22 0 0 1 272 80 Z" fill="#fe0002" filter="url(#glowFilter)">
            <animateTransform attributeName="transform" type="rotate" from="0 250 80" to="360 250 80" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M250 80 L250 102 A22 22 0 0 0 228 80 Z" fill="#ff4444" filter="url(#glowFilter)">
            <animateTransform attributeName="transform" type="rotate" from="0 250 80" to="-360 250 80" dur="2.5s" repeatCount="indefinite" />
          </path>
        </g>


        {/* Sparkles/activity dots with subtle movement */}
        <circle cx="110" cy="160" r="5" fill="#fe0002">
          <animate attributeName="r" values="5;8;5" dur="1.1s" repeatCount="indefinite" />
          <animate attributeName="cy" values="160;150;160" dur="1.1s" repeatCount="indefinite" />
        </circle>
        <circle cx="230" cy="160" r="5" fill="#ff4444">
          <animate attributeName="r" values="5;8;5" dur="1.3s" repeatCount="indefinite" />
          <animate attributeName="cy" values="160;150;160" dur="1.3s" repeatCount="indefinite" />
        </circle>
        <circle cx="170" cy="70" r="4" fill="#ff6b6b">
          <animate attributeName="r" values="4;7;4" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="70;60;70" dur="1.2s" repeatCount="indefinite" />
        </circle>
        {/* Sparkle */}
        <g opacity="0.7">
          <circle cx="260" cy="140" r="3" fill="#fe0002">
            <animate attributeName="r" values="3;7;3" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="cy" values="140;130;140" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="120" cy="70" r="3" fill="#ff4444">
            <animate attributeName="r" values="3;7;3" dur="1.7s" repeatCount="indefinite" />
            <animate attributeName="cy" values="70;60;70" dur="1.7s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  )
}

export function EmptyVideosIllustration() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full animate-bounce-gentle"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Film Strip */}
        <rect x="40" y="60" width="120" height="80" rx="16" fill="#fe0002" className="animate-scale-pulse" />
        <rect x="50" y="70" width="100" height="60" rx="10" fill="#fff" />
        {/* Play Button */}
        <polygon points="100,90 120,100 100,110" fill="#ff4444" className="animate-pulse" />
        {/* Video Camera Lens */}
        <circle cx="70" cy="100" r="10" fill="#ff6b6b" className="animate-scale-pulse delay-300" />
        {/* Floating Dots */}
        <circle cx="160" cy="80" r="4" fill="#ffa8a8" className="animate-bounce-gentle delay-500" />
        <circle cx="45" cy="130" r="3" fill="#ffcccc" className="animate-bounce-gentle delay-1000" />
      </svg>
    </div>
  )
}
