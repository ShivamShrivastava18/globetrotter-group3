"use client"

import { useEffect, useState } from "react"
import AppHeader from "@/components/app-header"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Activity, Trip, TripStop } from "@/lib/types"
import InteractiveTimeline from "@/components/interactive-timeline"
import { Button } from "@/components/ui/button"
import { copyTripToUser } from "./server-actions"
import { useSupabaseUser } from "@/hooks/use-supabase-user"

type FullData = { trip: Trip; stops: TripStop[]; activities: Activity[] }

export default function PublicTripPage({ params }: { params: { tripId: string } }) {
  const supabase = getSupabaseClient()
  const { user } = useSupabaseUser()
  const [data, setData] = useState<FullData | null>(null)

  useEffect(() => {
    const run = async () => {
      const [{ data: t }, { data: s }, { data: a }] = await Promise.all([
        supabase.from("trips").select("*").eq("id", params.tripId).eq("is_public", true).single(),
        supabase.from("trip_stops").select("*").eq("trip_id", params.tripId).order("order_index"),
        supabase.from("activities").select("*").eq("trip_id", params.tripId).order("created_at"),
      ])
      if (t) setData({ trip: t, stops: s ?? [], activities: a ?? [] })
    }
    run()
  }, [supabase, params.tripId])

  async function onCopy() {
    if (!user || !data) return alert("Log in to copy this trip.")
    const res = await copyTripToUser(data.trip.id, user.id)
    if (res.error) alert(res.error)
    else window.location.href = `/trips/${res.id}`
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {!data ? (
          <p className="text-gray-700">Trip not found or not public.</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">{data.trip.name}</h1>
                <p className="text-gray-600">
                  {data.trip.start_date} – {data.trip.end_date}
                </p>
              </div>
              <Button onClick={onCopy} className="bg-sky-600 hover:bg-sky-700 text-white">
                Copy trip
              </Button>
            </div>
            <InteractiveTimeline activities={data.activities} stops={data.stops} />
          </>
        )}
      </main>
    </div>
  )
}
