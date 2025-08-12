"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import AppHeader from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Loader,
  CheckCircle,
  Calendar,
  Star,
  Plus,
  X,
  Sparkles,
  Edit3,
} from "lucide-react"
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
  isCustom?: boolean
}

type DayPlan = {
  day: number
  date: string
  activities: Activity[]
  ai_suggestions: string
}

type CustomActivity = {
  title: string
  description: string
  startTime: string
  estimatedCost: string
}

export default function ItineraryPage() {
  const { user } = useSupabaseUser()
  const [tripData, setTripData] = useState<CompleteTrip | null>(null)
  const [aiActivities, setAiActivities] = useState<Activity[]>([])
  const [itinerary, setItinerary] = useState<DayPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAiRecommendations, setShowAiRecommendations] = useState(false)
  const [loadingAi, setLoadingAi] = useState(false)
  const [addingCustomActivity, setAddingCustomActivity] = useState<{ dayIndex: number } | null>(null)
  const [customActivity, setCustomActivity] = useState<CustomActivity>({
    title: "",
    description: "",
    startTime: "",
    estimatedCost: "",
  })

  useEffect(() => {
    const storedTripData = sessionStorage.getItem("completeTrip")
    if (storedTripData) {
      const data = JSON.parse(storedTripData)
      setTripData(data)
      initializeEmptyItinerary(data)
    } else {
      window.location.href = "/"
    }
  }, [])

  const initializeEmptyItinerary = (data: CompleteTrip) => {
    setLoading(true)

    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1

    const emptyItinerary: DayPlan[] = []

    for (let i = 0; i < duration; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)

      emptyItinerary.push({
        day: i + 1,
        date: currentDate.toISOString().split("T")[0],
        activities: [],
        ai_suggestions: `Day ${i + 1} - Add your own activities or get AI recommendations for ${data.destination}`,
      })
    }

    setItinerary(emptyItinerary)
    setLoading(false)
  }

  const getAiRecommendations = async () => {
    if (!tripData) return

    setLoadingAi(true)
    try {
      const startDate = new Date(tripData.startDate)
      const endDate = new Date(tripData.endDate)
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1

      const activitiesResponse = await fetch("http://localhost:8000/api/search-activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: tripData.destination,
          budget: tripData.budget,
          duration: duration,
          selected_hotel: tripData.selectedHotel,
        }),
      })

      if (!activitiesResponse.ok) {
        throw new Error(`Activities search failed: ${activitiesResponse.status}`)
      }

      const activitiesResult = await activitiesResponse.json()
      const fetchedActivities = activitiesResult.activities || []

      if (fetchedActivities.length === 0) {
        // Fallback to mock data
        const mockActivities = generateMockActivities(tripData.destination, tripData.budget, tripData.selectedHotel)
        setAiActivities(mockActivities)
      } else {
        setAiActivities(fetchedActivities)
      }

      setShowAiRecommendations(true)
    } catch (error: any) {
      console.error("Error getting AI recommendations:", error)
      // Fallback to mock data
      const mockActivities = generateMockActivities(tripData.destination, tripData.budget, tripData.selectedHotel)
      setAiActivities(mockActivities)
      setShowAiRecommendations(true)
    } finally {
      setLoadingAi(false)
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
      {
        name: `${destination} Scenic Viewpoint`,
        description: `Visit the best panoramic viewpoint in ${destination}`,
        price: `$${Math.round(10 * budgetMultiplier)}`,
        hours: "4:00 PM - 6:00 PM",
        distance: "2.0 km from hotel",
        transport: "20-minute bus ride",
      },
      {
        name: `Traditional ${destination} Restaurant`,
        description: `Authentic dining experience with local specialties`,
        price: `$${Math.round(45 * budgetMultiplier)}`,
        hours: "7:00 PM - 9:00 PM",
        distance: "0.3 km from hotel",
        transport: "3-minute walk",
      },
    ]
  }

  const addAiActivityToDay = (activity: Activity, dayIndex: number) => {
    const updatedItinerary = [...itinerary]
    updatedItinerary[dayIndex].activities.push(activity)
    setItinerary(updatedItinerary)

    // Remove from AI recommendations
    setAiActivities((prev) => prev.filter((a) => a.name !== activity.name))
  }

  const addCustomActivityToDay = (dayIndex: number) => {
    if (!customActivity.title.trim()) return

    const newActivity: Activity = {
      name: customActivity.title,
      description: customActivity.description,
      price: customActivity.estimatedCost ? `$${customActivity.estimatedCost}` : "$0",
      hours: customActivity.startTime || "TBD",
      distance: "Custom location",
      transport: "As needed",
      isCustom: true,
    }

    const updatedItinerary = [...itinerary]
    updatedItinerary[dayIndex].activities.push(newActivity)
    setItinerary(updatedItinerary)

    // Reset form
    setCustomActivity({ title: "", description: "", startTime: "", estimatedCost: "" })
    setAddingCustomActivity(null)
  }

  const removeActivityFromDay = (dayIndex: number, activityIndex: number) => {
    const updatedItinerary = [...itinerary]
    const removedActivity = updatedItinerary[dayIndex].activities[activityIndex]
    updatedItinerary[dayIndex].activities.splice(activityIndex, 1)
    setItinerary(updatedItinerary)

    // If it was an AI activity, add it back to recommendations
    if (!removedActivity.isCustom) {
      setAiActivities((prev) => [...prev, removedActivity])
    }
  }

  const handleSaveTrip = async () => {
    if (!user || !tripData) return

    setSaving(true)
    try {
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
            <h1 className="text-3xl font-bold text-gray-900">Plan Your Itinerary</h1>
            <p className="text-gray-600">
              {tripData.destination} • {tripData.startDate} to {tripData.endDate}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Setting up your itinerary...</h3>
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

            {/* AI Recommendations Section */}
            {!showAiRecommendations ? (
              <Card className="mb-8 border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Want AI Recommendations?</h3>
                    <p className="text-gray-600 mb-4">
                      Get personalized activity suggestions based on your destination, budget, and hotel location.
                    </p>
                    <Button
                      onClick={getAiRecommendations}
                      disabled={loadingAi}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loadingAi ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Getting Recommendations...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Get AI Recommendations
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              aiActivities.length > 0 && (
                <Card className="mb-8 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      AI Recommended Activities
                    </CardTitle>
                    <p className="text-sm text-gray-600">Click to add activities to your preferred days</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiActivities.map((activity, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex gap-3">
                            <img
                              src={`/abstract-geometric-shapes.png?height=60&width=80&query=${encodeURIComponent(activity.name)}`}
                              alt={activity.name}
                              className="w-16 h-12 object-cover rounded-md flex-shrink-0"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm mb-1">{activity.name}</h4>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{activity.description}</p>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                                <span>{activity.price}</span>
                                <span>•</span>
                                <span>{activity.hours}</span>
                              </div>
                              <div className="flex gap-1">
                                {itinerary.map((day, dayIndex) => (
                                  <Button
                                    key={day.day}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs px-2 py-1 h-6 bg-transparent"
                                    onClick={() => addAiActivityToDay(activity, dayIndex)}
                                  >
                                    Day {day.day}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            )}

            {/* Daily Itinerary */}
            <div className="space-y-6">
              {itinerary.map((day, dayIndex) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: dayIndex * 0.1 }}
                >
                  <Card className="border-gray-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Day {day.day} -{" "}
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{day.ai_suggestions}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAddingCustomActivity({ dayIndex })}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Activity
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Custom Activity Form */}
                      {addingCustomActivity?.dayIndex === dayIndex && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Edit3 className="h-4 w-4" />
                            Add Custom Activity
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              placeholder="Activity title"
                              value={customActivity.title}
                              onChange={(e) => setCustomActivity((prev) => ({ ...prev, title: e.target.value }))}
                            />
                            <Input
                              placeholder="Start time (e.g., 9:00 AM)"
                              value={customActivity.startTime}
                              onChange={(e) => setCustomActivity((prev) => ({ ...prev, startTime: e.target.value }))}
                            />
                            <Input
                              placeholder="Estimated cost (numbers only)"
                              type="number"
                              value={customActivity.estimatedCost}
                              onChange={(e) =>
                                setCustomActivity((prev) => ({ ...prev, estimatedCost: e.target.value }))
                              }
                            />
                            <div className="md:col-span-1">
                              <Textarea
                                placeholder="Description (optional)"
                                value={customActivity.description}
                                onChange={(e) =>
                                  setCustomActivity((prev) => ({ ...prev, description: e.target.value }))
                                }
                                className="h-10"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => addCustomActivityToDay(dayIndex)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Add Activity
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setAddingCustomActivity(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Activities List */}
                      {day.activities.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No activities planned for this day</p>
                          <p className="text-sm">Add custom activities or use AI recommendations above</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {day.activities.map((activity, actIndex) => (
                            <div key={actIndex} className="flex gap-4 p-4 bg-gray-50 rounded-lg relative group">
                              <img
                                src={`/abstract-geometric-shapes.png?height=80&width=120&query=${encodeURIComponent(activity.name)}`}
                                alt={activity.name}
                                className="w-20 h-16 object-cover rounded-md flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                    {activity.name}
                                    {activity.isCustom && (
                                      <Badge variant="secondary" className="text-xs">
                                        Custom
                                      </Badge>
                                    )}
                                  </h4>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeActivityFromDay(dayIndex, actIndex)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
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
                                  {!activity.isCustom && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {activity.distance}
                                    </div>
                                  )}
                                </div>
                                {activity.transport && !activity.isCustom && (
                                  <div className="mt-1 text-xs text-blue-600">🚶 {activity.transport}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                      Save My Itinerary
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
