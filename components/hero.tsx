"use client"

import { Button } from "@/components/ui/button"
import { Users, Brain, Sparkles, Zap, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import AnimatedLogo from "@/components/animated-logo"
import { AnimatedBook, AnimatedFilter, AnimatedBrain } from "@/components/animated-illustrations"
import { motion } from "framer-motion"

export default function Hero({ user }: { user?: any }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!mounted) return null

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
      style={{
        backgroundImage: 'url(https://i.pinimg.com/736x/70/61/a3/7061a3a4a05fec8fb15bcc1cdf7f45fc.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Blurred background overlay */}
      <div className="absolute inset-0 z-0" style={{backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'}} />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 container mx-auto px-4 py-32">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Heading */}
          <motion.div
            className="animate-slide-up"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 glassmorphism-card px-6 py-3 rounded-full mb-8">
              <Sparkles className="h-5 w-5 text-[#fe0002]" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Welcome to the Future of Learning</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="text-white">Lincoln</span>
              <span className="block gradient-text">E-Library</span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-12 text-white max-w-4xl mx-auto leading-relaxed">
              Your gateway to infinite knowledge with thousands of books,
              <span className="text-[#fe0002] font-semibold"> AI-powered tutoring</span>, and
              <span className="text-[#ff4444] font-semibold"> course-based learning</span>
            </p>
          </motion.div>

          {/* CTA Buttons */}
          { !user && (
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up delay-200">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="morph-button bg-gradient-to-r from-[#fe0002] to-[#ff4444] hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 font-bold text-lg px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 text-white"
              >
                <Zap className="h-5 w-5 mr-2" />
                Start Learning Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="morph-button glassmorphism-card border-[#fe0002]/30 text-[#fe0002] hover:bg-[#fe0002] hover:text-white font-bold text-lg px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 bg-transparent"
              >
                <Brain className="h-5 w-5 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>
          )}

          {/* Feature Cards */}
          <motion.div
            className="bento-grid max-w-5xl mx-auto animate-slide-up delay-400"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.18 } },
            }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="glassmorphism-card hover-lift rounded-3xl p-8 group"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
                }}
              >
                {/* Card content will be filled below */}
                {i === 0 && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#fe0002]/10 rounded-2xl mb-6 group-hover:scale-110 transition-all duration-300">
                      <AnimatedBook className="h-14 w-14" />
                </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Vast Collection</h3>
                    <p className="text-gray-900 dark:text-white text-lg leading-relaxed">
                  Access thousands of books across multiple genres and academic disciplines
                </p>
              </div>
                )}
                {i === 1 && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ff4444]/10 rounded-2xl mb-6 group-hover:scale-110 transition-all duration-300">
                      <AnimatedFilter className="h-14 w-14 text-[#ff4444]" />
                </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Course-Based Learning</h3>
                    <p className="text-gray-900 dark:text-white text-lg leading-relaxed">
                  Filter and organize books by your courses for targeted, efficient learning
                </p>
              </div>
                )}
                {i === 2 && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ff6b6b]/10 rounded-2xl mb-6 group-hover:scale-110 transition-all duration-300">
                      <AnimatedBrain className="h-14 w-14 text-[#ff6b6b]" />
                </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AI Tutor</h3>
                    <p className="text-gray-900 dark:text-white text-lg leading-relaxed">
                  Get personalized help and explanations from our intelligent AI assistant
                </p>
              </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 mt-16 animate-slide-up delay-600"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="glassmorphism-card px-6 py-4 rounded-2xl"
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
                }}
              >
                {i === 0 && <><div className="text-3xl font-bold text-[#fe0002]">10K+</div><div className="text-gray-900 dark:text-white">Books Available</div></>}
                {i === 1 && <><div className="text-3xl font-bold text-[#ff4444]">50+</div><div className="text-gray-900 dark:text-white">Courses</div></>}
                {i === 2 && <><div className="text-3xl font-bold text-[#ff6b6b]">24/7</div><div className="text-gray-900 dark:text-white">AI Support</div></>}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-[#fe0002]/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-[#fe0002]/60 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
