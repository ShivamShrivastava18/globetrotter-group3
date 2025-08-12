"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import AppHeader from "@/components/app-header"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader, MapPin, Clock, DollarSign } from "lucide-react"
import type { Trip, TripStop, Activity } from "@/lib/types"

type FullData = { trip: Trip; stops: TripStop[]; activities: Activity[] }

export default function EditTripPage() {
  const params = useParams()
  const tripId = params.tripId as string
  const { user } = useSupabaseUser()
  const supabase = getSupabaseClient()

  const [data, setData] = useState<FullData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    location: "",
    duration: "",
    estimated_cost: "",
    stop_id: "",
  })

  useEffect(() => {
    if (user && tripId) {
      loadTripData()
    }
  }, [user, tripId])

  const loadTripData = async () => {
    try {
      const [{ data: t }, { data: s }, { data: a }] = await Promise.all([
        supabase.from("trips").select("*").eq("id", tripId).eq("user_id", user?.id).single(),
        supabase.from("trip_stops").select("*").eq("trip_id", tripId).order("order_index"),
        supabase.from("activities").select("*").eq("trip_id", tripId).order("created_at"),
      ])

      if (t) {
        setData({ trip: t, stops: s ?? [], activities: a ?? [] })
        // Set first stop as default for new activities
        if (s && s.length > 0) {
          setNewActivity((prev) => ({ ...prev, stop_id: s[0].id }))
        }
      }
    } catch (error) {
      console.error("Error loading trip data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddActivity = async () => {
    if (!newActivity.title.trim() || !newActivity.stop_id) return

    setSaving(true)
    try {
      const { data: activity, error } = await supabase
        .from("activities")
        .insert({
          trip_id: tripId,
          stop_id: newActivity.stop_id,
          title: newActivity.title,
          description: newActivity.description || null,
          location: newActivity.location || null,
          duration: newActivity.duration || null,
          estimated_cost: newActivity.estimated_cost ? Number.parseFloat(newActivity.estimated_cost) : null,
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      if (data && activity) {
        setData({
          ...data,
          activities: [...data.activities, activity],
        })
      }

      // Reset form
      setNewActivity({
        title: "",
        description: "",
        location: "",
        duration: "",
        estimated_cost: "",
        stop_id: data?.stops[0]?.id || "",
      })
    } catch (error) {
      console.error("Error adding activity:", error)
      alert("Failed to add activity. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const getStopName = (stopId: string) => {
    const stop = data?.stops.find((s) => s.id === stopId)
    return stop ? `${stop.city}${stop.country ? `, ${stop.country}` : ""}` : "Unknown"
  }

  const getStopDay = (stopId: string) => {
    const stopIndex = data?.stops.findIndex((s) => s.id === stopId)
    return stopIndex !== undefined && stopIndex >= 0 ? stopIndex + 1 : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        </main>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h2>
            <p className="text-gray-600">This trip doesn't exist or you don't have permission to edit it.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Trip</h1>
            <p className="text-gray-600 mt-1">{data.trip.name}</p>
          </div>
        </div>

        {/* Add New Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Add New Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Activity Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Visit Eiffel Tower"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="stop">Day/Location *</Label>
                <Select
                  value={newActivity.stop_id}
                  onValueChange={(value) => setNewActivity({ ...newActivity, stop_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.stops.map((stop, index) => (
                      <SelectItem key={stop.id} value={stop.id}>
                        Day {index + 1}: {stop.city}
                        {stop.country ? `, ${stop.country}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Specific Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Champ de Mars"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 2 hours"
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cost">Estimated Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="0"
                  value={newActivity.estimated_cost}
                  onChange={(e) => setNewActivity({ ...newActivity, estimated_cost: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add any notes or details about this activity..."
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                rows={3}
              />
            </div>
            <Button
              onClick={handleAddActivity}
              disabled={!newActivity.title.trim() || !newActivity.stop_id || saving}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Adding Activity...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Current Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Current Activities ({data.activities.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {data.activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p>No activities added yet</p>
                <p className="text-sm">Add your first activity above to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.activities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            Day {getStopDay(activity.stop_id)}
                          </span>
                          <h3 className="font-medium text-gray-900">{activity.title}</h3>
                        </div>
                        {activity.description && <p className="text-gray-600 text-sm mb-2">{activity.description}</p>}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {activity.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{activity.location}</span>
                            </div>
                          )}
                          {activity.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{activity.duration}</span>
                            </div>
                          )}
                          {activity.estimated_cost && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>${activity.estimated_cost}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
