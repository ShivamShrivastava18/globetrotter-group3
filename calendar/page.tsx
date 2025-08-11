"use client"

import AppHeader from "@/components/app-header"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useEffect, useMemo, useState } from "react"
import type { Trip } from "@/lib/types"

function monthName(d: Date) {
  return d.toLocaleString("default", { month: "long", year: "numeric" })
}
function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

export default function CalendarPage() {
  const { user } = useSupabaseUser()
  const supabase = getSupabaseClient()
  const [trips, setTrips] = useState<Trip[]>([])
  const [refDate, setRefDate] = useState(new Date())

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const { data } = await supabase.from("trips").select("*").eq("user_id", user.id)
      setTrips(data ?? [])
    }
    load()
  }, [user, supabase])

  const cells = useMemo(() => {
    const count = daysInMonth(refDate)
    return Array.from({ length: count }, (_, i) => new Date(refDate.getFullYear(), refDate.getMonth(), i + 1))
  }, [refDate])

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <button
            className="px-3 py-1 rounded border"
            onClick={() => setRefDate(new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1))}
          >
            Prev
          </button>
          <h1 className="text-xl font-semibold">Calendar · {monthName(refDate)}</h1>
          <button
            className="px-3 py-1 rounded border"
            onClick={() => setRefDate(new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1))}
          >
            Next
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((d, idx) => (
            <div key={idx} className="rounded border min-h-[90px] p-2 text-sm">
              <div className="text-xs text-gray-600">{d.getDate()}</div>
              <div className="space-y-1 mt-1">
                {trips
                  .filter((t) => {
                    const s = new Date(t.start_date)
                    const e = new Date(t.end_date)
                    return d >= s && d <= e
                  })
                  .map((t) => (
                    <div key={t.id} className="truncate rounded bg-sky-100 text-sky-800 px-1 py-0.5">
                      {t.name}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
