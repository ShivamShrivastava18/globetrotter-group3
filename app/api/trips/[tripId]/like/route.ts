import { NextResponse } from "next/server"
import { getServiceRoleClient } from "@/lib/supabase/server"

export async function POST(req: Request, { params }: { params: { tripId: string } }) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = getServiceRoleClient()

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("trip_likes")
      .select("id")
      .eq("trip_id", params.tripId)
      .eq("user_id", userId)
      .single()

    if (existingLike) {
      // Unlike
      await supabase.from("trip_likes").delete().eq("trip_id", params.tripId).eq("user_id", userId)
    } else {
      // Like
      await supabase.from("trip_likes").insert({ trip_id: params.tripId, user_id: userId })
    }

    // Get updated like count
    const { count } = await supabase
      .from("trip_likes")
      .select("*", { count: "exact", head: true })
      .eq("trip_id", params.tripId)

    return NextResponse.json({
      liked: !existingLike,
      count: count || 0,
    })
  } catch (error: any) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { tripId: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    const supabase = getServiceRoleClient()

    // Get like count
    const { count } = await supabase
      .from("trip_likes")
      .select("*", { count: "exact", head: true })
      .eq("trip_id", params.tripId)

    let isLiked = false
    if (userId) {
      const { data } = await supabase
        .from("trip_likes")
        .select("id")
        .eq("trip_id", params.tripId)
        .eq("user_id", userId)
        .single()

      isLiked = !!data
    }

    return NextResponse.json({
      count: count || 0,
      liked: isLiked,
    })
  } catch (error: any) {
    console.error("Error fetching like status:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
