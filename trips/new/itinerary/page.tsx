"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import AppHeader from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, Clock, DollarSign, Loader, CheckCircle, Calendar, Star } from "lucide-react"
import Link from "next/link"
import { createTripWithItinerary } from "@/app/actions/trips"
import { useSupabaseUser } from "@/hooks/use-supabase-user"

type CompleteTrip = {
  destination: string
  startDate: string
  endDate: string
  budget: string
  selectedHotel: {
    id: string
    name: string
    description: string
    price: string
    rating: string
    location: string
  }
}

type Activity = {
  name: string
  description: string
  price: string
  hours: string
  distance: string
  transport: string
}

type DayPlan = {
  day: number
  date: string
  activities: Activity[]
  ai_suggestions: string
}

export default function ItineraryPage() {
  const { user } = useSupabaseUser()
  const [tripData, setTripData] = useState<CompleteTrip | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [itinerary, setItinerary] = useState<DayPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedTripData = sessionStorage.getItem("completeTrip")
    if (storedTripData) {
      const data = JSON.parse(storedTripData)
      setTripData(data)
      generateItinerary(data)
    } else {
      window.location.href = "/"
    }
  }, [])

  const generateItinerary = async (data: CompleteTrip) => {
    setLoading(true)
    setError(null)

    try {
      console.log("Generating itinerary with data:", data)

      // Calculate duration
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1

      // First, search for activities
      const activitiesResponse = await fetch("http://localhost:8000/api/search-activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: data.destination,
          budget: data.budget,
          duration: duration,
          selected_hotel: data.selectedHotel,
        }),
      })

      if (!activitiesResponse.ok) {
        throw new Error(`Activities search failed: ${activitiesResponse.status}`)
      }

      const activitiesResult = await activitiesResponse.json()
      console.log("Activities received:", activitiesResult)

      const fetchedActivities = activitiesResult.activities || []
      setActivities(fetchedActivities)

      // Then generate the complete itinerary
      const itineraryResponse = await fetch("http://localhost:8000/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: data.destination,
          start_date: data.startDate,
          end_date: data.endDate,
          budget: data.budget,
          duration: duration,
          selected_hotel: data.selectedHotel,
          activities: fetchedActivities,
        }),
      })

      if (!itineraryResponse.ok) {
        throw new Error(`Itinerary generation failed: ${itineraryResponse.status}`)
      }

      const itineraryResult = await itineraryResponse.json()
      console.log("Itinerary received:", itineraryResult)

      setItinerary(itineraryResult.daily_schedule || [])
    } catch (error: any) {
      console.error("Error generating itinerary:", error)
      setError(error.message || "Failed to generate itinerary")

      // Fallback to mock data
      const mockActivities = generateMockActivities(data.destination, data.budget, data.selectedHotel)
      const mockItinerary = generateMockItinerary(data, mockActivities)

      setActivities(mockActivities)
      setItinerary(mockItinerary)
    } finally {
      setLoading(false)
    }
  }

  const generateMockActivities = (destination: string, budget: string, hotel: any): Activity[] => {
    const budgetMultiplier = budget === "low" ? 0.5 : budget === "medium" ? 1 : 2

    return [
      {
        name: `${destination} City Walking Tour`,
        description: `Explore the historic center of ${destination} with a knowledgeable local guide`,
        price: `$${Math.round(25 * budgetMultiplier)}`,
        hours: "9:00 AM - 12:00 PM",
        distance: "0.5 km from hotel",
        transport: "5-minute walk",
      },
      {
        name: `${destination} Museum of Art`,
        description: `World-class art collection featuring local and international artists`,
        price: `$${Math.round(15 * budgetMultiplier)}`,
        hours: "10:00 AM - 6:00 PM",
        distance: "1.2 km from hotel",
        transport: "15-minute walk or taxi",
      },
      {
        name: `Local Food Market Tour`,
        description: `Taste authentic local cuisine and learn about culinary traditions`,
        price: `$${Math.round(35 * budgetMultiplier)}`,
        hours: "11:00 AM - 2:00 PM",
        distance: "0.8 km from hotel",
        transport: "10-minute walk",
      },
    ]
  }

  const generateMockItinerary = (data: CompleteTrip, activities: Activity[]): DayPlan[] => {
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1

    const itinerary: DayPlan[] = []

    for (let i = 0; i < duration; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)

      const dayActivities =
        activities.slice(i * 2, i * 2 + 2).length > 0
          ? activities.slice(i * 2, i * 2 + 2)
          : [activities[i % activities.length]]

      itinerary.push({
        day: i + 1,
        date: currentDate.toISOString().split("T")[0],
        activities: dayActivities,
        ai_suggestions: `Day ${i + 1} focuses on ${i === 0 ? "arrival and orientation" : i === duration - 1 ? "final experiences and departure prep" : "exploring key attractions"}. All activities are optimized for easy access from ${data.selectedHotel.name}.`,
      })
    }

    return itinerary
  }

  const handleSaveTrip = async () => {
    if (!user || !tripData) return

    setSaving(true)
    try {
      // Convert to the format expected by createTripWithItinerary
      const itineraryData = {
        stops: itinerary.map((day) => ({
          day: day.day,
          title: `Day ${day.day}: ${tripData.destination}`,
          activities: day.activities.map((activity) => ({
            title: activity.name,
            start_time: activity.hours.split(" - ")[0] || "9:00 AM",
            description: activity.description,
            estimated_cost: Number.parseInt(activity.price.replace(/[^0-9]/g, "")) || 0,
          })),
        })),
      }

      const result = await createTripWithItinerary({
        user_id: user.id,
        name: `${tripData.destination} Adventure`,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        destination: tripData.destination,
        itinerary: itineraryData,
      })

      if (result.error) {
        alert(`Error saving trip: ${result.error}`)
      } else {
        setSaved(true)
        setTimeout(() => {
          window.location.href = `/trips/${result.id}`
        }, 2000)
      }
    } catch (error) {
      console.error("Error saving trip:", error)
      alert("Failed to save trip. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!tripData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/trips/new/hotels">
            <Button variant="outline" size="sm" className="border-gray-300 bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hotels
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your AI-Generated Itinerary</h1>
            <p className="text-gray-600">
              {tripData.destination} • {tripData.startDate} to {tripData.endDate}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-700">
              <span className="text-sm">⚠️ Using fallback data: {error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI is Creating Your Perfect Itinerary</h3>
            <p className="text-gray-600 text-center max-w-md">
              Our AI agent is searching the web for the best activities near {tripData.selectedHotel.name} and creating
              an optimized schedule for your trip...
            </p>
          </div>
        ) : (
          <>
            {/* Selected Hotel Summary */}
            <Card className="mb-8 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Your Selected Hotel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <img
                    src={`/grand-hotel.png?height=80&width=120&query=hotel%20${encodeURIComponent(tripData.selectedHotel.name)}`}
                    alt={tripData.selectedHotel.name}
                    className="w-24 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{tripData.selectedHotel.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {tripData.selectedHotel.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                        {tripData.selectedHotel.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {tripData.selectedHotel.price}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Itinerary */}
            <div className="space-y-6">
              {itinerary.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Day {day.day} -{" "}
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardTitle>
                      {day.ai_suggestions && <p className="text-sm text-gray-600">{day.ai_suggestions}</p>}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {day.activities.map((activity, actIndex) => (
                          <div key={actIndex} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            <img
                              src={`/abstract-geometric-shapes.png?height=80&width=120&query=${encodeURIComponent(activity.name)}`}
                              alt={activity.name}
                              className="w-20 h-16 object-cover rounded-md flex-shrink-0"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{activity.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {activity.hours}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {activity.price}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {activity.distance}
                                </div>
                              </div>
                              {activity.transport && (
                                <div className="mt-1 text-xs text-blue-600">🚶 {activity.transport}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Save Trip Button */}
            <div className="mt-8 text-center">
              {saved ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-lg border border-green-200"
                >
                  <CheckCircle className="h-5 w-5" />
                  Trip saved successfully! Redirecting...
                </motion.div>
              ) : (
                <Button
                  onClick={handleSaveTrip}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg transition-all duration-200 hover:scale-105"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader className="mr-2 h-5 w-5 animate-spin" />
                      Saving Trip...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Save My AI-Generated Trip
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
