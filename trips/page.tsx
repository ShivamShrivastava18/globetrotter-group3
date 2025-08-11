"use client"

import AppHeader from "@/components/app-header"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Calendar, MapPin, Clock, CheckCircle, Hourglass, Eye, Edit, Sparkles } from "lucide-react"
import CreateTripModal from "@/components/create-trip-modal"

type Trip = {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  cover_url: string | null
  is_public: boolean
  created_at: string
}

export default function TripsPage() {
  const { user } = useSupabaseUser()
  const supabase = getSupabaseClient()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")

  useEffect(() => {
    const run = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      setLoading(true)
      const { data } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setTrips(data ?? [])
      setLoading(false)
    }
    run()
  }, [user, supabase])

  const filteredTrips = useMemo(() => {
    let filtered = trips.filter(
      (trip) =>
        trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (selectedFilter !== "all") {
      const now = new Date()
      filtered = filtered.filter((trip) => {
        const startDate = new Date(trip.start_date)
        const endDate = new Date(trip.end_date)

        switch (selectedFilter) {
          case "upcoming":
            return startDate > now
          case "ongoing":
            return startDate <= now && endDate >= now
          case "completed":
            return endDate < now
          default:
            return true
        }
      })
    }

    return filtered
  }, [trips, searchTerm, selectedFilter])

  const categorizedTrips = useMemo(() => {
    const now = new Date()
    const upcoming: Trip[] = []
    const ongoing: Trip[] = []
    const completed: Trip[] = []

    trips.forEach((trip) => {
      const startDate = new Date(trip.start_date)
      const endDate = new Date(trip.end_date)
      if (endDate < now) {
        completed.push(trip)
      } else if (startDate > now) {
        upcoming.push(trip)
      } else {
        ongoing.push(trip)
      }
    })
    return { upcoming, ongoing, completed }
  }, [trips])

  const getTripStatus = (trip: Trip) => {
    const now = new Date()
    const startDate = new Date(trip.start_date)
    const endDate = new Date(trip.end_date)

    if (endDate < now) return "completed"
    if (startDate > now) return "upcoming"
    return "ongoing"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="h-4 w-4" />
      case "ongoing":
        return <Hourglass className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "ongoing":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "completed":
        return "bg-gray-50 text-gray-700 border-gray-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1

    return {
      range: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      duration: `${duration} day${duration > 1 ? "s" : ""}`,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-gray-200" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded mb-4" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <CreateTripModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Trips</h1>
            <p className="text-gray-600">
              {trips.length === 0
                ? "Start planning your next adventure"
                : `${trips.length} trip${trips.length > 1 ? "s" : ""} planned`}
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 transition-all duration-200 hover:scale-105"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Plan New Trip
          </Button>
        </div>

        {trips.length > 0 && (
          <>
            {/* Search and Filters */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search your trips..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 bg-white"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {[
                    { key: "all", label: "All Trips" },
                    { key: "upcoming", label: "Upcoming" },
                    { key: "ongoing", label: "Ongoing" },
                    { key: "completed", label: "Completed" },
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={selectedFilter === filter.key ? "default" : "outline"}
                      onClick={() => setSelectedFilter(filter.key)}
                      className={`whitespace-nowrap transition-all duration-200 ${
                        selectedFilter === filter.key
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "border-gray-300 hover:border-blue-500 hover:text-blue-600"
                      }`}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trip Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Upcoming Trips</p>
                      <p className="text-3xl font-bold text-blue-700">{categorizedTrips.upcoming.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Ongoing Trips</p>
                      <p className="text-3xl font-bold text-orange-700">{categorizedTrips.ongoing.length}</p>
                    </div>
                    <Hourglass className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Completed Trips</p>
                      <p className="text-3xl font-bold text-gray-700">{categorizedTrips.completed.length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Trips Grid */}
        {filteredTrips.length === 0 && trips.length > 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready for your first adventure?</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Start planning your dream trip with our AI-powered itinerary generator. Tell us where you want to go and
              we'll create the perfect plan for you.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 transition-all duration-200 hover:scale-105"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Plan Your First Trip
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip, index) => {
              const status = getTripStatus(trip)
              const dateInfo = formatDateRange(trip.start_date, trip.end_date)

              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-gray-200">
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={
                          trip.cover_url || "/placeholder.svg?height=200&width=400&query=travel%20destination%20scenic"
                        }
                        alt={trip.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getStatusColor(status)} flex items-center gap-1 border`}>
                          {getStatusIcon(status)}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2">
                        {trip.is_public && (
                          <Badge variant="secondary" className="bg-white/95 text-gray-700 border-white">
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {trip.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                          {trip.description || "An amazing travel experience awaits"}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <span>{dateInfo.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="truncate">{dateInfo.range}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/trips/${trip.id}`} className="flex-1">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105">
                            <Eye className="mr-2 h-4 w-4" />
                            View Trip
                          </Button>
                        </Link>
                        <Link href={`/trips/${trip.id}/builder`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-300 hover:border-orange-500 hover:text-orange-600 transition-colors bg-transparent"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
