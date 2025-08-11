"use server"

import { getServiceRoleClient } from "@/lib/supabase/server"

export async function addStop(formData: FormData) {
  const supabase = getServiceRoleClient()
  const trip_id = String(formData.get("trip_id"))
  const { data: existing } = await supabase
    .from("trip_stops")
    .select("order_index")
    .eq("trip_id", trip_id)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextIndex = (existing?.order_index ?? -1) + 1
  const payload = {
    trip_id,
    city: String(formData.get("city")),
    country: String(formData.get("country") || ""),
    start_date: String(formData.get("start_date")),
    end_date: String(formData.get("end_date")),
    order_index: nextIndex,
  }
  const { data, error } = await supabase.from("trip_stops").insert(payload).select("*").single()
  if (error) return { error: error.message }
  return { stop: data }
}

export async function reorderStops(trip_id: string, order: { id: string; order_index: number }[]) {
  const supabase = getServiceRoleClient()
  const updates = order.map((o) => supabase.from("trip_stops").update({ order_index: o.order_index }).eq("id", o.id))
  for (const u of updates) await u
  return { ok: true }
}

export async function removeStop(stop_id: string) {
  const supabase = getServiceRoleClient()
  const { error } = await supabase.from("trip_stops").delete().eq("id", stop_id)
  if (error) return { error: error.message }
  return { ok: true }
}

export async function addActivity(formData: FormData) {
  const supabase = getServiceRoleClient()
  const payload = {
    trip_id: String(formData.get("trip_id")),
    stop_id: String(formData.get("stop_id")),
    title: String(formData.get("title")),
    estimated_cost: Number(formData.get("estimated_cost") || 0),
  }
  const { data, error } = await supabase.from("activities").insert(payload).select("*").single()
  if (error) return { error: error.message }
  return { activity: data }
}

export async function removeActivity(activity_id: string) {
  const supabase = getServiceRoleClient()
  const { error } = await supabase.from("activities").delete().eq("id", activity_id)
  if (error) return { error: error.message }
  return { ok: true }
}

export async function autoEstimateCosts(trip_id: string) {
  // Simple baseline: if cost null, set to city avg based on type; here we just fill missing with median 30
  const supabase = getServiceRoleClient()
  const { data: acts } = await supabase.from("activities").select("id,estimated_cost").eq("trip_id", trip_id)
  const updates = (acts ?? [])
    .filter((a) => a.estimated_cost == null)
    .map((a) => supabase.from("activities").update({ estimated_cost: 30 }).eq("id", a.id))
  for (const u of updates) await u
  return { ok: true }
}
