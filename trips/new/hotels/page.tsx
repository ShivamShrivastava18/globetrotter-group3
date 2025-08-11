"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import AppHeader from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Star, Wifi, Car, Coffee, Dumbbell, Loader, CheckCircle } from "lucide-react"
import Link from "next/link"

type TripData = {
  destination: string
  startDate: string
  endDate: string
  budget: string
}

type Hotel = {
  id: string
  name: string
  description: string
  price: string
  rating: string
  location: string
  amenities: string[]
}

export default function HotelSelectionPage() {
  const [tripData, setTripData] = useState<TripData | null>(null)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get trip data from sessionStorage
    const storedTripData = sessionStorage.getItem("tripData")
    if (storedTripData) {
      const data = JSON.parse(storedTripData)
      setTripData(data)
      searchHotels(data)
    } else {
      // Redirect back if no trip data
      window.location.href = "/"
    }
  }, [])

  const searchHotels = async (data: TripData) => {
    setLoading(true)
    setError(null)
    try {
      console.log("Searching hotels with data:", data)

      const response = await fetch("http://localhost:8000/api/search-hotels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: data.destination,
          start_date: data.startDate,
          end_date: data.endDate,
          budget: data.budget,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Hotels received:", result)

      if (result.hotels && Array.isArray(result.hotels)) {
        setHotels(result.hotels)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error: any) {
      console.error("Error searching hotels:", error)
      setError(error.message || "Failed to search hotels")

      // Fallback to mock data
      const mockHotels = generateMockHotels(data.destination, data.budget)
      setHotels(mockHotels)
    } finally {
      setLoading(false)
    }
  }

  const generateMockHotels = (destination: string, budget: string): Hotel[] => {
    const basePrice = budget === "low" ? 80 : budget === "medium" ? 180 : 350

    return [
      {
        id: "1",
        name: `Grand ${destination} Hotel`,
        description: `Luxurious accommodation in the heart of ${destination} with stunning city views and world-class amenities. Perfect for travelers seeking comfort and elegance.`,
        price: `$${basePrice + 50}/night`,
        rating: "4.8/5",
        location: `Central ${destination}`,
        amenities: ["Wifi", "Parking", "Restaurant", "Gym", "Spa"],
      },
      {
        id: "2",
        name: `${destination} Plaza Suites`,
        description: `Modern suites with kitchenette facilities and panoramic views. Ideal for extended stays with all the comforts of home in a prime location.`,
        price: `$${basePrice + 20}/night`,
        rating: "4.6/5",
        location: `Downtown ${destination}`,
        amenities: ["Wifi", "Kitchen", "Gym", "Pool"],
      },
      {
        id: "3",
        name: `Boutique ${destination} Inn`,
        description: `Charming boutique hotel with personalized service and unique local character. Each room is individually designed with local art and furnishings.`,
        price: `$${basePrice}/night`,
        rating: "4.7/5",
        location: `Historic District, ${destination}`,
        amenities: ["Wifi", "Restaurant", "Concierge"],
      },
    ]
  }

  const handleHotelSelect = async (hotel: Hotel) => {
    setSelectedHotel(hotel)

    // Store selected hotel and proceed to itinerary generation
    const completeData = {
      ...tripData,
      selectedHotel: hotel,
    }
    sessionStorage.setItem("completeTrip", JSON.stringify(completeData))

    // Navigate to itinerary generation
    setTimeout(() => {
      window.location.href = "/trips/new/itinerary"
    }, 1000)
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "parking":
        return <Car className="h-4 w-4" />
      case "restaurant":
      case "organic restaurant":
        return <Coffee className="h-4 w-4" />
      case "gym":
        return <Dumbbell className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
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
          <Link href="/">
            <Button variant="outline" size="sm" className="border-gray-300 bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Choose Your Hotel</h1>
            <p className="text-gray-600">
              {tripData.destination} • {tripData.startDate} to {tripData.endDate} •{" "}
              {tripData.budget.charAt(0).toUpperCase() + tripData.budget.slice(1)} budget
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI is Finding Perfect Hotels</h3>
            <p className="text-gray-600">Searching the web for the best accommodations in {tripData.destination}...</p>
          </div>
        ) : (
          <>
            {/* Hotels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative ${selectedHotel?.id === hotel.id ? "ring-2 ring-blue-500" : ""}`}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-gray-200">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={`/grand-hotel.png?height=200&width=400&query=hotel%20${encodeURIComponent(hotel.name)}`}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/95 text-gray-900 font-medium">{hotel.price}</Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-white/95 text-gray-900 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                          {hotel.rating}
                        </Badge>
                      </div>
                      {selectedHotel?.id === hotel.id && (
                        <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                          <div className="bg-white rounded-full p-2">
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {hotel.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                          <MapPin className="h-4 w-4" />
                          {hotel.location}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{hotel.description}</p>
                      </div>

                      {/* Amenities */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-700"
                            >
                              {getAmenityIcon(amenity)}
                              <span>{amenity}</span>
                            </div>
                          ))}
                          {hotel.amenities.length > 4 && (
                            <div className="bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-700">
                              +{hotel.amenities.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleHotelSelect(hotel)}
                        className={`w-full transition-all duration-200 hover:scale-105 ${
                          selectedHotel?.id === hotel.id
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        disabled={selectedHotel?.id === hotel.id}
                      >
                        {selectedHotel?.id === hotel.id ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Selected
                          </>
                        ) : (
                          "Select Hotel"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Selection Info */}
            {selectedHotel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Hotel Selected!</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  You've selected <strong>{selectedHotel.name}</strong>. We're now generating a personalized itinerary
                  with activities near your hotel using AI.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Loader className="h-4 w-4 animate-spin" />
                  Redirecting to AI itinerary generation...
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
