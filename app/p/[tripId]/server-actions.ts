"use server"

import { getServiceRoleClient } from "@/lib/supabase/server"

export async function copyTripToUser(sourceTripId: string, userId: string) {
  const supabase = getServiceRoleClient()
  const { data: trip, error: tErr } = await supabase.from("trips").select("*").eq("id", sourceTripId).single()
  if (tErr || !trip) return { error: tErr?.message || "Trip not found" }

  const { data: stops } = await supabase.from("trip_stops").select("*").eq("trip_id", sourceTripId)
  const { data: acts } = await supabase.from("activities").select("*").eq("trip_id", sourceTripId)

  const { data: newTrip, error } = await supabase
    .from("trips")
    .insert({
      user_id: userId,
      name: trip.name,
      description: trip.description,
      start_date: trip.start_date,
      end_date: trip.end_date,
      cover_url: trip.cover_url,
      is_public: false,
    })
    .select("id")
    .single()
  if (error) return { error: error.message }

  // Map old stop ids to new
  const stopIdMap: Record<string, string> = {}
  for (const s of stops ?? []) {
    const { data: ns } = await supabase
      .from("trip_stops")
      .insert({
        trip_id: newTrip.id,
        city: s.city,
        country: s.country,
        lat: s.lat,
        lng: s.lng,
        start_date: s.start_date,
        end_date: s.end_date,
        order_index: s.order_index,
      })
      .select("id")
      .single()
    if (ns) stopIdMap[s.id] = ns.id
  }

  for (const a of acts ?? []) {
    await supabase.from("activities").insert({
      trip_id: newTrip.id,
      stop_id: a.stop_id ? stopIdMap[a.stop_id] : null,
      title: a.title,
      notes: a.notes,
      start_time: a.start_time,
      end_time: a.end_time,
      estimated_cost: a.estimated_cost,
      lat: a.lat,
      lng: a.lng,
      booking_url: a.booking_url,
    })
  }

  return { id: newTrip.id }
}

export async function addComment(tripId: string, userId: string, content: string) {
  const supabase = getServiceRoleClient()

  try {
    const { data, error } = await supabase
      .from("trip_comments")
      .insert({
        trip_id: tripId,
        user_id: userId,
        content: content,
      })
      .select("id")
      .single()

    if (error) {
      return { error: error.message }
    }

    return { success: true, id: data.id }
  } catch (error: any) {
    return { error: error.message || "Failed to add comment" }
  }
}

export async function toggleLike(tripId: string, userId: string) {
  const supabase = getServiceRoleClient()

  try {
    // Check if user already liked this trip
    const { data: existingLike } = await supabase
      .from("trip_likes")
      .select("id")
      .eq("trip_id", tripId)
      .eq("user_id", userId)
      .single()

    if (existingLike) {
      // Unlike - remove the like
      const { error } = await supabase.from("trip_likes").delete().eq("id", existingLike.id)

      if (error) {
        return { error: error.message }
      }

      return { success: true, action: "unliked" }
    } else {
      // Like - add the like
      const { data, error } = await supabase
        .from("trip_likes")
        .insert({
          trip_id: tripId,
          user_id: userId,
        })
        .select("id")
        .single()

      if (error) {
        return { error: error.message }
      }

      return { success: true, action: "liked", id: data.id }
    }
  } catch (error: any) {
    return { error: error.message || "Failed to toggle like" }
  }
}
