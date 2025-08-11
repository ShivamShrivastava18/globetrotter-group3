import { NextResponse } from "next/server"
import { CITIES } from "@/data/recommendations"

export async function GET(req: Request) {
  // Optional: if you later expose a Python recommender, set RECOMMENDER_URL and we’ll proxy.
  const pythonUrl = process.env.RECOMMENDER_URL
  const { searchParams } = new URL(req.url)
  const region = searchParams.get("region") || undefined
  const expense = searchParams.get("expense") || undefined
  const limit = Number(searchParams.get("limit") || 8)
  try {
    if (pythonUrl) {
      const u = new URL(pythonUrl + "/recommend")
      if (region) u.searchParams.set("region", region)
      if (expense) u.searchParams.set("expense", expense!)
      u.searchParams.set("limit", String(limit))
      const res = await fetch(u)
      if (res.ok) return NextResponse.json(await res.json())
    }
  } catch {}
  // Fallback ranking: rating desc, expense match first
  const filtered = CITIES.filter((c) => (!region || c.region === region) && (!expense || c.expense === expense))
  const ranked = filtered.sort((a, b) => b.rating - a.rating).slice(0, limit)
  return NextResponse.json(ranked)
}
