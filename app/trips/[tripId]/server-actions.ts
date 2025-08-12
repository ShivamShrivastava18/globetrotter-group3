"use server"

import { getServiceRoleClient } from "@/lib/supabase/server"

export async function togglePublic(trip_id: string, isPublic: boolean) {
  const supabase = getServiceRoleClient()
  const { error } = await supabase.from("trips").update({ is_public: isPublic }).eq("id", trip_id)
  if (error) return { error: error.message }
  return { ok: true }
}
