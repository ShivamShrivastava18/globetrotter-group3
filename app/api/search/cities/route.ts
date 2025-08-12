import { NextResponse } from "next/server"
import { CITIES } from "@/data/recommendations"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") ?? "").toLowerCase()
  const region = searchParams.get("region")
  const expense = searchParams.get("expense")
  const results = CITIES.filter((c) => {
    const okQ = !q || c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    const okR = !region || c.region === region
    const okE = !expense || c.expense === expense
    return okQ && okR && okE
  }).slice(0, 20)
  return NextResponse.json(results)
}
