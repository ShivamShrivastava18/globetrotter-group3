import { NextResponse } from "next/server"
import { serverTripOverview } from "@/lib/ai"

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json()
    const summary = await serverTripOverview(name, description)
    return NextResponse.json({ summary })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "AI error" }, { status: 500 })
  }
}
