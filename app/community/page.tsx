"use client"

import { useState, useEffect } from "react"
import AppHeader from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Heart, Eye, Users, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import CreateTripModal from "@/components/create-trip-modal"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { getSupabaseClient } from "@/lib/supabase/client"
import { formatDateRange } from "@/lib/utils"

type PublicTrip = {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  cover_url: string | null
  created_at: string
  user_id: string
  likes_count?: number
  is_liked?: boolean
}

export default function CommunityPage() {
  const { user } = useSupabaseUser()
  const supabase = getSupabaseClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [trips, setTrips] = useState<PublicTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadTrips()
  }, [searchQuery])

  const loadTrips = async () => {
    setLoading(true)
    try {
      let query = supabase.from("trips").select("*").eq("is_public", true).order("created_at", { ascending: false })

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      const { data } = await query
      if (data) {
        // Get likes count for each trip
        const tripsWithLikes = await Promise.all(
          data.map(async (trip) => {
            const { count } = await supabase
              .from("trip_likes")
              .select("*", { count: "exact", head: true })
              .eq("trip_id", trip.id)

            let isLiked = false
            if (user) {
              const { data: likeData } = await supabase
                .from("trip_likes")
                .select("id")
                .eq("trip_id", trip.id)
                .eq("user_id", user.id)
                .single()
              isLiked = !!likeData
            }

            return {
              ...trip,
              likes_count: count || 0,
              is_liked: isLiked,
            }
          }),
        )
        setTrips(tripsWithLikes)
      }
    } catch (error) {
      console.error("Error loading trips:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (tripId: string) => {
    if (!user) {
      alert("Please log in to like trips")
      return
    }

    try {
      const trip = trips.find((t) => t.id === tripId)
      if (!trip) return

      if (trip.is_liked) {
        // Unlike
        await supabase.from("trip_likes").delete().eq("trip_id", tripId).eq("user_id", user.id)
        setTrips(
          trips.map((t) =>
            t.id === tripId ? { ...t, is_liked: false, likes_count: Math.max(0, (t.likes_count || 0) - 1) } : t,
          ),
        )
      } else {
        // Like
        await supabase.from("trip_likes").insert({ trip_id: tripId, user_id: user.id })
        setTrips(
          trips.map((t) => (t.id === tripId ? { ...t, is_liked: true, likes_count: (t.likes_count || 0) + 1 } : t)),
        )
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleViewTrip = (tripId: string) => {
    window.location.href = `/p/${tripId}`
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <CreateTripModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">Community Trips</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover amazing trips shared by fellow travelers and get inspired for your next adventure
          </p>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search community trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg border-gray-200 focus:border-[#0093e3] focus:ring-[#0093e3] rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-8">
          <p className="text-lg text-gray-600 flex items-center gap-3">
            <Users className="h-5 w-5 text-[#0093e3]" />
            {loading ? "Loading..." : `${trips.length} community trips`}
          </p>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden rounded-2xl">
                <div className="h-72 bg-gray-200" />
                <CardContent className="p-8">
                  <div className="h-4 bg-gray-200 rounded mb-3" />
                  <div className="h-3 bg-gray-200 rounded mb-6" />
                  <div className="h-10 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-gray-300 mb-6">
              <Users className="h-20 w-20 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No trips found</h3>
            <p className="text-lg text-gray-600 mb-8">Be the first to share your amazing trip with the community!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group h-full flex flex-col rounded-2xl border-0 shadow-lg hover:scale-105">
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src="/scenic-mountain-landscape.png"
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-white/95 text-gray-900 px-3 py-1 text-sm font-medium rounded-full">
                        Community
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <CardContent className="p-8 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#0093e3] transition-colors">
                        {trip.name}
                      </h3>
                      <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                        {trip.description || "An amazing travel experience"}
                      </p>
                      <div className="flex items-center gap-3 text-gray-600 mb-6">
                        <Calendar className="h-5 w-5 text-[#0093e3]" />
                        <span className="text-lg">{formatDateRange(trip.start_date, trip.end_date)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                      <button
                        onClick={() => handleLike(trip.id)}
                        className={`flex items-center gap-2 text-lg transition-all duration-200 hover:scale-110 ${
                          trip.is_liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${trip.is_liked ? "fill-current" : ""}`} />
                        <span className="font-medium">{trip.likes_count || 0}</span>
                      </button>
                      <Button
                        onClick={() => handleViewTrip(trip.id)}
                        className="bg-[#0093e3] hover:bg-blue-700 text-white px-6 py-2 font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-md"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Trip
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
