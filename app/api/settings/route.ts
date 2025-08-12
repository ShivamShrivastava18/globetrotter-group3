import { NextResponse } from "next/server"
import { getServiceRoleClient } from "@/lib/supabase/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = getServiceRoleClient()
    const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching settings:", error)
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }

    const defaultSettings = {
      email_notifications: true,
      push_notifications: true,
      privacy_public_profile: true,
      language: "en",
      timezone: "UTC",
    }

    return NextResponse.json(data || defaultSettings)
  } catch (error: any) {
    console.error("Settings API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let settingsData
    try {
      settingsData = await req.json()
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError)
      return NextResponse.json({ error: "Invalid JSON data" }, { status: 400 })
    }

    const userId = session.user.id

    const { data, error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        ...settingsData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error updating settings:", error)
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
