"use client"

import AppHeader from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Activity, Trip, TripStop } from "@/lib/types"
import InteractiveTimeline from "@/components/interactive-timeline"
import { useEffect, useMemo, useState, useTransition } from "react"
import { DollarSign } from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import Link from "next/link"
import { togglePublic } from "./server-actions"
import { formatDate, formatDateRange } from "@/lib/utils"

type FullData = { trip: Trip; stops: TripStop[]; activities: Activity[] }

const dayColors = [
  "#3B82F6", // blue-500
  "#10B981", // green-500
  "#8B5CF6", // purple-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#06B6D4", // cyan-500
  "#EC4899", // pink-500
  "#6366F1", // indigo-500
]

export default function TripDetailPage({ params }: { params: { tripId: string } }) {
  const { user } = useSupabaseUser()
  const supabase = getSupabaseClient()
  const [data, setData] = useState<FullData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      const [{ data: t }, { data: s }, { data: a }] = await Promise.all([
        supabase.from("trips").select("*").eq("id", params.tripId).single(),
        supabase.from("trip_stops").select("*").eq("trip_id", params.tripId).order("order_index"),
        supabase.from("activities").select("*").eq("trip_id", params.tripId).order("created_at"),
      ])
      if (t) setData({ trip: t, stops: s ?? [], activities: a ?? [] })
      setLoading(false)
    }
    run()
  }, [supabase, params.tripId])

  const budgetData = useMemo(() => {
    if (!data) return []

    const stopCosts: Record<string, number> = {}
    const orderedStops = [...data.stops].sort((a, b) => a.order_index - b.order_index)

    orderedStops.forEach((stop) => {
      stopCosts[stop.id] = 0
    })

    data.activities.forEach((activity) => {
      if (activity.stop_id && activity.estimated_cost) {
        stopCosts[activity.stop_id] = (stopCosts[activity.stop_id] || 0) + Number(activity.estimated_cost)
      }
    })

    return orderedStops
      .map((stop, index) => ({
        name: `Day ${index + 1}: ${stop.city}`,
        value: stopCosts[stop.id] || 0,
        fill: dayColors[index % dayColors.length],
      }))
      .filter((item) => item.value > 0)
  }, [data])

  const costTotal = useMemo(() => budgetData.reduce((sum, item) => sum + item.value, 0), [budgetData])

  function onTogglePublic() {
    if (!data) return
    startTransition(async () => {
      const res = await togglePublic(data.trip.id, !data.trip.is_public)
      if (!("error" in res)) setData({ ...data, trip: { ...data.trip, is_public: !data.trip.is_public } })
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {loading || !data ? (
          <p className="text-gray-700">Loading...</p>
        ) : (
          <>
            <section className="flex flex-col md:flex-row gap-6 md:items-end">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold">{data.trip.name}</h1>
                <p className="text-gray-600">{formatDateRange(data.trip.start_date, data.trip.end_date)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded border text-sm" onClick={onTogglePublic} disabled={isPending}>
                  {data.trip.is_public ? "Make Private" : "Make Public"}
                </button>
                <Link className="px-3 py-2 rounded border text-sm" href={`/trips/${data.trip.id}/builder`}>
                  Edit itinerary
                </Link>
                {data.trip.is_public && (
                  <Link className="px-3 py-2 rounded border text-sm" href={`/p/${data.trip.id}`}>
                    Public view
                  </Link>
                )}
              </div>
            </section>

            <section className="grid lg:grid-cols-2 gap-8">
              <div>
                <InteractiveTimeline activities={data.activities} stops={data.stops} />
              </div>

              <div className="space-y-6">
                {/* Daily breakdown */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Daily breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.stops.map((s, idx) => (
                        <div key={s.id} className="border-l-4 border-blue-200 pl-4">
                          <div className="font-medium mb-2">
                            Day {idx + 1} · {s.city}
                            {s.country ? `, ${s.country}` : ""}{" "}
                            <span className="text-xs text-gray-600 ml-2">{formatDate(s.start_date)}</span>
                          </div>
                          <ul className="space-y-1">
                            {data.activities
                              .filter((a) => a.stop_id === s.id)
                              .map((a) => (
                                <li key={a.id} className="flex items-center justify-between text-sm">
                                  <span>{a.title}</span>
                                  <span className="text-gray-600">${a.estimated_cost ?? 0}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Budget overview */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Budget overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Total activities: ${costTotal.toFixed(0)}</span>
                    </div>
                    {budgetData.length > 0 ? (
                      <div style={{ width: "100%", height: 220 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie dataKey="value" data={budgetData} innerRadius={60} outerRadius={90} paddingAngle={2}>
                              {budgetData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [`$${value.toFixed(0)}`, "Cost"]}
                              labelFormatter={(label) => label}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[220px] flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No budget data available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
