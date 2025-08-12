"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plane } from "lucide-react"
import { useSupabaseUser } from "@/hooks/use-supabase-user"

const travelImages = [
  {
    url: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1200&h=400&fit=crop",
    alt: "Mykonos, Greece",
  },
  {
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop",
    alt: "Banff National Park, Canada",
  },
  {
    url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&h=400&fit=crop",
    alt: "Tokyo, Japan",
  },
  {
    url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&h=400&fit=crop",
    alt: "Santorini, Greece",
  },
  {
    url: "https://images.unsplash.com/photo-1503614472-8c93d56cd601?w=1200&h=400&fit=crop",
    alt: "Lake Louise, Canada",
  },
  {
    url: "https://images.unsplash.com/photo-1493976040374-75c0c6d73f6e?w=1200&h=400&fit=crop",
    alt: "Mount Fuji, Japan",
  },
  {
    url: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&h=400&fit=crop",
    alt: "Crete, Greece",
  },
]

export default function HomePage() {
  const { user } = useSupabaseUser()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % travelImages.length)
    }, 4000) // Increased interval to 4 seconds for better viewing

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (user) {
      window.location.href = "/explore"
    }
  }, [user])

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <header className="p-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">GlobeTrotter</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center min-h-0">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 relative"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Plan Your{" "}
              <span className="relative inline-block">
                <motion.img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-GVJJsTe7ytTYGTXEVCIyD4FUysM9SO.png"
                  alt="Brush stroke"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  style={{
                    transform: "scale(1.1) translateY(-5%)",
                    transformOrigin: "center",
                  }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{
                    duration: 1.2,
                    delay: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    scaleX: { type: "spring", stiffness: 100, damping: 15 },
                  }}
                />
                <span className="relative z-10">Perfect</span>
              </span>
            </h1>
            <div className="relative">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#0093e3] leading-tight mt-2">
                Adventure
              </h1>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Create personalized itineraries tailored to your interests, budget, and travel style with our intelligent
            planning assistant.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-[#0093e3] hover:bg-blue-700 text-white px-12 py-4 text-lg font-semibold rounded-full transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Get Started
              </Button>
            </Link>
            <span className="text-gray-400 text-lg font-medium">or</span>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:border-[#0093e3] hover:text-[#0093e3] px-12 py-4 text-lg font-semibold rounded-full transition-all duration-200 hover:scale-105 bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="h-32 sm:h-40 lg:h-48 relative overflow-hidden flex-shrink-0 shadow-2xl"
      >
        <div
          className="flex transition-transform duration-1000 ease-in-out h-full"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {travelImages.map((image, index) => (
            <div key={index} className="min-w-full h-full relative group">
              <img
                src={image.url || "/placeholder.svg"}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/20 to-transparent" />
              <div className="absolute bottom-2 left-4 text-white">
                <h3 className="text-sm sm:text-lg font-bold drop-shadow-lg">{image.alt}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
          {travelImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 border border-white/50 ${
                index === currentImageIndex ? "bg-white scale-110 shadow-lg" : "bg-white/30 hover:bg-white/60"
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
