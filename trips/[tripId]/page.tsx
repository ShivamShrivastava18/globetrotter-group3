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

type FullData = { trip: Trip; stops: TripStop[]; activities: Activity[] }

export default function TripDetailPage({ params }: { params: { tripId: string } }) {
  const { user } = useSupabaseUser()
  const supabase = getSupabaseClient()
  const [data, setData] = useState<FullData | null>(null)
  const [loading, setLoading] = useState(false)
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

  const costTotal = useMemo(
    () => (data?.activities ?? []).reduce((sum, a) => sum + (Number(a.estimated_cost) || 0), 0),
    [data],
  )

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
                <p className="text-gray-600">
                  {data.trip.start_date} – {data.trip.end_date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded border text-sm" onClick={onTogglePublic} disabled={isPending}>
                  {data.trip.is_public ? "Make Private" : "Make Public"}
                </button>
                <Link className="px-3 py-2 rounded border text-sm" href={`/trips/${data.trip.id}/builder`}>
                  Edit itinerary
                </Link>
                <Link className="px-3 py-2 rounded border text-sm" href={`/p/${data.trip.id}`}>
                  Public view
                </Link>
              </div>
            </section>

            <section className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-3">Trip timeline</h2>
                <InteractiveTimeline activities={data.activities} stops={data.stops} />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Budget overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Total activities: ${costTotal.toFixed(0)}</span>
                  </div>
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          dataKey="value"
                          data={[{ name: "Activities", value: costTotal || 0 }]}
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                        >
                          <Cell fill="#0ea5e9" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Daily breakdown</h2>
              <div className="rounded border divide-y">
                {data.stops.map((s, idx) => (
                  <div key={s.id} className="p-3">
                    <div className="font-medium mb-2">
                      Day {idx + 1} · {s.city}
                      {s.country ? `, ${s.country}` : ""}{" "}
                      <span className="text-xs text-gray-600 ml-2">
                        {s.start_date} – {s.end_date}
                      </span>
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
            </section>
          </>
        )}
      </main>
    </div>
  )
}
