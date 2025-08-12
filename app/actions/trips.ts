"use server"

import { getServiceRoleClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type Itinerary = {
  stops: {
    day: number
    title: string
    activities: {
      title: string
      start_time: string
      description: string
      estimated_cost: number
    }[]
  }[]
}

type TripPayload = {
  user_id: string
  name: string
  start_date: string
  end_date: string
  destination: string
  itinerary: Itinerary
}

export async function createTripWithItinerary(payload: TripPayload): Promise<{ id?: string; error?: string }> {
  const supabase = getServiceRoleClient()
  try {
    // 1. Create the main trip
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .insert({
        user_id: payload.user_id,
        name: payload.name,
        description: `An AI-generated trip to ${payload.destination}.`,
        start_date: payload.start_date,
        end_date: payload.end_date,
        is_public: false,
      })
      .select("id")
      .single()

    if (tripError) throw tripError

    const tripId = tripData.id

    // 2. Create stops and activities
    for (const stop of payload.itinerary.stops) {
      const stopDate = new Date(payload.start_date)
      stopDate.setDate(stopDate.getDate() + stop.day - 1)

      const { data: stopData, error: stopError } = await supabase
        .from("trip_stops")
        .insert({
          trip_id: tripId,
          city: stop.title, // Using day title as the "city" for the stop
          start_date: stopDate.toISOString().split("T")[0],
          end_date: stopDate.toISOString().split("T")[0],
          order_index: stop.day,
        })
        .select("id")
        .single()

      if (stopError) throw stopError
      const stopId = stopData.id

      const activitiesToInsert = stop.activities.map((activity) => ({
        trip_id: tripId,
        stop_id: stopId,
        title: activity.title,
        notes: activity.description,
        start_time: activity.start_time,
        estimated_cost: activity.estimated_cost,
      }))

      const { error: activityError } = await supabase.from("activities").insert(activitiesToInsert)
      if (activityError) throw activityError
    }

    revalidatePath("/trips")
    return { id: tripId }
  } catch (e: any) {
    return { error: e.message ?? "Failed to create trip with itinerary" }
  }
}
