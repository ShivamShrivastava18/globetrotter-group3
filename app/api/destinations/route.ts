import { NextResponse } from "next/server"
import { getServiceRoleClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const region = searchParams.get("region")
    const priceRange = searchParams.get("price_range")
    const search = searchParams.get("search")

    const supabase = getServiceRoleClient()
    let query = supabase.from("destinations").select("*")

    if (region && region !== "all") {
      query = query.eq("region", region)
    }

    if (priceRange && priceRange !== "all") {
      query = query.eq("price_range", priceRange)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,country.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 })
    }

    // Randomize the order
    const shuffled = data?.sort(() => Math.random() - 0.5) || []

    return NextResponse.json(shuffled)
  } catch (error: any) {
    console.error("Error fetching destinations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
