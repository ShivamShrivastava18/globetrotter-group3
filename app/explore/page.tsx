"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import AppHeader from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Star,
  Loader,
} from "lucide-react"
import { motion } from "framer-motion"
import CreateTripModal from "@/components/create-trip-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Destination = {
  id: string
  name: string
  country: string
  region: string
  description: string
  image_url: string
  price_range: string
  best_time: string
  highlights: string[]
}

const csvDestinations: Destination[] = [
  {
    id: "1",
    name: "Yangon",
    country: "Myanmar",
    region: "Asia",
    description: "Former capital with golden pagodas and colonial architecture",
    image_url: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop",
    price_range: "mid-range",
    best_time: "November to February",
    highlights: ["Shwedagon Pagoda", "Colonial architecture", "Local markets", "Cultural sites", "Traditional cuisine"],
  },
  {
    id: "2",
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    description: "A vibrant metropolis blending traditional culture with cutting-edge technology",
    image_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
    price_range: "luxury",
    best_time: "March-May, September-November",
    highlights: ["Shibuya Crossing", "Tokyo Skytree", "Senso-ji Temple", "Tsukiji Fish Market", "Cherry Blossoms"],
  },
  {
    id: "3",
    name: "Paris",
    country: "France",
    region: "Europe",
    description: "City of Light renowned for art, fashion, cuisine, and iconic landmarks",
    image_url: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop",
    price_range: "luxury",
    best_time: "April-June, September-October",
    highlights: ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Champs-Élysées", "Montmartre"],
  },
  {
    id: "4",
    name: "New York City",
    country: "United States",
    region: "North America",
    description: "The city that never sleeps, featuring iconic skylines and Broadway shows",
    image_url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
    price_range: "luxury",
    best_time: "April-June, September-November",
    highlights: ["Statue of Liberty", "Central Park", "Times Square", "Brooklyn Bridge", "9/11 Memorial"],
  },
  {
    id: "5",
    name: "Rio de Janeiro",
    country: "Brazil",
    region: "South America",
    description: "Marvelous city famous for its beaches, carnival, and Christ the Redeemer statue",
    image_url: "https://images.unsplash.com/photo-1483729558449-99ef1f5ad396?w=800&h=600&fit=crop",
    price_range: "mid-range",
    best_time: "December-March",
    highlights: ["Christ the Redeemer", "Copacabana Beach", "Sugarloaf Mountain", "Carnival", "Santa Teresa"],
  },
  {
    id: "6",
    name: "Cape Town",
    country: "South Africa",
    region: "Africa",
    description: "Stunning coastal city beneath Table Mountain, known for wine and beaches",
    image_url: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop",
    price_range: "mid-range",
    best_time: "November-March",
    highlights: ["Table Mountain", "V&A Waterfront", "Robben Island", "Cape Winelands", "Boulders Beach"],
  },
  {
    id: "7",
    name: "Sydney",
    country: "Australia",
    region: "Oceania",
    description: "Harbor city famous for its Opera House, Harbour Bridge, and beautiful beaches",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    price_range: "luxury",
    best_time: "September-November, March-May",
    highlights: ["Opera House", "Harbour Bridge", "Bondi Beach", "The Rocks", "Royal Botanic Gardens"],
  },
  {
    id: "8",
    name: "London",
    country: "United Kingdom",
    region: "Europe",
    description: "Historic capital combining royal heritage with modern culture",
    image_url: "https://images.unsplash.com/photo-1513635269975-50cf7c579365?w=800&h=600&fit=crop",
    price_range: "luxury",
    best_time: "May-September",
    highlights: ["Big Ben", "Tower Bridge", "British Museum", "Buckingham Palace", "Hyde Park"],
  },
  {
    id: "9",
    name: "Bangkok",
    country: "Thailand",
    region: "Asia",
    description: "Bustling capital city with ornate temples and incredible street food",
    image_url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop",
    price_range: "budget",
    best_time: "November-March",
    highlights: ["Grand Palace", "Wat Pho Temple", "Floating Markets", "Khao San Road", "Street Food"],
  },
  {
    id: "10",
    name: "Dubai",
    country: "UAE",
    region: "Middle East",
    description: "Futuristic city in the desert featuring world-class shopping and luxury resorts",
    image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
    price_range: "luxury",
    best_time: "November-March",
    highlights: ["Burj Khalifa", "Dubai Mall", "Palm Jumeirah", "Desert Safari", "Gold Souk"],
  },
  {
    id: "11",
    name: "Rome",
    country: "Italy",
    region: "Europe",
    description: "Eternal City filled with ancient history, stunning architecture, and incredible cuisine",
    image_url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop",
    price_range: "mid-range",
    best_time: "April-June, September-October",
    highlights: ["Colosseum", "Vatican City", "Trevi Fountain", "Roman Forum", "Pantheon"],
  },
  {
    id: "12",
    name: "Barcelona",
    country: "Spain",
    region: "Europe",
    description: "Vibrant Catalonian city known for Gaudí's architecture and beautiful beaches",
    image_url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
    price_range: "mid-range",
    best_time: "May-June, September-October",
    highlights: ["Sagrada Familia", "Park Güell", "Las Ramblas", "Gothic Quarter", "Beach Barceloneta"],
  },
  {
    id: "13",
    name: "Marrakech",
    country: "Morocco",
    region: "Africa",
    description: "Imperial city with vibrant souks, stunning palaces, and the famous Jemaa el-Fnaa square",
    image_url: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop",
    price_range: "budget",
    best_time: "March-May, September-November",
    highlights: ["Jemaa el-Fnaa", "Bahia Palace", "Majorelle Garden", "Atlas Mountains", "Traditional Riads"],
  },
  {
    id: "14",
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    description: "Tropical paradise known for stunning beaches, ancient temples, and lush rice terraces",
    image_url: "https://images.unsplash.com/photo-1537953773386-3f8f99389edd?w=800&h=600&fit=crop",
    price_range: "budget",
    best_time: "April-October",
    highlights: ["Uluwatu Temple", "Rice Terraces", "Seminyak Beach", "Mount Batur", "Traditional Markets"],
  },
  {
    id: "15",
    name: "Buenos Aires",
    country: "Argentina",
    region: "South America",
    description: "Paris of South America known for tango, steak, wine, and European-influenced architecture",
    image_url: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&h=600&fit=crop",
    price_range: "budget",
    best_time: "March-May, September-November",
    highlights: ["La Boca", "Recoleta Cemetery", "Puerto Madero", "Tango Shows", "San Telmo Market"],
  },
  {
    id: "16",
    name: "Singapore",
    country: "Singapore",
    region: "Asia",
    description: "Modern city-state famous for its skyline, diverse cuisine, and Gardens by the Bay",
    image_url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop",
    price_range: "mid-range",
    best_time: "February-April",
    highlights: ["Marina Bay Sands", "Gardens by the Bay", "Sentosa Island", "Hawker Centers", "Merlion Park"],
  },
  {
    id: "17",
    name: "Mexico City",
    country: "Mexico",
    region: "North America",
    description: "Vibrant capital rich in history, art, and cuisine, featuring ancient Aztec ruins",
    image_url: "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800&h=600&fit=crop",
    price_range: "budget",
    best_time: "March-May, September-November",
    highlights: ["Zócalo", "Frida Kahlo Museum", "Teotihuacan", "Xochimilco", "Palacio de Bellas Artes"],
  },
  {
    id: "18",
    name: "Amsterdam",
    country: "Netherlands",
    region: "Europe",
    description: "Charming canal city famous for its museums, cycling culture, and liberal atmosphere",
    image_url: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop",
    price_range: "mid-range",
    best_time: "April-May, September-November",
    highlights: ["Anne Frank House", "Van Gogh Museum", "Canal Cruises", "Vondelpark", "Red Light District"],
  },
]

