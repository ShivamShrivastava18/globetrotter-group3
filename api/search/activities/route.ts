import { NextResponse } from "next/server"
import { ACTIVITIES } from "@/data/recommendations"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get("city")
  const q = (searchParams.get("q") ?? "").toLowerCase()
  const type = searchParams.get("type")
  const results = ACTIVITIES.filter((a) => {
    const okC = !city || a.city.toLowerCase() === city.toLowerCase()
    const okQ = !q || a.title.toLowerCase().includes(q)
    const okT = !type || a.type === type
    return okC && okQ && okT
  }).slice(0, 30)
  return NextResponse.json(results)
}
