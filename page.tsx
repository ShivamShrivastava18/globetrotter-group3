"use client"

import AppHeader from "@/components/app-header"
import { useState } from "react"
import { motion } from "framer-motion"
import { Search, MapPin, Users, Star, ArrowRight, Plus, Sparkles } from "lucide-react"
import CreateTripModal from "@/components/create-trip-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const featuredDestinations = [
  {
    id: 1,
    name: "Tokyo, Japan",
    image: "/tokyo-cherry-blossoms.png",
    rating: 4.9,
    trips: 1247,
    description: "Modern metropolis meets ancient traditions",
    price: "From $2,400",
  },
  {
    id: 2,
    name: "Santorini, Greece",
    image: "/santorini-white-blue.png",
    rating: 4.8,
    trips: 892,
    description: "Stunning sunsets and whitewashed villages",
    price: "From $1,800",
  },
  {
    id: 3,
    name: "Bali, Indonesia",
    image: "/bali-rice-terraces-temple.png",
    rating: 4.7,
    trips: 1156,
    description: "Tropical paradise with rich culture",
    price: "From $1,200",
  },
  {
    id: 4,
    name: "Paris, France",
    image: "/paris-eiffel-tower-sunset.png",
    rating: 4.8,
    trips: 2103,
    description: "City of lights and romance",
    price: "From $2,100",
  },
]

const popularRegions = [
  {
    name: "Southeast Asia",
    destinations: 12,
    image: "/southeast-asia-temple-jungle.png",
  },
  {
    name: "Mediterranean",
    destinations: 8,
    image: "/mediterranean-blue-coast.png",
  },
  {
    name: "Northern Europe",
    destinations: 15,
    image: "/placeholder-lro0q.png",
  },
  {
    name: "South America",
    destinations: 10,
    image: "/south-america-mountains-machu-picchu.png",
  },
]

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleRegionClick = (regionName: string) => {
    window.location.href = `/explore?region=${encodeURIComponent(regionName)}`
  }

  const handleDestinationClick = (destination: any) => {
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <CreateTripModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Trip Planning
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              Plan Your Perfect
              <span className="block text-blue-600">Adventure</span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Create personalized itineraries tailored to your interests, budget, and travel style with our intelligent
              planning assistant.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-32 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200"
                />
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 transition-all duration-200 hover:scale-105"
                >
                  Plan Trip
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center gap-8 text-sm text-gray-600">
              <motion.div
                className="flex items-center gap-2 hover:text-blue-600 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <MapPin className="h-4 w-4" />
                <span>500+ Destinations</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 hover:text-orange-600 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <Users className="h-4 w-4" />
                <span>50K+ Travelers</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 hover:text-blue-600 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <Star className="h-4 w-4" />
                <span>4.9 Rating</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Regions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore by Region</h2>
            <p className="text-gray-600 text-lg">Discover amazing destinations around the world</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRegions.map((region, index) => (
              <motion.div
                key={region.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleRegionClick(region.name)}
                className="group cursor-pointer"
              >
                <div className="relative h-72 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                  <img
                    src={region.image || "/placeholder.svg"}
                    alt={region.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 className="text-xl font-bold mb-1">{region.name}</h3>
                    <p className="text-sm opacity-90">{region.destinations} destinations</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Destinations</h2>
              <p className="text-gray-600 text-lg">Handpicked destinations for your next adventure</p>
            </div>
            <Link href="/explore">
              <Button
                variant="outline"
                className="hidden sm:flex border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-200 bg-transparent"
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredDestinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleDestinationClick(destination)}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-900">
                      {destination.price}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {destination.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                        <span className="font-medium">{destination.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{destination.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{destination.trips} trips planned</span>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                      >
                        Plan Trip
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of travelers who trust GlobeTrotter for their adventures
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 transition-all duration-200 hover:scale-105"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Trip
              </Button>
              <Link href="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 bg-transparent transition-all duration-200 hover:scale-105"
                >
                  Explore Destinations
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
