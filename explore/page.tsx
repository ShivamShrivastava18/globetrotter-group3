"use client"

import { useState, useEffect } from "react"
import AppHeader from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star } from "lucide-react"
import { motion } from "framer-motion"
import CreateTripModal from "@/components/create-trip-modal"

const destinations = [
  {
    id: 1,
    name: "Tokyo, Japan",
    country: "Japan",
    region: "Asia",
    image: "/tokyo-modern-neon.png",
    rating: 4.9,
    reviews: 2847,
    price: 2400,
    description:
      "Experience the perfect blend of traditional culture and cutting-edge technology in Japan's vibrant capital.",
    highlights: ["Shibuya Crossing", "Mount Fuji", "Traditional Temples", "Modern Architecture"],
    bestTime: "March - May, September - November",
  },
  {
    id: 2,
    name: "Santorini, Greece",
    country: "Greece",
    region: "Europe",
    image: "/santorini-sunset-white-buildings.png",
    rating: 4.8,
    reviews: 1923,
    price: 1800,
    description:
      "Stunning sunsets, whitewashed buildings, and crystal-clear waters make this Greek island paradise unforgettable.",
    highlights: ["Oia Sunset", "Red Beach", "Wine Tasting", "Volcanic Views"],
    bestTime: "April - October",
  },
  {
    id: 3,
    name: "Bali, Indonesia",
    country: "Indonesia",
    region: "Asia",
    image: "/bali-rice-terraces-tropical.png",
    rating: 4.7,
    reviews: 3156,
    price: 1200,
    description: "Tropical paradise with lush rice terraces, ancient temples, and world-class beaches.",
    highlights: ["Ubud Rice Terraces", "Beach Clubs", "Temple Tours", "Volcano Hiking"],
    bestTime: "April - October",
  },
  {
    id: 4,
    name: "Paris, France",
    country: "France",
    region: "Europe",
    image: "/paris-eiffel-tower-romantic.png",
    rating: 4.8,
    reviews: 4521,
    price: 2100,
    description: "The City of Light offers world-class museums, romantic streets, and exceptional cuisine.",
    highlights: ["Eiffel Tower", "Louvre Museum", "Seine River", "Montmartre"],
    bestTime: "April - June, September - October",
  },
  {
    id: 5,
    name: "Machu Picchu, Peru",
    country: "Peru",
    region: "South America",
    image: "/machu-picchu-mountains-ruins.png",
    rating: 4.9,
    reviews: 1876,
    price: 1600,
    description:
      "Ancient Incan citadel perched high in the Andes Mountains, one of the New Seven Wonders of the World.",
    highlights: ["Inca Trail", "Sacred Valley", "Cusco City", "Andean Culture"],
    bestTime: "May - September",
  },
  {
    id: 6,
    name: "Dubai, UAE",
    country: "UAE",
    region: "Middle East",
    image: "/dubai-skyline-burj-khalifa.png",
    rating: 4.6,
    reviews: 2234,
    price: 2200,
    description: "Ultra-modern city with luxury shopping, innovative architecture, and desert adventures.",
    highlights: ["Burj Khalifa", "Desert Safari", "Gold Souk", "Palm Jumeirah"],
    bestTime: "November - March",
  },
]

const regions = ["All", "Asia", "Europe", "South America", "Middle East", "Africa", "North America", "Oceania"]
const priceRanges = ["All", "Budget ($500-1000)", "Mid-range ($1000-2000)", "Luxury ($2000+)"]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("All")
  const [selectedPrice, setSelectedPrice] = useState("All")
  const [filteredDestinations, setFilteredDestinations] = useState(destinations)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<any>(null)

  useEffect(() => {
    let filtered = destinations

    if (searchQuery) {
      filtered = filtered.filter(
        (dest) =>
          dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dest.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedRegion !== "All") {
      filtered = filtered.filter((dest) => dest.region === selectedRegion)
    }

    if (selectedPrice !== "All") {
      const priceFilter = selectedPrice.includes("Budget")
        ? [500, 1000]
        : selectedPrice.includes("Mid-range")
          ? [1000, 2000]
          : [2000, 5000]
      filtered = filtered.filter((dest) => dest.price >= priceFilter[0] && dest.price <= priceFilter[1])
    }

    setFilteredDestinations(filtered)
  }, [searchQuery, selectedRegion, selectedPrice])

  const handlePlanTrip = (destination: any) => {
    setSelectedDestination(destination)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <CreateTripModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        prefilledDestination={selectedDestination?.name}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Destinations</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing places around the world and start planning your next adventure
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {priceRanges.map((price) => (
                  <option key={price} value={price}>
                    {price}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">Showing {filteredDestinations.length} destinations</p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={destination.image || "/placeholder.svg"}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-900">{destination.region}</Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-sm font-semibold">${destination.price}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{destination.name}</h3>
                      <p className="text-gray-600 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {destination.country}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{destination.rating}</span>
                      <span className="text-gray-500 text-sm">({destination.reviews})</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{destination.description}</p>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Highlights:</p>
                    <div className="flex flex-wrap gap-1">
                      {destination.highlights.slice(0, 3).map((highlight, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                      {destination.highlights.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{destination.highlights.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>Best time: {destination.bestTime}</p>
                    </div>
                    <Button onClick={() => handlePlanTrip(destination)} className="bg-blue-600 hover:bg-blue-700">
                      Plan Trip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No destinations found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </main>
    </div>
  )
}
