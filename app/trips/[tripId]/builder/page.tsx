"use client"

import { useEffect, useState, useMemo } from "react"
import AppHeader from "@/components/app-header"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Trip, TripStop, Activity } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addStop, reorderStops, removeStop, addActivity, removeActivity, autoEstimateCosts } from "./server-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type City = {
  city: string
  country: string
  region: string
  subregion: string
  rating: number
  expense: string
  image: string
}
type ActivityMeta = {
  city: string
  title: string
  type: string
  avg_cost: number
  duration_hours: number
  image: string
  website?: string
}

export default function BuilderPage({ params }: { params: { tripId: string } }) {
  const { user } = useSupabaseUser()
  const supabase = getSupabaseClient()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [stops, setStops] = useState<TripStop[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [cityQuery, setCityQuery] = useState("")
  const [cityResults, setCityResults] = useState<City[]>([])
  const [activityResults, setActivityResults] = useState<ActivityMeta[]>([])
  const [activityQuery, setActivityQuery] = useState("")
  const [selectedStop, setSelectedStop] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const [{ data: t }, { data: s }, { data: a }] = await Promise.all([
        supabase.from("trips").select("*").eq("id", params.tripId).eq("user_id", user.id).single(),
        supabase.from("trip_stops").select("*").eq("trip_id", params.tripId).order("order_index"),
        supabase.from("activities").select("*").eq("trip_id", params.tripId).order("created_at"),
      ])
      if (t) setTrip(t)
      setStops(s ?? [])
      setActivities(a ?? [])
    }
    load()
  }, [user, supabase, params.tripId])

  useEffect(() => {
    const run = async () => {
      if (!cityQuery) {
        setCityResults([])
        return
      }
      const res = await fetch(`/api/search/cities?q=${encodeURIComponent(cityQuery)}`)
      setCityResults(await res.json())
    }
    run()
  }, [cityQuery])

  useEffect(() => {
    const run = async () => {
      if (!selectedStop) {
        setActivityResults([])
        return
      }
      const stop = stops.find((s) => s.id === selectedStop)
      const params = new URLSearchParams()
      if (stop) params.set("city", stop.city)
      if (activityQuery) params.set("q", activityQuery)
      if (filterType !== "all") params.set("type", filterType)
      const res = await fetch(`/api/search/activities?${params.toString()}`)
      setActivityResults(await res.json())
    }
    run()
  }, [selectedStop, activityQuery, filterType, stops])

  async function onAddStop(city: City) {
    const formData = new FormData()
    formData.set("trip_id", params.tripId)
    formData.set("city", city.city)
    formData.set("country", city.country)
    formData.set("start_date", trip?.start_date ?? "")
    formData.set("end_date", trip?.end_date ?? "")
    const res = await addStop(formData)
    if (res.error) return alert(res.error)
    setStops((prev) => [...prev, res.stop!].sort((a, b) => a.order_index - b.order_index))
    setSelectedStop(res.stop!.id)
  }

  async function onReorderStop(id: string, direction: "up" | "down") {
    const idx = stops.findIndex((s) => s.id === id)
    const newIdx = direction === "up" ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= stops.length) return
    const ordered = [...stops]
    const [moved] = ordered.splice(idx, 1)
    ordered.splice(newIdx, 0, moved)
    const payload = ordered.map((s, i) => ({ id: s.id, order_index: i }))
    const res = await reorderStops(params.tripId, payload)
    if (res.error) return alert(res.error)
    setStops(ordered.map((s, i) => ({ ...s, order_index: i })))
  }

  async function onRemoveStop(id: string) {
    const res = await removeStop(id)
    if (res.error) return alert(res.error)
    setStops((prev) => prev.filter((s) => s.id !== id))
    if (selectedStop === id) setSelectedStop(null)
  }

  async function onAddActivity(meta: ActivityMeta) {
    if (!selectedStop) return alert("Select a stop first.")
    const form = new FormData()
    form.set("trip_id", params.tripId)
    form.set("stop_id", selectedStop)
    form.set("title", meta.title)
    form.set("estimated_cost", String(meta.avg_cost))
    const res = await addActivity(form)
    if (res.error) return alert(res.error)
    setActivities((prev) => [...prev, res.activity!])
  }

  async function onRemoveActivity(id: string) {
    const res = await removeActivity(id)
    if (res.error) return alert(res.error)
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }

  async function onAutoEstimate() {
    const res = await autoEstimateCosts(params.tripId)
    if (res.error) return alert(res.error)
    // reload activities with new costs
    const { data } = await getSupabaseClient().from("activities").select("*").eq("trip_id", params.tripId)
    setActivities(data ?? [])
  }

  const activitiesByStop = useMemo(() => {
    const map: Record<string, Activity[]> = {}
    for (const a of activities) {
      if (!a.stop_id) continue
      map[a.stop_id] = map[a.stop_id] || []
      map[a.stop_id].push(a)
    }
    return map
  }, [activities])

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Itinerary builder</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onAutoEstimate}>
              Auto-estimate budget
            </Button>
            <Button
              className="bg-sky-600 hover:bg-sky-700 text-white"
              onClick={() => (window.location.href = `/trips/${params.tripId}`)}
            >
              View itinerary
            </Button>
          </div>
        </div>

        <section className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Stops</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Input
                  placeholder="Search cities..."
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                />
              </div>
              {cityResults.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {cityResults.map((c) => (
                    <div key={c.city} className="rounded border p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {c.city}, {c.country}
                        </div>
                        <div className="text-xs text-gray-600">
                          {c.region} · {c.expense}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => onAddStop(c)} className="bg-sky-600 hover:bg-sky-700 text-white">
                        Add stop
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="divide-y rounded border">
                {stops.map((s, idx) => (
                  <div key={s.id} className="p-3 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onReorderStop(s.id, "up")}
                          className="text-sm text-gray-600 hover:text-sky-700"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => onReorderStop(s.id, "down")}
                          className="text-sm text-gray-600 hover:text-sky-700"
                        >
                          ↓
                        </button>
                        <div className="font-medium">
                          {idx + 1}. {s.city}
                          {s.country ? `, ${s.country}` : ""}
                        </div>
                        <button
                          onClick={() => onRemoveStop(s.id)}
                          className="text-xs text-red-600 hover:underline ml-2"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {s.start_date} – {s.end_date}
                      </div>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant={selectedStop === s.id ? "default" : "outline"}
                          onClick={() => setSelectedStop(s.id)}
                        >
                          {selectedStop === s.id ? "Selected" : "Select for activities"}
                        </Button>
                      </div>
                      {activitiesByStop[s.id]?.length ? (
                        <ul className="mt-2 space-y-1 text-sm">
                          {activitiesByStop[s.id].map((a) => (
                            <li key={a.id} className="flex items-center justify-between">
                              <span>
                                {a.title}
                                {a.estimated_cost != null ? ` · $${a.estimated_cost}` : ""}
                              </span>
                              <button
                                onClick={() => onRemoveActivity(a.id)}
                                className="text-xs text-red-600 hover:underline"
                              >
                                remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">Select a stop to search activities for that city.</div>
              <Input
                placeholder="Search activities..."
                value={activityQuery}
                onChange={(e) => setActivityQuery(e.target.value)}
              />
              <Select value={filterType} onValueChange={(v) => setFilterType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sightseeing">Sightseeing</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="culture">Culture</SelectItem>
                  <SelectItem value="nature">Nature</SelectItem>
                  <SelectItem value="nightlife">Nightlife</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {activityResults.map((a) => (
                  <div key={`${a.city}-${a.title}`} className="rounded border p-3">
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-gray-600">
                      {a.city} · {a.type} · ~${a.avg_cost}
                    </div>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        onClick={() => onAddActivity(a)}
                        className="bg-sky-600 hover:bg-sky-700 text-white"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
                {selectedStop && activityResults.length === 0 && (
                  <div className="text-sm text-gray-600">No results. Try another query or type.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
