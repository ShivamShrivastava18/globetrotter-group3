"use client"

import { useState, useEffect } from "react"
import AppHeader from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Heart, MessageCircle, Calendar, Users } from "lucide-react"
import { motion } from "framer-motion"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Trip } from "@/lib/types"
import Link from "next/link"

type PublicTrip = Trip & {
  user_email?: string
  user_name?: string
  likes_count?: number
  comments_count?: number
}

const featuredTrips = [
  {
    id: "featured-1",
    name: "Epic Japan Adventure",
    description: "14 days exploring Tokyo, Kyoto, and Osaka with the perfect mix of culture and modernity",
    user_name: "Sarah Chen",
    user_email: "sarah@example.com",
    start_date: "2024-03-15",
    end_date: "2024-03-29",
    cover_url: "/japan-cherry-blossoms-temple.png",
    likes_count: 247,
    comments_count: 32,
    tags: ["Culture", "Food", "Adventure"],
    duration: "14 days",
    budget: "$3,200",
  },
  {
    id: "featured-2",
    name: "Mediterranean Island Hopping",
    description: "Sailing through the Greek islands with stops in Santorini, Mykonos, and Crete",
    user_name: "Alex Rodriguez",
    user_email: "alex@example.com",
    start_date: "2024-06-10",
    end_date: "2024-06-24",
    cover_url: "/greek-islands-sailing.png",
    likes_count: 189,
    comments_count: 28,
    tags: ["Beach", "Sailing", "Romance"],
    duration: "14 days",
    budget: "$2,800",
  },
  {
    id: "featured-3",
    name: "Patagonia Wilderness Trek",
    description: "Hiking through Torres del Paine and exploring the wild beauty of southern Chile",
    user_name: "Maria Santos",
    user_email: "maria@example.com",
    start_date: "2024-01-20",
    end_date: "2024-02-03",
    cover_url: "/patagonia-hiking.png",
    likes_count: 156,
    comments_count: 19,
    tags: ["Adventure", "Nature", "Hiking"],
    duration: "14 days",
    budget: "$2,100",
  },
]

export default function CommunityPage() {
  const [publicTrips, setPublicTrips] = useState<PublicTrip[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const supabase = getSupabaseClient()

  const categories = ["All", "Adventure", "Culture", "Beach", "Food", "Nature", "City"]

  useEffect(() => {
    loadPublicTrips()
  }, [])

  const loadPublicTrips = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      setPublicTrips(data || [])
    } catch (error) {
      console.error("Error loading public trips:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTrips = publicTrips.filter(
    (trip) =>
      trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Travel Community</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing trips from fellow travelers and get inspired for your next adventure
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search trips, destinations, or travelers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Trips */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Trips</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={trip.cover_url || "/placeholder.svg"}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-gray-900 font-medium">Featured</Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex gap-2">
                        {trip.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-white/30">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{trip.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{trip.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{trip.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{trip.budget}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {trip.user_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-900">{trip.user_name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{trip.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{trip.comments_count}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                          View Trip
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          Copy Trip
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Community Trips */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Community Trips</h2>
            <Button variant="outline">Share Your Trip</Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded mb-4" />
                    <div className="flex justify-between">
                      <div className="h-8 w-8 bg-gray-200 rounded-full" />
                      <div className="h-4 w-16 bg-gray-200 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Users className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-600">Be the first to share your amazing journey!</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Share Your Trip</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={trip.cover_url || "/placeholder.svg?height=200&width=400&query=travel%20destination"}
                        alt={trip.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{trip.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {trip.description || "An amazing travel experience"}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{trip.start_date}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                              {trip.user_email?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{trip.user_email?.split("@")[0] || "Anonymous"}</span>
                        </div>
                        <Link href={`/p/${trip.id}`}>
                          <Button size="sm" variant="outline">
                            View Trip
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
