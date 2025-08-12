"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { motion } from "framer-motion"
import { MapPin, Calendar, DollarSign, Sparkles, ArrowRight } from "lucide-react"

type Props = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  prefilledDestination?: string
  prefilledBudget?: string
}

export default function CreateTripModal({ isOpen, setIsOpen, prefilledDestination, prefilledBudget }: Props) {
  const { user } = useSupabaseUser()
  const [destination, setDestination] = useState(prefilledDestination || "")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [budget, setBudget] = useState(prefilledBudget || "medium")

  useEffect(() => {
    if (prefilledDestination) {
      setDestination(prefilledDestination)
    }
    if (prefilledBudget) {
      setBudget(prefilledBudget)
    }
  }, [prefilledDestination, prefilledBudget])

  const handleNext = () => {
    if (!destination || !startDate || !endDate) {
      alert("Please fill in all required fields.")
      return
    }

    if (!user) {
      alert("You must be logged in to create a trip.")
      return
    }

    // Navigate to hotel selection with trip data
    const tripData = {
      destination,
      startDate,
      endDate,
      budget,
    }

    // Store trip data in sessionStorage for the hotel selection page
    sessionStorage.setItem("tripData", JSON.stringify(tripData))

    // Navigate to hotel selection page
    window.location.href = "/trips/new/hotels"
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      if (!prefilledDestination) {
        setDestination("")
      }
      if (!prefilledBudget) {
        setBudget("medium")
      }
      setStartDate("")
      setEndDate("")
    }, 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 max-h-[90vh] overflow-y-auto border-gray-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              Plan Your Trip
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Tell us about your destination and we'll find the perfect hotels and activities for you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="destination" className="text-sm font-medium flex items-center gap-1 text-gray-700">
                <MapPin className="h-4 w-4 text-blue-600" />
                Destination *
              </Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g., Paris, France"
                className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium flex items-center gap-1 text-gray-700">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                  End Date *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="budget" className="text-sm font-medium flex items-center gap-1 text-gray-700">
                <DollarSign className="h-4 w-4 text-orange-600" />
                Budget Range
              </Label>
              <div className="mt-2 space-y-3">
                {[
                  { value: "low", label: "Low", desc: "Budget-friendly options (under $100/night)" },
                  { value: "medium", label: "Medium", desc: "Mid-range comfort ($100-300/night)" },
                  { value: "high", label: "High", desc: "Luxury and premium options ($300+/night)" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      budget === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="budget"
                      value={option.value}
                      checked={budget === option.value}
                      onChange={(e) => setBudget(e.target.value)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium transition-all duration-200 hover:scale-105"
              size="lg"
            >
              Find Hotels
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