const regions = ["all", "Asia", "Europe", "South America", "Middle East", "Africa", "North America", "Oceania"]
const priceRanges = [
  { value: "all", label: "All Budgets" },
  { value: "budget", label: "Budget" },
  { value: "mid-range", label: "Mid-range" },
  { value: "luxury", label: "Luxury" },
]

const ITEMS_PER_PAGE = 9

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedPrice, setSelectedPrice] = useState("all")
  const [destinations] = useState<Destination[]>(csvDestinations)
  const [loading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [expandedHighlights, setExpandedHighlights] = useState<{ [key: string]: boolean }>({})
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedRegion, searchQuery, selectedPrice])

  const filteredDestinations = useMemo(() => {
    let filtered = destinations

    if (selectedRegion !== "all") {
      filtered = filtered.filter((dest) => dest.region === selectedRegion)
    }

    if (selectedPrice !== "all") {
      filtered = filtered.filter((dest) => dest.price_range === selectedPrice)
    }

    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (dest) =>
          dest.name.toLowerCase().includes(searchTerm) ||
          dest.country.toLowerCase().includes(searchTerm) ||
          dest.description.toLowerCase().includes(searchTerm),
      )
    }

    return filtered
  }, [destinations, selectedRegion, selectedPrice, searchQuery])

  const paginatedDestinations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredDestinations.slice(startIndex, endIndex)
  }, [filteredDestinations, currentPage])

  const totalPages = Math.ceil(filteredDestinations.length / ITEMS_PER_PAGE)

  const handleCardClick = (destination: Destination) => {
    setSelectedDestination(destination)
    setIsModalOpen(true)
  }

  const toggleHighlights = (destinationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedHighlights((prev) => ({
      ...prev,
      [destinationId]: !prev[destinationId],
    }))
  }

  const getPriceLabel = (priceRange: string) => {
    switch (priceRange) {
      case "budget":
        return "Budget"
      case "mid-range":
        return "Mid-range"
      case "luxury":
        return "Luxury"
      default:
        return "Varies"
    }
  }

  return (
    <div className="min-h-screen bg-white relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
        }}
      />
      <div className="relative z-10">
        <AppHeader />
        <CreateTripModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} preselectedDestination={selectedDestination} />

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">Explore Destinations</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover amazing places around the world and start planning your perfect adventure
            </p>
          </div>

          <div className="mb-12">
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 text-center border border-blue-100 shadow-lg overflow-hidden">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-20 animate-shimmer" />
              <div className="absolute inset-[2px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl" />

              <div className="relative z-10">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
                  Create Custom Itinerary with AI
                </h2>

                <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                  Tell us your travel dreams and let AI craft the perfect personalized itinerary just for you
                </p>

                <div className="relative inline-block">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0093e3] via-blue-500 to-[#0093e3] opacity-75 animate-pulse blur-sm"></div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0093e3] via-blue-400 to-[#0093e3] animate-shimmer-border"></div>
                  <Button
                    onClick={() => {
                      setSelectedDestination(null)
                      setIsModalOpen(true)
                    }}
                    variant="outline"
                    className="relative bg-white hover:bg-blue-50 text-[#0093e3] border-2 border-[#0093e3] px-12 py-6 text-xl font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    <Sparkles className="mr-3 h-6 w-6" />
                    Start Planning with AI
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </div>

                <div className="mt-8 text-gray-500 text-lg">
                  Or scroll down to explore popular destinations and create trips from there
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-12">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg border-gray-200 focus:border-[#0093e3] focus:ring-[#0093e3] rounded-xl"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-xl border-gray-200">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.slice(1).map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                  <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-xl border-gray-200">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((price) => (
                      <SelectItem key={price.value} value={price.value}>
                        {price.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {!loading && filteredDestinations.length > 0 && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredDestinations.length)} of {filteredDestinations.length}{" "}
                destinations
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-gray-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-gray-300"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="text-center py-20">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No destinations found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {paginatedDestinations.map((destination, index) => (
                  <motion.div
                    key={destination.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card
                      className="overflow-hidden hover:shadow-2xl transition-all duration-500 group h-full cursor-pointer flex flex-col rounded-2xl border-0 shadow-lg hover:scale-105"
                      onClick={() => handleCardClick(destination)}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={destination.image_url || "/placeholder.svg"}
                          alt={`${destination.name}, ${destination.country}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/95 text-gray-700 px-3 py-1 text-sm font-medium rounded-full shadow-sm">
                            {destination.region}
                          </Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/95 text-gray-700 px-3 py-1 text-sm font-medium rounded-full shadow-sm">
                            {getPriceLabel(destination.price_range)}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-6 flex flex-col flex-grow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-[#0093e3] transition-colors">
                              {destination.name}
                            </h3>
                            <p className="text-gray-500 flex items-center gap-1 text-sm">
                              <MapPin className="h-4 w-4" />
                              {destination.country}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-700">4.5</span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                          {destination.description}
                        </p>

                        <div className="mb-4">
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-[#0093e3]" />
                            <span className="text-sm font-medium text-gray-700">Best time:</span>
                            <span className="text-sm text-[#0093e3] font-semibold">{destination.best_time}</span>
                          </div>
                        </div>

                        {destination.highlights && destination.highlights.length > 0 && (
                          <div className="mb-6 flex-grow">
                            <div className="flex flex-wrap gap-2">
                              {destination.highlights
                                ?.slice(0, expandedHighlights[destination.id] ? undefined : 2)
                                .map((highlight, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                                  >
                                    {highlight}
                                  </Badge>
                                ))}
                              {destination.highlights?.length > 2 && (
                                <button
                                  onClick={(e) => toggleHighlights(destination.id, e)}
                                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[#0093e3] text-white hover:bg-blue-700 transition-colors"
                                >
                                  {expandedHighlights[destination.id] ? (
                                    <>
                                      <span>Show less</span>
                                      <ChevronUp className="h-3 w-3" />
                                    </>
                                  ) : (
                                    <>
                                      <span>+{destination.highlights.length - 2} more</span>
                                      <ChevronDown className="h-3 w-3" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-auto">
                          <Button className="w-full bg-[#0093e3] hover:bg-blue-700 text-white py-3 text-base font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-lg">
                            Plan Trip
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-gray-300"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={currentPage === pageNum ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300"}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-gray-300"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
