"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, DollarSign } from "lucide-react"
import type { Activity, TripStop } from "@/lib/types"

type Props = { activities: Activity[]; stops: TripStop[] }

const dayColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-teal-500",
  "bg-cyan-500",
]

export default function InteractiveTimeline({ activities, stops }: Props) {
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null)
  const orderedStops = useMemo(() => [...stops].sort((a, b) => a.order_index - b.order_index), [stops])

  const grouped = useMemo(() => {
    const m: Record<string, Activity[]> = {}
    for (const a of activities) {
      if (!a.stop_id) continue
      m[a.stop_id] = m[a.stop_id] || []
      m[a.stop_id].push(a)
    }
    Object.values(m).forEach((arr) => arr.sort((x, y) => (x.start_time || "").localeCompare(y.start_time || "")))
    return m
  }, [activities])

  if (orderedStops.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No stops planned yet</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Trip Timeline</h3>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-green-400 rounded-full" />

        {/* Timeline items */}
        <div className="space-y-8">
          {orderedStops.map((stop, stopIndex) => {
            const dayIndex = stopIndex
            const colorClass = dayColors[dayIndex % dayColors.length]
            const stopActivities = grouped[stop.id] || []

            return (
              <div key={stop.id} className="relative flex items-start">
                {/* Day marker */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`h-12 w-12 rounded-full border-4 border-white shadow-lg ${colorClass} flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-sm">{dayIndex + 1}</span>
                  </div>
                </div>

                {/* Day content */}
                <div className="ml-6 flex-1 min-w-0">
                  <div className="bg-white rounded-lg border shadow-sm p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {stop.city}
                      {stop.country && `, ${stop.country}`}
                    </h4>

                    {/* Activities for this day */}
                    {stopActivities.length > 0 && (
                      <div className="space-y-2">
                        {stopActivities.map((activity, actIndex) => {
                          const isHovered = hoveredActivity === `${activity.id}-${actIndex}`

                          return (
                            <div key={activity.id} className="relative">
                              <button
                                className={`w-full text-left p-3 rounded-md border-2 transition-all duration-200 hover:shadow-md ${colorClass.replace("bg-", "border-")} border-opacity-20 hover:border-opacity-40 bg-gray-50 hover:bg-white`}
                                onMouseEnter={() => setHoveredActivity(`${activity.id}-${actIndex}`)}
                                onMouseLeave={() => setHoveredActivity(null)}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900">{activity.title}</span>
                                  <div className="flex items-center gap-3 text-sm text-gray-600">
                                    {activity.start_time && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{activity.start_time}</span>
                                      </div>
                                    )}
                                    {activity.estimated_cost != null && (
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span>{activity.estimated_cost}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>

                              {isHovered && activity.description && (
                                <div className="absolute left-full ml-4 top-0 w-64 p-3 bg-white border shadow-xl rounded-lg z-50">
                                  <div className="space-y-2">
                                    <h5 className="font-bold text-base text-gray-900">{activity.title}</h5>
                                    <p className="text-sm text-gray-600">{activity.description}</p>

                                    <div className="flex items-center justify-between text-sm">
                                      {activity.start_time && (
                                        <div className="flex items-center gap-1 text-gray-600">
                                          <Clock className="h-4 w-4" />
                                          <span className="font-medium">{activity.start_time}</span>
                                        </div>
                                      )}
                                      {activity.estimated_cost != null && (
                                        <div className="flex items-center gap-1 text-gray-600">
                                          <DollarSign className="h-4 w-4" />
                                          <span className="font-medium">{activity.estimated_cost}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {/* Tooltip arrow */}
                                  <div className="absolute top-4 left-0 transform -translate-x-full w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white"></div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {stopActivities.length === 0 && <p className="text-gray-500 text-sm">No activities planned</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
